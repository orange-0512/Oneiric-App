import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, TextInput, Dimensions, FlatList, Modal } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getDreams, toggleDreamFavorite, deleteDream, seedDreams } from './services/storage';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function DiaryPage({ showFavoritesOnly, viewMode = 'list', onViewModeChange, onEditDream, initialDreamId, onCloseDream }) {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);

  const fetchDreams = async () => {
    try {
      await seedDreams(); // Seed data if empty
      const storedDreams = await getDreams();
      // Sort by date (newest first)
      const sortedDreams = storedDreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDreams(sortedDreams);
    } catch (error) {
      console.error('Failed to fetch dreams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDreams();
  }, [showFavoritesOnly]);

  useEffect(() => {
    if (initialDreamId && dreams.length > 0) {
      const targetDream = dreams.find(d => d.id === initialDreamId);
      if (targetDream) {
        setSelectedDream(targetDream);
        setDetailModalVisible(true);
      }
    }
  }, [initialDreamId, dreams]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDreams();
  }, []);

  const handleToggleFavorite = async (id) => {
    try {
      const updatedDreams = await toggleDreamFavorite(id);
      const sortedDreams = updatedDreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDreams(sortedDreams);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteDream = async (id) => {
    try {
      const updatedDreams = await deleteDream(id);
      const sortedDreams = updatedDreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDreams(sortedDreams);
    } catch (error) {
      console.error('Failed to delete dream:', error);
    }
  };

  const renderRightActions = (progress, dragX, id) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDeleteDream(id)}
      >
        <Feather name="trash-2" size={24} color="#FFF" />
        <Text style={styles.deleteText}>刪除</Text>
      </TouchableOpacity>
    );
  };

  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = 
      dream.title.includes(searchQuery) || 
      dream.summary.includes(searchQuery) ||
      (dream.tags && dream.tags.some(tag => tag.includes(searchQuery)));
    
    const matchesFavorite = showFavoritesOnly ? dream.isFavorite : true;
    
    const matchesDate = selectedDate 
      ? (dream.date && dream.date.replace(/\s/g, '').includes(selectedDate.replace(/\s/g, ''))) 
      : true;

    return matchesSearch && matchesFavorite && matchesDate;
  });

  // --- Calendar Logic ---
  const renderCalendar = () => {
    // Generate last 12 months or current year
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(d);
    }

    return (
      <ScrollView 
        contentContainerStyle={styles.calendarScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {months.map((date, index) => renderMonth(date, index))}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const renderMonth = (date, index) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

    const days = [];
    // Empty slots for start of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <View key={index} style={styles.monthCard}>
        <Text style={styles.monthTitle}>{year} {String(month + 1).padStart(2, '0')}</Text>
        <View style={styles.weekHeader}>
          {['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'].map((d, i) => (
            <Text key={d} style={[styles.weekDayText, (i === 0 || i === 6) && { color: '#FF6B6B' }]}>{d}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, idx) => renderDay(day, idx))}
        </View>
      </View>
    );
  };

  const renderDay = (day, index) => {
    if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

    // Check if dream exists for this day
    const dateStr = `${day.getFullYear()} / ${String(day.getMonth() + 1).padStart(2, '0')} / ${String(day.getDate()).padStart(2, '0')}`;
    
    const hasDream = dreams.find(d => {
       if (!d.date) return false;
       // Robust comparison: remove all spaces
       return d.date.replace(/\s/g, '').includes(dateStr.replace(/\s/g, ''));
    });

    return (
      <View key={index} style={styles.dayCell}>
        {hasDream ? (
          <TouchableOpacity 
            style={styles.dreamThumbnail}
            onPress={() => {
              setSelectedDream(hasDream);
              setDetailModalVisible(true);
            }}
          >
              {hasDream.generatedImage === 'PENDING' ? (
                <View style={styles.generatingThumbnail}>
                  <Image source={require('./assets/home_mascot.png')} style={styles.generatingMascotSmall} resizeMode="contain" />
                </View>
              ) : (
                <Image 
                  source={hasDream.generatedImage ? { uri: hasDream.generatedImage } : require('./assets/home_mascot.png')} 
                  style={styles.thumbnailImage} 
                  resizeMode="cover" 
                />
              )}
           </TouchableOpacity>
        ) : (
           <Text style={styles.dayNumber}>{day.getDate()}</Text>
        )}
      </View>
    );
  };

  const renderList = () => (
    <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C4BFF" />
        }
      >
        {selectedDate && (
          <View style={styles.filterHeader}>
            <Text style={styles.filterText}>📅 {selectedDate}</Text>
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
               <Feather name="x-circle" size={20} color="#7C4BFF" />
            </TouchableOpacity>
          </View>
        )}

        {filteredDreams.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Image source={require('./assets/home_mascot.png')} style={styles.emptyMascot} resizeMode="contain" />
            <Text style={styles.emptyText}>
              {showFavoritesOnly ? '沒有收藏的夢境' : (selectedDate ? '這天沒有紀錄夢境' : '沒有找到相關夢境')}
            </Text>
          </View>
        ) : (
          filteredDreams.map((dream) => (
            <Swipeable
              key={dream.id}
              renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, dream.id)}
              containerStyle={styles.swipeContainer}
            >
              <TouchableOpacity
                style={styles.dreamCard}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedDream(dream);
                  setDetailModalVisible(true);
                }}
              >
                {/* Left: Image */}
                <View style={styles.cardLeft}>
                   {dream.generatedImage === 'PENDING' ? (
                     <View style={styles.generatingContainer}>
                       <Image source={require('./assets/home_mascot.png')} style={styles.generatingMascot} resizeMode="contain" />
                       <Text style={styles.generatingText}>靈感圖{'\n'}生成中</Text>
                     </View>
                   ) : (
                     <Image
                       source={dream.generatedImage ? { uri: dream.generatedImage } : require('./assets/home_mascot.png')}
                       style={styles.cardImage}
                       resizeMode="cover"
                     />
                   )}
                </View>

                {/* Right: Content */}
                <View style={styles.cardRight}>
                  {/* Header: Date & Mood */}
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.dreamDate}>
                      {dream.date ? dream.date.match(/^[\d\s\/]+/)[0].trim() : format(new Date(dream.createdAt), 'yyyy / MM / dd')}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.dreamTitle} numberOfLines={1}>{dream.title}</Text>

                  {/* Summary */}
                  <Text style={styles.dreamContent} numberOfLines={2}>
                    {dream.summary}
                  </Text>

                  {/* Footer: Tags, Duration, Heart */}
                  {/* Footer: Tags, Duration, Heart */}
                  <View style={styles.cardFooter}>
                    {/* Row 1: Tags */}
                    <View style={styles.tagsRow}>
                      {dream.tags && dream.tags.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                      {dream.tags && dream.tags.length > 2 && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>+{dream.tags.length - 2}</Text>
                        </View>
                      )}
                    </View>

                    {/* Row 2: Duration & Heart */}
                    <View style={styles.bottomRow}>
                      {dream.duration ? (
                         <View style={styles.durationTag}>
                           <Text style={styles.tagText}>{dream.duration} HR</Text>
                         </View>
                      ) : <View />}

                      <TouchableOpacity
                        style={styles.heartButton}
                        onPress={() => handleToggleFavorite(dream.id)}
                      >
                        <MaterialCommunityIcons
                          name={dream.isFavorite ? "heart" : "heart-outline"}
                          size={24}
                          color="#B9B4FF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
  );

  return (
    <View style={styles.container}>
      {viewMode === 'list' && (
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#A3A3A3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="試著快速搜尋夢境, #快樂"
            placeholderTextColor="#A3A3A3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {viewMode === 'list' ? renderList() : renderCalendar()}

      
      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDream && (
                <>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalDate}>
                      {selectedDream.date ? selectedDream.date.match(/^[\d\s\/]+/)[0].trim() : format(new Date(selectedDream.createdAt), 'yyyy / MM / dd')}
                    </Text>
                    <View style={styles.modalMoodTag}>
                       <Text style={styles.modalMoodText}>
                         {selectedDream.mood === 'positive' ? '正向' : selectedDream.mood === 'negative' ? '負面' : '中性'}
                       </Text>
                    </View>
                  </View>

                  <Text style={styles.modalTitle}>{selectedDream.title}</Text>

                  {/* Image */}
                  <View style={styles.modalImageContainer}>
                    <Image 
                      source={selectedDream.generatedImage ? { uri: selectedDream.generatedImage } : require('./assets/home_mascot.png')} 
                      style={styles.modalImage} 
                      resizeMode="cover" 
                    />
                  </View>

                  {/* Content */}
                  <Text style={styles.modalBodyText}>{selectedDream.summary}</Text>

                  {/* Tags */}
                  <View style={styles.modalTagsRow}>
                    {selectedDream.tags && selectedDream.tags.map((tag, index) => (
                      <View key={index} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Footer Info */}
                  <View style={styles.modalFooterInfo}>
                    {selectedDream.duration ? (
                      <View style={styles.modalDurationTag}>
                        <Text style={styles.modalTagText}>{selectedDream.duration} HR</Text>
                      </View>
                    ) : null}
                    <MaterialCommunityIcons 
                      name={selectedDream.isFavorite ? "heart" : "heart-outline"} 
                      size={28} 
                      color="#B9B4FF" 
                    />
                  </View>
                  
                  {/* Edit Button */}
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      setDetailModalVisible(false);
                      onEditDream(selectedDream);
                    }}
                  >
                    <Feather name="edit-2" size={16} color="#FFF" />
                    <Text style={styles.editButtonText}>修改</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
          
          {/* Close Button - Moved outside modalContent */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setDetailModalVisible(false);
              if (onCloseDream) onCloseDream();
            }}
          >
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // White transparent
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50, // Fixed height for better control
    marginHorizontal: 24,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#4A4A4A', // Dark Grey
    paddingVertical: 0, // Reset padding
    height: '100%', // Fill container
    textAlignVertical: 'center', // Android vertical center
    // lineHeight: 20, // Removed lineHeight as it can cause issues on iOS with inputs
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyMascot: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#A3A3A3',
  },
  dreamCard: {
    backgroundColor: '#FFF1A8', // Yellow
    borderRadius: 24,
    padding: 16,
    // marginBottom: 16, // Moved to swipeContainer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row', // Horizontal layout
    gap: 16,
  },
  swipeContainer: {
    marginBottom: 16,
  },
  deleteAction: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 24,
    marginLeft: 8,
  },
  deleteText: {
    color: '#FFF',
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    marginTop: 4,
  },
  cardLeft: {
    width: 100,
    height: 140, 
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E8E2D2',
  },
  generatingContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#7C4BFF', // Purple
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingMascot: {
    width: '40%',
    height: '40%',
    marginBottom: 8,
  },
  generatingText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardRight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dreamDate: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#737373',
    marginBottom: 0, // Zero spacing
  },

  dreamTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
    marginBottom: 4,
    marginTop: 0, // Ensure no top margin
    lineHeight: 24,
  },
  dreamContent: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 13,
    color: '#4A4A4A',
    lineHeight: 18,
    marginBottom: 12,
    flex: 1,
  },
  cardFooter: {
    gap: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
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
  heartButton: {
    padding: 4,
  },
  durationTag: {
    backgroundColor: '#B9B4FF', // Purple
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Calendar Styles
  calendarScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  monthCard: {
    backgroundColor: '#E8E2D2', // Slightly darker beige for card
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 30,
  },
  monthTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 10,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekDayText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#4A4A4A',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#4A4A4A',
  },
  dreamThumbnail: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  generatingThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7C4BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingMascotSmall: {
    width: '70%',
    height: '70%',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8E2D2',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  filterText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#4A4A4A',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF1A8', // Yellow
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDate: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#737373',
  },
  modalMoodTag: {
    backgroundColor: '#B9B4FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalMoodText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#FFFFFF',
  },
  modalTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 24,
    color: '#000000',
    marginBottom: 24,
  },
  modalImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalBodyText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  modalTag: {
    backgroundColor: '#B9B4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalTagText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalFooterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalDurationTag: {
    backgroundColor: '#B9B4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4BFF',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  editButtonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 60, // Adjust for status bar
    right: 24,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark semi-transparent background
    borderRadius: 20,
    zIndex: 10,
  },
});

