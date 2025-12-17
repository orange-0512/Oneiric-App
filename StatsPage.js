import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Modal, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { getStats } from './services/stats';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

export default function StatsPage({ t, userData }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date Range State
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('start'); // 'start' or 'end'
  const [tempDate, setTempDate] = useState(new Date());
  
  const [showTagOverlay, setShowTagOverlay] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getStats(startDate, endDate);
    setStats(data);
    setLoading(false);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (selectedDate) {
            if (pickerMode === 'start') setStartDate(selectedDate);
            else setEndDate(selectedDate);
        }
    } else {
        const currentDate = selectedDate || tempDate;
        setTempDate(currentDate);
    }
  };

  const confirmIOSDate = () => {
    if (pickerMode === 'start') setStartDate(tempDate);
    else setEndDate(tempDate);
    setShowDatePicker(false);
    // Re-open range modal so user can continue editing
    setTimeout(() => setShowRangeModal(true), 300);
  };

  const openDatePicker = (mode) => {
    setPickerMode(mode);
    setTempDate(mode === 'start' ? startDate : endDate);
    setShowRangeModal(false); // Close range modal to show picker
    setShowDatePicker(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#7C4BFF" />
        <Text style={styles.loadingText}>分析夢境數據中...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>暫無數據</Text>
      </View>
    );
  }
  
  // --- Components ---

  const SummaryRow = () => (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>平均睡眠時長</Text>
        <Text style={styles.summaryValue}>{stats.avgSleepDuration}<Text style={styles.summaryUnit}>hr</Text></Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>夢境次數</Text>
        <Text style={styles.summaryValue}>{stats.dreamCount}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>夢境情緒</Text>
        <Text style={styles.summaryValueText}>{stats.dominantEmotion}</Text>
      </View>
    </View>
  );

  const MoodTrendCard = () => {
    const dateLabel = `${format(startDate, 'MM/dd')} - ${format(endDate, 'MM/dd')}`;
    const dataLength = stats.moodTrend.length;
    const chartWidth = 260; // 300 - 20 - 20
    const stepX = dataLength > 1 ? chartWidth / (dataLength - 1) : chartWidth;

    const getY = (score) => {
      if (!score) return 90; 
      if (score >= 3) return 50;
      if (score <= 1) return 130;
      return 90;
    };

    let dPath = `M20 ${getY(stats.moodTrend[0])}`;
    for (let i = 1; i < dataLength; i++) {
      const x = 20 + i * stepX;
      const y = getY(stats.moodTrend[i]);
      const prevX = 20 + (i - 1) * stepX;
      const prevY = getY(stats.moodTrend[i - 1]);
      dPath += ` C ${prevX + stepX/2} ${prevY}, ${x - stepX/2} ${y}, ${x} ${y}`;
    }

    return (
      <View style={styles.purpleCard}>
        <View style={styles.cardHeaderRow}>
          <View />
          <TouchableOpacity 
            style={styles.datePill} 
            onPress={() => setShowRangeModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.datePillText}>{dateLabel}</Text>
            <Feather name="chevron-down" size={12} color="#FFF" style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 150, width: '100%', marginTop: 10 }}>
          <Svg height="100%" width="100%" viewBox="0 0 300 150">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#7C4BFF" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#7C4BFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>

            <Path d="M20 30 H280" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            <Path d="M20 70 H280" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            <Path d="M20 110 H280" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />

            <Path 
              d={`${dPath} V 130 H 20 Z`} 
              fill="url(#grad)" 
            />

            <Path 
              d={dPath}
              fill="none" 
              stroke="#7C4BFF" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            
            <G y="140">
               {stats.dateLabels.map((d, i) => {
                 const showLabel = dataLength <= 7 || i === 0 || i === dataLength - 1 || i % Math.ceil(dataLength/5) === 0;
                 if (!showLabel) return null;
                 
                 return (
                   <SvgText 
                     key={i} 
                     fill="#999" 
                     fontSize="10" 
                     x={20 + i * stepX} 
                     textAnchor="middle"
                   >
                     {d}
                   </SvgText>
                 );
               })}
            </G>
          </Svg>
        </View>
        
        <Text style={styles.insightText}>
          {stats.aiInsight.analysis.split('。')[0]}。
        </Text>
      </View>
    );
  };

  const EmotionDistributionCard = () => {
    const c = 251;
    const pPos = (stats.emotionDistribution.positive / 100) * c;
    const pNeu = (stats.emotionDistribution.neutral / 100) * c;
    const pNeg = (stats.emotionDistribution.negative / 100) * c;
    
    return (
      <View style={[styles.purpleCard, styles.rowCard]}>
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Svg height="120" width="120" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" stroke="#EEE" strokeWidth="20" fill="none" />
            
            {stats.emotionDistribution.positive > 0 && (
              <Circle 
                cx="50" cy="50" r="40" 
                stroke="#DCD6F7" strokeWidth="20" 
                strokeDasharray={`${pPos} ${c}`} 
                rotation="-90" origin="50, 50" 
                fill="none" strokeLinecap="round" 
              />
            )}
            
            {stats.emotionDistribution.neutral > 0 && (
              <Circle 
                cx="50" cy="50" r="40" 
                stroke="#9E86FF" strokeWidth="20" 
                strokeDasharray={`${pNeu} ${c}`} 
                rotation={-90 + (stats.emotionDistribution.positive / 100) * 360} 
                origin="50, 50" 
                fill="none" strokeLinecap="round" 
              />
            )}

            {stats.emotionDistribution.negative > 0 && (
              <Circle 
                cx="50" cy="50" r="40" 
                stroke="#7C4BFF" strokeWidth="20" 
                strokeDasharray={`${pNeg} ${c}`} 
                rotation={-90 + ((stats.emotionDistribution.positive + stats.emotionDistribution.neutral) / 100) * 360} 
                origin="50, 50" 
                fill="none" strokeLinecap="round" 
              />
            )}
            
            <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
               <Text style={styles.donutCenterText}>情緒{'\n'}分佈</Text>
            </View>
          </Svg>
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#DCD6F7' }]} />
            <Text style={styles.legendLabel}>正向</Text>
            <Text style={styles.legendValue}>{stats.emotionDistribution.positive}%</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#9E86FF' }]} />
            <Text style={styles.legendLabel}>中性</Text>
            <Text style={styles.legendValue}>{stats.emotionDistribution.neutral}%</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#7C4BFF' }]} />
            <Text style={styles.legendLabel}>負面</Text>
            <Text style={styles.legendValue}>{stats.emotionDistribution.negative}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const ImageryRankingCard = () => (
    <View style={styles.purpleCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardInternalTitle}>重複夢象排行榜</Text>
        {stats.topTags.length > 3 && (
          <TouchableOpacity onPress={() => setShowTagOverlay(true)}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {stats.topTags.length > 0 ? (
        stats.topTags.slice(0, 3).map((item, i) => (
          <View key={i} style={styles.rankingItem}>
            <Text style={styles.rankingLabel}>{item.tag}</Text>
            <Text style={styles.rankingValue}>{item.count} times</Text>
          </View>
        ))
      ) : (
        <Text style={styles.insightText}>尚無足夠數據</Text>
      )}
    </View>
  );

  const SleepRecordCard = () => {
    const getColor = (emotion) => {
      switch (emotion) {
        case 'positive': return '#DCD6F7'; 
        case 'neutral': return '#9E86FF';  
        case 'negative': return '#7C4BFF'; 
        default: return '#9E86FF';
      }
    };

    return (
      <View style={styles.purpleCard}>
        {stats.sleepRecord.map((item, i) => {
          const hours = (item.duration / 10).toFixed(1);
          
          return (
            <View key={i} style={styles.sleepRow}>
              <Text style={styles.sleepDayLabel}>{item.day}</Text>
              <View style={styles.sleepBarContainer}>
                <View style={[styles.sleepBarFill, { width: `${item.duration}%`, backgroundColor: getColor(item.emotion) }]} />
                {item.duration > 0 && (
                  <Text style={styles.sleepDurationText}>{hours}h</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const AIInsightsCard = () => (
    <View style={styles.purpleCard}>
      <Text style={styles.cardInternalTitle}>AI深度洞察</Text>
      <Text style={styles.aiText}>
        <Text style={{fontWeight: 'bold'}}>本週夢境總結：</Text>{'\n'}
        {stats.aiInsight.summary}{'\n\n'}
        <Text style={{fontWeight: 'bold'}}>精神狀況分析：</Text>{'\n'}
        {stats.aiInsight.analysis}{'\n\n'}
        <Text style={{fontWeight: 'bold'}}>建議：</Text>{'\n'}
        {stats.aiInsight.suggestion}
      </Text>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>夢境數據報告</Text>

        <SummaryRow />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>心情趨勢</Text>
          <MoodTrendCard />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>夢境情緒與夢象</Text>
          <EmotionDistributionCard />
          <View style={{ height: 16 }} />
          <ImageryRankingCard />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠記錄</Text>
          <SleepRecordCard />
        </View>

        <AIInsightsCard />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
            <Modal visible={showDatePicker} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={styles.datePickerCancel}>取消</Text>
                            </TouchableOpacity>
                            <Text style={styles.datePickerTitle}>
                                {pickerMode === 'start' ? '選擇開始日期' : '選擇結束日期'}
                            </Text>
                            <TouchableOpacity onPress={confirmIOSDate}>
                                <Text style={styles.datePickerConfirm}>確定</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="inline"
                            onChange={onDateChange}
                            style={{height: 320, width: '100%'}}
                            themeVariant="light"
                        />
                    </View>
                </View>
            </Modal>
        ) : (
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={onDateChange}
            />
        )
      )}

      {/* Range Selector Modal */}
      <Modal visible={showRangeModal} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowRangeModal(false)}
        >
          <View style={styles.datePickerContainer}>
            <Text style={styles.modalTitle}>選擇日期區間</Text>
            
            <TouchableOpacity style={styles.rangeRow} onPress={() => openDatePicker('start')}>
              <Text style={styles.rangeLabel}>開始日期</Text>
              <View style={styles.rangeValueContainer}>
                <Text style={styles.rangeValue}>{format(startDate, 'yyyy/MM/dd')}</Text>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rangeRow} onPress={() => openDatePicker('end')}>
              <Text style={styles.rangeLabel}>結束日期</Text>
              <View style={styles.rangeValueContainer}>
                <Text style={styles.rangeValue}>{format(endDate, 'yyyy/MM/dd')}</Text>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setShowRangeModal(false)}
            >
              <Text style={styles.confirmButtonText}>完成</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tag Ranking Overlay */}
      <Modal visible={showTagOverlay} transparent animationType="fade">
        <View style={styles.tagOverlayContainer}>
          <View style={styles.tagOverlayContent}>
            <View style={styles.tagOverlayHeader}>
              <Text style={styles.tagOverlayTitle}>重複夢象排行榜</Text>
              <TouchableOpacity onPress={() => setShowTagOverlay(false)}>
                <Feather name="x" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {stats.topTags.map((item, i) => (
                <View key={i} style={styles.rankingItemLarge}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.rankingLabelLarge}>{item.tag}</Text>
                  <Text style={styles.rankingValueLarge}>{item.count} times</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5',
  },
  content: {
    padding: 24,
    paddingTop: 20,
  },
  pageTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 24,
    color: '#000000',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FCEFA5',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 11,
    color: '#737373',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  summaryValueText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  summaryUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    marginLeft: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  purpleCard: {
    backgroundColor: '#C5BCE3', // Matching the image's light purple
    borderRadius: 24,
    padding: 20,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  datePill: {
    backgroundColor: '#7C4BFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  insightText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#737373',
    marginTop: 10,
    textAlign: 'center',
  },
  donutCenterText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  legendContainer: {
    justifyContent: 'center',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#555',
    width: 40,
  },
  legendValue: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  cardInternalTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#000',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  rankingItem: {
    backgroundColor: '#FCEFA5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankingLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#000',
  },
  rankingValue: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#555',
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepDayLabel: {
    width: 30,
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#737373',
  },
  sleepBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
  },
  sleepBarFill: {
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
  },
  sleepDurationText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 10,
    color: '#555',
    marginLeft: 8,
    zIndex: 1,
  },
  aiText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#000',
    lineHeight: 18,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#7C4BFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: 500,
  },
  modalTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  datePickerTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  datePickerCancel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#9CA3AF',
  },
  datePickerConfirm: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#7C4BFF',
    fontWeight: 'bold',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rangeLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000',
  },
  rangeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeValue: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#7C4BFF',
    marginRight: 8,
  },
  confirmButton: {
    marginTop: 24,
    backgroundColor: '#7C4BFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  tagOverlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  tagOverlayContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: height * 0.7,
  },
  tagOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tagOverlayTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  rankingItemLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FCEFA5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankBadgeText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  rankingLabelLarge: {
    flex: 1,
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000',
  },
  rankingValueLarge: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#737373',
  },
  viewAllText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#7C4BFF',
    fontWeight: 'bold',
  },
});
