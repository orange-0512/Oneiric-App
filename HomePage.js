import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar, updateAvatarUrl } from './services/userProfile';
import { supabase } from './lib/supabase';

const { width } = Dimensions.get('window');

const RAINBOW_QUOTES = [
  "「每天早晨我醒來，都喜悅地期待這一天會帶給我的禮物。」",
  "「我愛我自己，我接納我自己。」",
  "「我值得擁有美好的一切。」",
  "「我的生活充滿了愛與喜悅。」",
  "「我釋放所有的恐懼與懷疑。」"
];

import DiaryPage from './DiaryPage';
import SettingsPage from './SettingsPage';
import StatsPage from './StatsPage';

import { getLatestDream } from './services/storage';
import { getStats } from './services/stats';

export default function HomePage({ userData, onNavigate, initialDreamId, newDream, lastDreamUpdate, onUpdateNickname, language, setLanguage, t, onLogout }) {
  const [currentDate, setCurrentDate] = useState('');
  const [quote, setQuote] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [diaryViewMode, setDiaryViewMode] = useState('list'); // 'list' or 'calendar'
  const [latestDream, setLatestDream] = useState(null);
  const [targetDreamId, setTargetDreamId] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);

  useEffect(() => {
    if (initialDreamId) {
      setTargetDreamId(initialDreamId);
      setActiveTab('diary');
    }
  }, [initialDreamId]);

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  useEffect(() => {
    // Set Date
    const now = new Date();
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const dateStr = `${now.getFullYear()} / ${now.getMonth() + 1} / ${now.getDate()} ${days[now.getDay()]}`;
    setCurrentDate(dateStr);

    // Set Random Quote
    const randomQuote = RAINBOW_QUOTES[Math.floor(Math.random() * RAINBOW_QUOTES.length)];
    setQuote(randomQuote);

    // Fetch Latest Dream
    const fetchLatest = async () => {
      const dream = await getLatestDream();
      setLatestDream(dream);
    };
    fetchLatest();

    // Fetch Weekly Stats
    const fetchWeeklyStats = async () => {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      const stats = await getStats(start, end);
      setWeeklyStats(stats);
    };
    fetchWeeklyStats();
  }, [activeTab, newDream, lastDreamUpdate]); // Re-fetch when tab changes, new dream added, or dream updated

  const handleAvatarPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const publicUrl = await uploadAvatar(user.id, imageUri);
            await updateAvatarUrl(user.id, publicUrl);
            
            // Notify parent to refresh user data
            if (onUpdateNickname) {
               // We are hijacking this prop to trigger a refresh if possible, 
               // or we should add a proper onUpdateProfile prop.
               // For now, let's assume App.js passes a way to update user data.
               // Since we don't have a direct setAvatarUrl, we might need to reload.
               Alert.alert('成功', '頭像已更新');
            }
          }
        } catch (error) {
          console.error('Upload failed:', error);
          Alert.alert('上傳失敗', '請稍後再試');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('錯誤', '無法開啟相簿');
    }
  };

  const renderNavItem = (name, iconSource, tabName, isSpecial = false) => {
    const isActive = activeTab === tabName;
    return (
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => {
          if (isSpecial) {
            onNavigate('record');
          } else {
            setActiveTab(tabName);
            setTargetDreamId(null); // Clear target dream when switching tabs manually
          }
        }}
        activeOpacity={0.7}
      >
        <Image 
          source={iconSource} 
          style={[
            isSpecial ? styles.navIconSpecial : styles.navIcon, 
            !isSpecial && { tintColor: isActive ? '#FFFFFF' : '#BFB4DC' }
          ]} 
          resizeMode="contain"
        />
        {!isSpecial && (
          <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
            {name}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderHomeContent = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Rainbow Card Section */}
      <View style={styles.rainbowSection}>
        <Image source={require('./assets/home_mascot.png')} style={styles.mascot} resizeMode="contain" />
        <View style={styles.quoteBubble}>
          <Text style={styles.quoteTitle}>{t.home_rainbow_title}</Text>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      </View>

      {/* Weekly Sleep Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home_sleep_summary}</Text>
          <TouchableOpacity onPress={() => {
            setTargetDreamId(null);
            setActiveTab('stats');
          }}>
            <Text style={styles.seeAllText}>{t.home_see_all}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF1A8' }]}>
            <Text style={styles.summaryLabel}>{t.home_avg_sleep}</Text>
            <Text style={styles.summaryValue}>{weeklyStats ? weeklyStats.avgSleepDuration : '-'}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF1A8' }]}>
            <Text style={styles.summaryLabel}>{t.home_dream_count}</Text>
            <Text style={styles.summaryValue}>{weeklyStats ? weeklyStats.dreamCount : '-'}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF1A8' }]}>
            <Text style={styles.summaryLabel}>{t.home_dream_mood}</Text>
            <Text style={styles.summaryValue}>{weeklyStats ? weeklyStats.dominantEmotion : '-'}</Text>
          </View>
        </View>
      </View>

      {/* My Diary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home_my_diary}</Text>
          <TouchableOpacity onPress={() => {
            setTargetDreamId(null);
            setActiveTab('diary');
          }}>
            <Text style={styles.seeAllText}>{t.home_see_all}</Text>
          </TouchableOpacity>
        </View>
        <View style={latestDream && isToday(new Date(latestDream.createdAt)) ? styles.diaryCardFilled : styles.diaryCardEmpty}>
          {latestDream && isToday(new Date(latestDream.createdAt)) ? (
            <TouchableOpacity 
              style={styles.diaryContentRow} 
              onPress={() => {
                setTargetDreamId(latestDream.id);
                setActiveTab('diary');
              }}
            >
              <View style={styles.cardLeft}>
                {latestDream.generatedImage ? (
                  <Image 
                    source={{ uri: latestDream.generatedImage }} 
                    style={styles.diaryImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={styles.diaryPlaceholder}>
                    <Image source={require('./assets/home_mascot.png')} style={styles.placeholderMascot} resizeMode="contain" />
                    <Text style={styles.diaryPlaceholderText}>靈感圖{'\n'}生成中</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardRight}>
                <View>
                  <Text style={styles.dreamDate}>
                    {new Date(latestDream.createdAt).getFullYear()} / {new Date(latestDream.createdAt).getMonth() + 1} / {new Date(latestDream.createdAt).getDate()}
                  </Text>
                  <Text style={styles.dreamTitle} numberOfLines={1}>{latestDream.title}</Text>
                  <Text style={styles.dreamContent} numberOfLines={2}>{latestDream.summary}</Text>
                </View>
                
                <View style={styles.bottomRow}>
                  <View style={styles.tagsRow}>
                    {Array.isArray(latestDream.tags) && latestDream.tags.slice(0, 2).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                    {latestDream.duration ? (
                      <View style={styles.durationTag}>
                        <Text style={styles.tagText}>{latestDream.duration} HR</Text>
                      </View>
                    ) : null}
                  </View>
                  <MaterialCommunityIcons 
                    name={latestDream.isFavorite ? "heart" : "heart-outline"} 
                    size={24} 
                    color="#B9B4FF" 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.diaryContent}>
              <Image source={require('./assets/home_mascot.png')} style={styles.diaryMascot} resizeMode="contain" />
              <View style={styles.diaryTextContainer}>
                <Text style={styles.diaryEmptyText}>{t.home_diary_empty}</Text>
                <TouchableOpacity style={styles.startRecordButton} onPress={() => onNavigate('record')}>
                  <Text style={styles.startRecordText}>{t.home_start_record}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Daily Mood */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.home_mood_title}</Text>
        <View style={styles.moodContainer}>
          {[
            { label: t.home_mood_1, img: require('./assets/mood_1.png') },
            { label: t.home_mood_2, img: require('./assets/mood_2.png') },
            { label: t.home_mood_3, img: require('./assets/mood_3.png') },
            { label: t.home_mood_4, img: require('./assets/mood_4.png') },
            { label: t.home_mood_5, img: require('./assets/mood_5.png') }
          ].map((item, index) => (
            <View key={index} style={styles.moodItem}>
              <View style={styles.moodCircle}>
                <Image source={item.img} style={styles.moodImage} resizeMode="contain" />
              </View>
              <Text style={styles.moodLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Spacer for Bottom Nav */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, activeTab === 'settings' && styles.containerSettings]}>
      {/* Header Section - Persistent (Hidden on Settings) */}
      {/* Header Section - Persistent (Hidden on Settings) */}
      {activeTab === 'settings' ? null : (
        activeTab === 'diary' || activeTab === 'stats' ? (
          <View style={styles.headerContainer}>
            {activeTab === 'diary' ? (
              <View style={styles.diaryHeader}>
                <Text style={styles.pageTitle}>{t.home_tab_diary}</Text>
                <View style={styles.diaryControls}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => setDiaryViewMode(diaryViewMode === 'list' ? 'calendar' : 'list')}
                  >
                    <MaterialCommunityIcons 
                      name="calendar" 
                      size={24} 
                      color={diaryViewMode === 'calendar' ? "#7C4BFF" : "#B9B4FF"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  >
                    <MaterialCommunityIcons 
                      name={showFavoritesOnly ? "heart" : "heart-outline"} 
                      size={24} 
                      color={showFavoritesOnly ? "#7C4BFF" : "#B9B4FF"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            {/* Stats header is handled inside StatsPage or hidden entirely as requested */}
          </View>
        ) : (
          <View style={styles.headerContainer}>
              <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.dateText}>{currentDate}</Text>
                  <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
                    {t.home_greeting}{userData?.nickname || 'User Name'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
                  {userData?.avatar_url ? (
                    <Image source={{ uri: userData.avatar_url }} style={styles.avatar} />
                  ) : (
                    <Image source={require('./assets/default_avatar.png')} style={styles.avatar} />
                  )}
                </TouchableOpacity>
              </View>
          </View>
        )
      )}

      {activeTab === 'home' ? renderHomeContent() : null}
      {activeTab === 'diary' ? (
        <DiaryPage 
          showFavoritesOnly={showFavoritesOnly} 
          viewMode={diaryViewMode} 
          onViewModeChange={setDiaryViewMode}
          onEditDream={(dream) => onNavigate('record', { initialData: dream })}
          initialDreamId={targetDreamId}
          onCloseDream={() => setTargetDreamId(null)}
          t={t}
        />
      ) : null}
      {activeTab === 'stats' ? (
        <StatsPage t={t} userData={userData} currentDate={currentDate} />
      ) : null}
      {activeTab === 'settings' ? (
        <SettingsPage 
          userData={userData}
          onUpdateNickname={onUpdateNickname}
          onNavigate={onNavigate}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onLogout={onLogout}
        />
      ) : null}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {renderNavItem(t.home_tab_home, require('./assets/nav_home.png'), 'home')}
        {renderNavItem(t.home_tab_diary, require('./assets/nav_diary.png'), 'diary')}
        {renderNavItem(t.home_tab_add, require('./assets/nav_add.png'), 'record', true)}
        {renderNavItem(t.home_tab_stats, require('./assets/nav_stats.png'), 'stats')}
        {renderNavItem(t.home_tab_settings, require('./assets/nav_settings.png'), 'settings')}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5', // Beige background
  },
  containerSettings: {
    backgroundColor: '#BFB4DC', // Purple background for settings
  },
  content: {
    padding: 24,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8, // Reduced from 16
    backgroundColor: '#E8E3D5', // Match background
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  dateText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  greeting: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 28,
    color: '#000000',
    lineHeight: 40, // Added to prevent bottom clipping
  },
  headerTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
    width: 60,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4D4D4',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  rainbowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // Reduced from 32
  },
  mascot: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  quoteBubble: {
    flex: 1,
    backgroundColor: '#B9B4FF',
    borderRadius: 20,
    padding: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quoteText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24, // Reduced from 32
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 16
  },
  sectionTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
    marginBottom: 12, // Reduced from 16
  },
  seeAllText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#B9B4FF',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#737373',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
  },
  diaryCardEmpty: {
    backgroundColor: '#B9B4FF',
    borderRadius: 24,
    padding: 24,
    height: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diaryCardFilled: {
    backgroundColor: '#FFF1A8', // Yellow
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diaryContentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  diaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaryMascot: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  diaryTextContainer: {
    alignItems: 'flex-start',
  },
  diaryEmptyText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  startRecordButton: {
    backgroundColor: '#FFF1A8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  startRecordText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#000000',
  },
  moodContainer: {
    backgroundColor: '#BFB4DC', // Lavender background
    borderRadius: 360,
    padding: 12, // Reduced from 16
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodItem: {
    alignItems: 'center',
    gap: 6, // Reduced from 8
  },
  moodCircle: {
    width: 36, // Reduced from 48
    height: 36, // Reduced from 48
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodImage: {
    width: '100%',
    height: '100%',
  },
  moodLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 10, // Reduced from 12 (assumed)
    color: '#FFFFFF',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 30, // Increased from 24
    left: 24,
    right: 24,
    backgroundColor: '#7C4BFF', // Purple nav bar
    borderRadius: 32,
    height: 70, // Increased from 50
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#7C4BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navIconSpecial: {
    width: 40,
    height: 40,
  },
  navLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 10,
    color: '#BFB4DC',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
  cardLeft: {
    width: 100,
    height: 140,
  },
  diaryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E8E2D2',
  },
  cardRight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dreamDate: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#737373',
    marginBottom: 0,
  },
  dreamTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
    marginBottom: 4,
    lineHeight: 24,
  },
  dreamContent: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 13,
    color: '#4A4A4A',
    lineHeight: 18,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#B9B4FF', // Purple
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationTag: {
    backgroundColor: '#B9B4FF', // Purple
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 10,
    color: '#FFFFFF',
  },
  diaryPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DCD6F7', // Light purple
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  placeholderMascot: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  diaryPlaceholderText: {
    color: '#737373',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'jf-openhuninn-2.0',
    lineHeight: 16,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 24,
    color: '#000000',
  },
  diaryControls: {
    flexDirection: 'row',
    gap: 16,
  },
});
