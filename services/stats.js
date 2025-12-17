import { supabase } from '../lib/supabase';
import { differenceInDays, addDays, format, parseISO, isSameDay } from 'date-fns';

// Helper to get current user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const getStats = async (startDate, endDate) => {
  try {
    const user_id = await getUserId();
    
    // Ensure dates are Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include all dreams on that day
    end.setHours(23, 59, 59, 999);

    const { data: dreams, error } = await supabase
      .from('dreams')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    return calculateStats(dreams, start, end);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

const calculateStats = (dreams, start, end) => {
  const daysDiff = differenceInDays(end, start) + 1;
  const dateRangeLabels = [];
  for (let i = 0; i < daysDiff; i++) {
    const d = addDays(start, i);
    dateRangeLabels.push(format(d, 'MM/dd'));
  }

  if (!dreams || dreams.length === 0) {
    return {
      avgSleepDuration: 0,
      dreamCount: 0,
      dominantEmotion: '無',
      moodTrend: new Array(daysDiff).fill(null),
      emotionDistribution: { positive: 0, neutral: 0, negative: 0 },
      topTags: [],
      sleepRecord: dateRangeLabels.map(label => ({ day: label, duration: 0, emotion: 'neutral' })),
      dateLabels: dateRangeLabels,
      aiInsight: {
        summary: '此期間尚無夢境記錄。',
        analysis: '請嘗試記錄您的夢境，讓 AI 為您分析。',
        suggestion: '睡前放鬆有助於捕捉夢境靈感。'
      }
    };
  }

  // 1. Basic Counts
  const dreamCount = dreams.length;
  
  // 2. Sleep Duration
  const totalDuration = dreams.reduce((sum, d) => sum + (d.duration || 0), 0);
  const avgSleepDuration = (totalDuration / dreamCount).toFixed(1);

  // 3. Emotion Distribution & Dominant Emotion
  const emotionCounts = { positive: 0, neutral: 0, negative: 0 };
  dreams.forEach(d => {
    if (d.mood === 'positive' || d.mood === 'happy' || d.mood === 'excited') emotionCounts.positive++;
    else if (d.mood === 'negative' || d.mood === 'sad' || d.mood === 'scared' || d.mood === 'angry') emotionCounts.negative++;
    else emotionCounts.neutral++;
  });
  
  const totalEmotions = dreamCount;
  const emotionDistribution = {
    positive: Math.round((emotionCounts.positive / totalEmotions) * 100),
    neutral: Math.round((emotionCounts.neutral / totalEmotions) * 100),
    negative: Math.round((emotionCounts.negative / totalEmotions) * 100),
  };

  let dominantEmotion = '平靜';
  if (emotionCounts.positive > emotionCounts.neutral && emotionCounts.positive > emotionCounts.negative) dominantEmotion = '愉悅';
  if (emotionCounts.negative > emotionCounts.positive && emotionCounts.negative > emotionCounts.neutral) dominantEmotion = '焦慮';

  // 4. Mood Trend & Sleep Record
  const moodTrend = new Array(daysDiff).fill(null); 
  const sleepRecord = new Array(daysDiff).fill(null);

  // Initialize sleepRecord with empty data
  for(let i=0; i<daysDiff; i++) {
     sleepRecord[i] = { day: dateRangeLabels[i], duration: 0, emotion: 'neutral' };
  }

  dreams.forEach(d => {
    const dreamDate = parseISO(d.created_at);
    // Find index in range
    const index = differenceInDays(dreamDate, start);
    
    if (index >= 0 && index < daysDiff) {
        // Mood Score: Positive=3, Neutral=2, Negative=1
        let score = 2;
        let emotionType = 'neutral';
        if (['positive', 'happy', 'excited'].includes(d.mood)) { score = 3; emotionType = 'positive'; }
        if (['negative', 'sad', 'scared', 'angry'].includes(d.mood)) { score = 1; emotionType = 'negative'; }
        
        moodTrend[index] = score; 

        sleepRecord[index] = {
          day: dateRangeLabels[index],
          duration: Math.min((d.duration || 0) / 10 * 100, 100), // Normalize to 0-100%
          emotion: emotionType
        };
    }
  });

  // 5. Top Tags
  const tagCounts = {};
  dreams.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) {
      d.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // 6. Mock AI Insight
  const topTag = topTags.length > 0 ? topTags[0].tag : '無';
  let summary = `此期間您記錄了 ${dreamCount} 個夢境，主要情緒為「${dominantEmotion}」。`;
  let analysis = `夢境中頻繁出現「${topTag}」，顯示您近期潛意識中對此議題較為關注。`;
  let suggestion = '建議您睡前可以聽一些輕音樂，幫助放鬆心情。';

  if (dominantEmotion === '焦慮' || dominantEmotion === '驚恐') {
    analysis += ' 情緒波動較大，可能與近期生活壓力有關。';
    suggestion = '建議嘗試冥想或深呼吸練習，並減少睡前使用手機的時間。';
  } else if (dominantEmotion === '愉悅') {
    analysis += ' 整體情緒穩定且正向，顯示您的精神狀態良好。';
    suggestion = '保持目前的作息，繼續探索有趣的夢境世界！';
  }

  return {
    avgSleepDuration,
    dreamCount,
    dominantEmotion,
    moodTrend, 
    emotionDistribution,
    topTags,
    sleepRecord,
    dateLabels: dateRangeLabels,
    aiInsight: { summary, analysis, suggestion }
  };
};
