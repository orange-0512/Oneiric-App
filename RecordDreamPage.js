import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import { generateDreamSummary } from './services/gemini';
import { saveDream, updateDream } from './services/storage';
import { generateDreamImage } from './services/replicate';
import { Image, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabase';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export default function RecordDreamPage({ onBack, onSave, initialData }) {
  const [dreamTitle, setDreamTitle] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [selectedMood, setSelectedMood] = useState('positive');
  
  // Audio State
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSummary, setAiSummary] = useState('尚未錄製夢境...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tags State
  const [tags, setTags] = useState(['惡夢', '清醒夢', '重複夢', '預知夢', '飛翔', '被追趕', '掉落']);
  const [selectedTags, setSelectedTags] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Date Picker State
  const [sleepTime, setSleepTime] = useState(null);
  const [wakeTime, setWakeTime] = useState(null);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  useEffect(() => {
    // Request permissions on mount
    Audio.requestPermissionsAsync();
    
    if (initialData) {
      // Edit Mode
      setDreamTitle(initialData.title);
      setAiSummary(initialData.summary);
      setSelectedMood(initialData.mood);
      setSelectedTags(initialData.tags || []);
      setGeneratedImage(initialData.generatedImage);
      if (initialData.sleepTime) setSleepTime(new Date(initialData.sleepTime));
      if (initialData.wakeTime) setWakeTime(new Date(initialData.wakeTime));
      // Also handle snake_case if coming directly from DB without mapping (just in case)
      if (initialData.sleep_time) setSleepTime(new Date(initialData.sleep_time));
      if (initialData.wake_time) setWakeTime(new Date(initialData.wake_time));
      
      setCurrentDate(initialData.date);
    } else {
      // New Mode
      const now = new Date();
      const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
      const dateStr = `${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${String(now.getDate()).padStart(2, '0')} ${days[now.getDay()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setCurrentDate(dateStr);
    }
    
    // Cleanup recording on unmount
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, [initialData]);

  const formatTime = (date) => {
    if (!date) return '-- : --';
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${String(hours).padStart(2, '0')}:${strMinutes} ${ampm}`;
  };

  const calculateDuration = () => {
    if (!sleepTime || !wakeTime) return '0.0';
    const diffMs = wakeTime - sleepTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs > 0 ? diffHrs.toFixed(1) : '0.0';
  };

  const handleSleepChange = (event, selectedDate) => {
    const currentDate = selectedDate || sleepTime || new Date();
    if (Platform.OS === 'android') {
      setShowSleepPicker(false);
    }
    setSleepTime(currentDate);
  };

  const handleWakeChange = (event, selectedDate) => {
    const currentDate = selectedDate || wakeTime || new Date();
    if (Platform.OS === 'android') {
      setShowWakePicker(false);
    }
    setWakeTime(currentDate);
  };

  const renderDatePicker = (visible, value, onChange, onClose) => {
    const dateValue = value || new Date();
    if (Platform.OS === 'ios') {
      return (
        <Modal
          transparent={true}
          animationType="slide"
          visible={visible}
          onRequestClose={onClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.datePickerDoneText}>完成</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="datetime"
                display="spinner"
                onChange={onChange}
                textColor="#000000"
                locale="zh-TW"
              />
            </View>
          </View>
        </Modal>
      );
    }

    // Android
    if (visible) {
      return (
        <DateTimePicker
          value={dateValue}
          mode="datetime"
          display="default"
          onChange={onChange}
        />
      );
    }
    return null;
  };

  const startRecording = async () => {
    try {
      // Ensure any existing recording is stopped
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( 
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setAiSummary('錄音中...');
    } catch (err) {
      console.error('Failed to start recording', err);
      setAiSummary('錄音失敗，請重試');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setIsRecording(false);
    
    const recording = recordingRef.current;
    if (!recording) {
      console.log('No recording to stop');
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); 
      console.log('Recording stopped and stored at', uri);
      recordingRef.current = null;

      setIsAnalyzing(true);
      setAiSummary('AI 正在聆聽並分析您的夢境...');

      const summary = await generateDreamSummary(uri);
      setAiSummary(summary);
      


    } catch (error) {
      console.error('Error stopping recording', error);
      setAiSummary('分析失敗');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiSummary || aiSummary === '尚未錄製夢境...') {
      Alert.alert('提示', '請先錄製夢境或輸入摘要');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateDreamImage(aiSummary);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Image generation failed:', error);
      Alert.alert('生成失敗', '請稍後再試');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleLongPressImage = async () => {
    if (!generatedImage) return;

    Alert.alert(
      "儲存圖片",
      "是否將此夢境繪圖儲存至相簿？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "儲存", 
          onPress: async () => {
            try {
              const { status } = await MediaLibrary.requestPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert("權限不足", "需要相簿權限才能儲存圖片");
                return;
              }

              let uriToSave = generatedImage;
              
              // If it's a remote URL, download it first
              if (generatedImage.startsWith('http')) {
                const fileUri = FileSystem.documentDirectory + 'dream_image_' + Date.now() + '.jpg';
                const { uri } = await FileSystem.downloadAsync(generatedImage, fileUri);
                uriToSave = uri;
              }

              await MediaLibrary.saveToLibraryAsync(uriToSave);
              Alert.alert("成功", "圖片已儲存至相簿");
            } catch (error) {
              console.error("Save image error:", error);
              Alert.alert("錯誤", "儲存圖片失敗");
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      const dreamData = {
        id: initialData ? initialData.id : undefined, // Pass ID if editing
        title: dreamTitle || '未命名夢境',
        date: currentDate,
        mood: selectedMood,
        summary: aiSummary,
        tags: selectedTags,
        sleepTime: sleepTime ? sleepTime.toISOString() : null,
        wakeTime: wakeTime ? wakeTime.toISOString() : null,
        sleepTime: sleepTime ? sleepTime.toISOString() : null,
        wakeTime: wakeTime ? wakeTime.toISOString() : null,
        duration: calculateDuration(),
        duration: calculateDuration(),
        generatedImage: generatedImage || 'PENDING',
      };
      
      let savedDream;
      if (initialData && initialData.id) {
        // Update existing dream
        savedDream = await updateDream(initialData.id, dreamData);
      } else {
        // Create new dream
        savedDream = await saveDream(dreamData);
      }
      
      console.log('Dream saved:', savedDream);
      // Pass ID, summary, and isEditing flag
      onSave(savedDream.id, aiSummary, !!initialData);
    } catch (error) {
      console.error('Failed to save dream:', error);
      Alert.alert('儲存失敗', error.message || '請稍後再試');
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Load user tags from Supabase
  useEffect(() => {
    const loadUserTags = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_tags')
          .select('tag_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          // If table doesn't exist yet, just ignore (user might not have run SQL)
          if (error.code === '42P01') return; 
          console.error('Error loading tags:', error);
          return;
        }

        if (data && data.length > 0) {
          const userTagNames = data.map(t => t.tag_name);
          // Merge with default tags, avoiding duplicates
          const uniqueTags = [...new Set([...tags, ...userTagNames])];
          setTags(uniqueTags);
        }
      } catch (error) {
        console.error('Error in loadUserTags:', error);
      }
    };

    loadUserTags();
  }, []);

  const addNewTag = async () => {
    if (newTag.trim()) {
      const tagName = newTag.trim();
      
      // Update local state first for immediate feedback
      if (!tags.includes(tagName)) {
        setTags([...tags, tagName]);
      }
      if (!selectedTags.includes(tagName)) {
        setSelectedTags([...selectedTags, tagName]);
      }
      
      setNewTag('');
      setModalVisible(false);

      // Save to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('user_tags')
            .insert([{ user_id: user.id, tag_name: tagName }]);
            
          if (error) {
            // If error (e.g. duplicate), just log it, don't block UI
            console.log('Error saving tag to Supabase:', error);
          }
        }
      } catch (error) {
        console.error('Error saving tag:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="夢境標題....."
          placeholderTextColor="#A3A3A3"
          value={dreamTitle}
          onChangeText={setDreamTitle}
        />
        <Text style={styles.dateText}>{currentDate}</Text>

        {/* Voice Record Section */}
        <View style={styles.voiceCard}>
          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
            onLongPress={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
          >
            <View style={styles.waveformContainer}>
              <View style={[styles.waveBar, isRecording && styles.waveBarRecording, { height: 10 }]} />
              <View style={[styles.waveBar, isRecording && styles.waveBarRecording, { height: 23 }]} />
              <View style={[styles.waveBar, isRecording && styles.waveBarRecording, { height: 16 }]} />
              <View style={[styles.waveBar, isRecording && styles.waveBarRecording, { height: 11 }]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.voiceText}>{isRecording ? '放開結束錄音...' : '按住開始說出夢境內容'}</Text>
        </View>

        {/* Dream Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardLabel}>夢境情緒</Text>
          <View style={styles.moodSelector}>
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'positive' && styles.moodButtonActive]}
              onPress={() => setSelectedMood('positive')}
            >
              <Text style={[styles.moodButtonText, selectedMood === 'positive' && styles.moodButtonTextActive]}>正向</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'neutral' && styles.moodButtonActive]}
              onPress={() => setSelectedMood('neutral')}
            >
              <Text style={[styles.moodButtonText, selectedMood === 'neutral' && styles.moodButtonTextActive]}>中性</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'negative' && styles.moodButtonActive]}
              onPress={() => setSelectedMood('negative')}
            >
              <Text style={[styles.moodButtonText, selectedMood === 'negative' && styles.moodButtonTextActive]}>負面</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardLabel}>夢境內容</Text>
          <View style={styles.summaryBox}>
            <TextInput
              style={styles.summaryInput}
              value={aiSummary}
              onChangeText={setAiSummary}
              multiline={true}
              scrollEnabled={false} // Let the view expand
            />
          </View>
          <View style={styles.imageSection}>
            {generatedImage ? (
              <View style={styles.generatedImageContainer}>
                <TouchableOpacity onLongPress={handleLongPressImage} activeOpacity={0.9}>
                  <Image source={{ uri: generatedImage }} style={styles.generatedImage} resizeMode="cover" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.regenerateButton} onPress={handleGenerateImage}>
                  <Feather name="refresh-cw" size={12} color="#FFF" />
                  <Text style={styles.regenerateText}>重新生成</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.generateButton} 
                onPress={handleGenerateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Feather name="image" size={16} color="#FFF" />
                    <Text style={styles.generateButtonText}>AI 生成夢境繪圖</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>




          <View style={styles.tagsHeader}>
            <Text style={styles.cardLabel}>標籤</Text>
            <TouchableOpacity style={styles.addTagButton} onPress={() => setModalVisible(true)}>
              <Feather name="plus" size={14} color="#7C4BFF" />
              <Text style={styles.addTagText}>自定義</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sleep Data Card */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <Text style={styles.cardLabel}>睡眠時間</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>總計 {calculateDuration()} 小時</Text>
            </View>
          </View>
          
          <View style={styles.timeButtonsContainer}>
            {/* Sleep Time Button */}
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowSleepPicker(true)}>
              <View style={styles.timeButtonHeader}>
                <Feather name="moon" size={16} color="#7C4BFF" />
                <Text style={styles.timeButtonLabel}>入睡時間</Text>
              </View>
              <View style={styles.timeButtonContent}>
                <Text style={styles.timeButtonValue}>{formatTime(sleepTime)}</Text>
                <Feather name="clock" size={20} color="#000" />
              </View>
            </TouchableOpacity>

            {/* Wake Time Button */}
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowWakePicker(true)}>
              <View style={styles.timeButtonHeader}>
                <Feather name="sun" size={16} color="#7C4BFF" />
                <Text style={styles.timeButtonLabel}>起床時間</Text>
              </View>
              <View style={styles.timeButtonContent}>
                <Text style={styles.timeButtonValue}>{formatTime(wakeTime)}</Text>
                <Feather name="clock" size={20} color="#000" />
              </View>
            </TouchableOpacity>
          </View>

          {renderDatePicker(
            showSleepPicker, 
            sleepTime, 
            handleSleepChange, 
            () => setShowSleepPicker(false)
          )}
          
          {renderDatePicker(
            showWakePicker, 
            wakeTime, 
            handleWakeChange, 
            () => setShowWakePicker(false)
          )}
        </View>

        {/* Done Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={handleSave}
          >
            <Text style={styles.doneButtonText}>完成</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Custom Tag Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增自定義標籤</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="輸入標籤名稱..."
              value={newTag}
              onChangeText={setNewTag}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonTextCancel}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonAdd} onPress={addNewTag}>
                <Text style={styles.modalButtonTextAdd}>新增</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5', // Beige background
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 16,
    alignItems: 'flex-start',
    marginTop: 35,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7C4BFF',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#7C4BFF',
    fontSize: 14,
  },
  titleInput: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 28,
    color: '#000000',
    marginBottom: 8,
    lineHeight: 40,
    paddingVertical: 0, 
    height: 60,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dateText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#A3A3A3',
    marginBottom: 24,
  },
  voiceCard: {
    backgroundColor: '#BFB4DC', // Lavender
    borderRadius: 24,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  voiceButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#E8E2D2', // Beige
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  voiceButtonRecording: {
    backgroundColor: '#7C4BFF', // Purple when recording
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#BFB4DC', // Default Lavender bars
    borderRadius: 3,
  },
  waveBarRecording: {
    backgroundColor: '#E8E2D2', // Beige bars when recording
  },
  voiceText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF', // White text
  },
  detailsCard: {
    backgroundColor: '#FFF1A8', // Yellow
    borderRadius: 24,
    padding: 24,
    marginBottom: 15,
  },
  cardLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  moodButton: {
    flex: 1,
    backgroundColor: '#BFB4DC', // Inactive Lavender
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  moodButtonActive: {
    backgroundColor: '#7C4BFF', // Active Purple
  },
  moodButtonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
  },
  moodButtonTextActive: {
    color: '#FFFFFF',
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    minHeight: 60,
  },
  summaryInput: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    textAlignVertical: 'top', // Android
  },
  imageSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#7C4BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#FFFFFF',
  },
  generatedImageContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  generatedImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E8E2D2',
  },
  regenerateButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  regenerateText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#FFFFFF',
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7C4BFF',
    gap: 4,
  },
  addTagText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#7C4BFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    backgroundColor: '#BFB4DC', // Inactive Lavender
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tagActive: {
    backgroundColor: '#7C4BFF', // Active Purple
  },
  tagText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  sleepCard: {
    backgroundColor: '#FFF1A8', // Yellow
    borderRadius: 24,
    padding: 24,
    marginBottom: 15,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7C4BFF',
  },
  durationText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#7C4BFF',
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#BFB4DC', // Lavender
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    height: 100,
  },
  timeButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeButtonLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF', // White text on purple
  },
  timeButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButtonValue: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#FFFFFF', // White text on purple
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: '#7C4BFF',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  doneButtonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Align to bottom for date picker
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center', // Center horizontally
    marginBottom: 'auto', // Push to center vertically if justifyContent is flex-end
    marginTop: 'auto',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerDoneText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#7C4BFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'jf-openhuninn-2.0',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  modalButtonAdd: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#7C4BFF',
  },
  modalButtonTextCancel: {
    fontFamily: 'jf-openhuninn-2.0',
    color: '#666',
  },
  modalButtonTextAdd: {
    fontFamily: 'jf-openhuninn-2.0',
    color: '#FFF',
  },
  modalButtonTextAdd: {
    fontFamily: 'jf-openhuninn-2.0',
    color: '#FFF',
  },

});
