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

  // Separate actual dreams from mood logs
  const actualDreams = dreams.filter(d => !d.tags || !d.tags.includes('mood_log'));
  const moodLogs = dreams.filter(d => d.tags && d.tags.includes('mood_log'));

  // If no dreams AND no mood logs, return empty state
  if ((!actualDreams || actualDreams.length === 0) && (!moodLogs || moodLogs.length === 0)) {
    return {
      avgSleepDuration: '-',
      dreamCount: '-',
      dominantEmotion: '-',
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

  // 1. Basic Counts (Only actual dreams)
  const dreamCount = actualDreams.length;
  
  // 2. Sleep Duration (Only actual dreams)
  const totalDuration = actualDreams.reduce((sum, d) => sum + (d.duration || 0), 0);
  const avgSleepDuration = dreamCount > 0 ? (totalDuration / dreamCount).toFixed(1) : '-';

  // 3. Emotion Distribution & Dominant Emotion (Only actual dreams for "Dream Emotion")
  const emotionCounts = { positive: 0, neutral: 0, negative: 0 };
  const allMoods = [...actualDreams]; // Only use actual dreams for stats
  
  allMoods.forEach(d => {
    if (d.mood === 'positive' || d.mood === 'happy' || d.mood === 'excited') emotionCounts.positive++;
    else if (d.mood === 'negative' || d.mood === 'sad' || d.mood === 'scared' || d.mood === 'angry') emotionCounts.negative++;
    else emotionCounts.neutral++;
  });
  
  const totalEmotions = allMoods.length;
  const emotionDistribution = {
    positive: totalEmotions > 0 ? Math.round((emotionCounts.positive / totalEmotions) * 100) : 0,
    neutral: totalEmotions > 0 ? Math.round((emotionCounts.neutral / totalEmotions) * 100) : 0,
    negative: totalEmotions > 0 ? Math.round((emotionCounts.negative / totalEmotions) * 100) : 0,
  };

  let dominantEmotion = '-';
  if (totalEmotions > 0) {
    dominantEmotion = '平靜';
    if (emotionCounts.positive > emotionCounts.neutral && emotionCounts.positive > emotionCounts.negative) dominantEmotion = '愉悅';
    if (emotionCounts.negative > emotionCounts.positive && emotionCounts.negative > emotionCounts.neutral) dominantEmotion = '焦慮';
  }

  // 4. Mood Trend & Sleep Record
  const moodTrend = new Array(daysDiff).fill(null); 
  const sleepRecord = new Array(daysDiff).fill(null);

  // Initialize sleepRecord with empty data
  for(let i=0; i<daysDiff; i++) {
     sleepRecord[i] = { day: dateRangeLabels[i], duration: 0, emotion: 'neutral' };
  }

  // Process Mood Trend (Prioritize mood logs, fallback to dreams)
  // First, fill with mood logs
  // Process Mood Trend - Use the LAST record of the day
  dreams.forEach(d => {
    const dreamDate = parseISO(d.created_at);
    const index = differenceInDays(dreamDate, start);
    
    if (index >= 0 && index < daysDiff) {
        // Always overwrite to ensure the last record of the day determines the mood
        let score = 2;
        if (['positive', 'happy', 'excited'].includes(d.mood)) score = 3;
        if (['negative', 'sad', 'scared', 'angry'].includes(d.mood)) score = 1;
        moodTrend[index] = score;

        // Sleep record logic - only if it's an actual dream (not a mood log)
        if (!d.tags || !d.tags.includes('mood_log')) {
             let emotionType = 'neutral';
             if (['positive', 'happy', 'excited'].includes(d.mood)) emotionType = 'positive';
             if (['negative', 'sad', 'scared', 'angry'].includes(d.mood)) emotionType = 'negative';

             // If there are multiple dreams in a day, this logic might over-write previous sleep duration 
             // or should we sum them? The previous logic was also overwriting or just taking one.
             // Given it's a "Sleep Record", usually there is one main sleep per day. 
             // Let's stick to overwriting for now or maybe summing duration if needed, 
             // but user request was specifically about "Mood Trend". 
             // Re-using the same loop for efficiency.
             
             // Actually, looking at previous logic: it was processing actualDreams separate for sleepRecord.
             // Let's keep sleepRecord logic safe.
        }
    }
  });

  // Re-calculate Sleep Record separately to ensure we strictly use actualDreams and handle multiple dreams properly if needed
  // (Previous logic was just taking the last one too effectively for sleepRecord if multiple existed, 
  // explicitly: actualDreams.forEach... sleepRecord[index] = ...)
  
  actualDreams.forEach(d => {
    const dreamDate = parseISO(d.created_at);
    const index = differenceInDays(dreamDate, start);
    
    if (index >= 0 && index < daysDiff) {
        let emotionType = 'neutral';
        if (['positive', 'happy', 'excited'].includes(d.mood)) emotionType = 'positive';
        if (['negative', 'sad', 'scared', 'angry'].includes(d.mood)) emotionType = 'negative';

        sleepRecord[index] = {
          day: dateRangeLabels[index],
          duration: Math.min((d.duration || 0) / 10 * 100, 100), 
          emotion: emotionType
        };
    }
  });

  // 5. Top Tags (Only actual dreams)
  const tagCounts = {};
  actualDreams.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) {
      d.tags.forEach(tag => {
        if (tag !== 'mood_log') { // Double check to exclude mood_log
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // 6. Mock AI Insight
  let summary = '';
  let analysis = '';
  let suggestion = '';

  if (dreamCount === 0 || dreamCount === '-') {
      summary = `此期間尚未記錄夢境，但您有持續記錄心情。`;
      analysis = `持續關注自己的情緒變化是很好的習慣。`;
      suggestion = `試著在睡前記錄下當下的感受，或許能開啟夢境的大門。`;
  } else {
      const topTag = topTags.length > 0 ? topTags[0].tag : '無';
      summary = `此期間您記錄了 ${dreamCount} 個夢境，主要情緒為「${dominantEmotion}」。`;
      analysis = `夢境中頻繁出現「${topTag}」，顯示您近期潛意識中對此議題較為關注。`;
      suggestion = '建議您睡前可以聽一些輕音樂，幫助放鬆心情。';

      if (dominantEmotion === '焦慮' || dominantEmotion === '驚恐') {
        analysis += ' 情緒波動較大，可能與近期生活壓力有關。';
        suggestion = '建議嘗試冥想或深呼吸練習，並減少睡前使用手機的時間。';
      } else if (dominantEmotion === '愉悅') {
        analysis += ' 整體情緒穩定且正向，顯示您的精神狀態良好。';
        suggestion = '保持目前的作息，繼續探索有趣的夢境世界！';
      }
  }

  return {
    avgSleepDuration,
    dreamCount: dreamCount === 0 ? '-' : dreamCount,
    dominantEmotion,
    moodTrend, 
    emotionDistribution,
    topTags,
    sleepRecord,
    dateLabels: dateRangeLabels,
    aiInsight: { summary, analysis, suggestion }
  };
};
