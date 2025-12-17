import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from './lib/supabase';

export default function TagManagementPage({ onBack, t }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_tags')
        .insert([{ user_id: user.id, tag_name: newTag.trim() }])
        .select();

      if (error) throw error;
      
      setTags([...tags, data[0]]);
      setNewTag('');
      Alert.alert('成功', '標籤已新增');
    } catch (error) {
      console.error('Error adding tag:', error);
      if (error.code === '42P01' || (error.message && error.message.includes('relation "public.user_tags" does not exist'))) {
        Alert.alert('資料庫尚未設定', '請先執行 setup_database.sql 以創建必要的資料庫表格。');
      } else {
        Alert.alert('錯誤', '新增標籤失敗');
      }
    }
  };

  const updateTag = async (tagId) => {
    if (!editingText.trim()) return;

    try {
      const { error } = await supabase
        .from('user_tags')
        .update({ tag_name: editingText.trim() })
        .eq('id', tagId);

      if (error) throw error;

      setTags(tags.map(tag => 
        tag.id === tagId ? { ...tag, tag_name: editingText.trim() } : tag
      ));
      setEditingTag(null);
      setEditingText('');
      Alert.alert('成功', '標籤已更新');
    } catch (error) {
      console.error('Error updating tag:', error);
      Alert.alert('錯誤', '更新標籤失敗');
    }
  };

  const deleteTag = async (tagId) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除此標籤嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_tags')
                .delete()
                .eq('id', tagId);

              if (error) throw error;

              setTags(tags.filter(tag => tag.id !== tagId));
              Alert.alert('成功', '標籤已刪除');
            } catch (error) {
              console.error('Error deleting tag:', error);
              Alert.alert('錯誤', '刪除標籤失敗');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#7C4BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>標籤管理</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add New Tag */}
        <View style={styles.addTagSection}>
          <TextInput
            style={styles.addTagInput}
            placeholder="輸入新標籤..."
            value={newTag}
            onChangeText={setNewTag}
            placeholderTextColor="#A3A3A3"
          />
          <TouchableOpacity style={styles.addButton} onPress={addTag}>
            <Feather name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Tags List */}
        <View style={styles.tagsList}>
          {tags.map((tag) => (
            <View key={tag.id} style={styles.tagItem}>
              {editingTag === tag.id ? (
                <View style={styles.editingRow}>
                  <TextInput
                    style={styles.editInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => updateTag(tag.id)}
                  >
                    <Feather name="check" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setEditingTag(null);
                      setEditingText('');
                    }}
                  >
                    <Feather name="x" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.tagRow}>
                  <Text style={styles.tagName}>{tag.tag_name}</Text>
                  <View style={styles.tagActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        setEditingTag(tag.id);
                        setEditingText(tag.tag_name);
                      }}
                    >
                      <Feather name="edit-2" size={18} color="#7C4BFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteTag(tag.id)}
                    >
                      <Feather name="trash-2" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {tags.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="tag" size={48} color="#B9B4FF" />
            <Text style={styles.emptyText}>尚無自訂標籤</Text>
            <Text style={styles.emptyHint}>新增標籤後可在記錄夢境時使用</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  addTagSection: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  addTagInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#7C4BFF',
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsList: {
    gap: 12,
  },
  tagItem: {
    backgroundColor: '#FFF1A8',
    borderRadius: 12,
    padding: 16,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagName: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  tagActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  editingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#737373',
    marginTop: 16,
  },
  emptyHint: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#A3A3A3',
    marginTop: 8,
  },
});
