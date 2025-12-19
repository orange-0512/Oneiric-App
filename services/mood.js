import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

// Helper to get current user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const saveDailyMood = async (mood, dateStr) => {
  try {
    const user_id = await getUserId();
    const today = new Date();
    const start = startOfDay(today).toISOString();
    const end = endOfDay(today).toISOString();

    // Check if a mood log already exists for today
    const { data: existingLogs, error: fetchError } = await supabase
      .from('dreams')
      .select('id')
      .eq('user_id', user_id)
      .contains('tags', ['mood_log'])
      .gte('created_at', start)
      .lte('created_at', end);

    if (fetchError) throw fetchError;

    if (existingLogs && existingLogs.length > 0) {
      // Update the first existing log (and maybe clean up others later if needed)
      const logToUpdate = existingLogs[0];
      
      const { error: updateError } = await supabase
        .from('dreams')
        .update({ mood: mood, date: dateStr })
        .eq('id', logToUpdate.id);

      if (updateError) throw updateError;
    } else {
      // Create new log
      const { error: insertError } = await supabase
        .from('dreams')
        .insert([{
          user_id,
          title: 'Daily Mood',
          summary: 'Recorded via Home Page',
          tags: ['mood_log'],
          mood: mood,
          date: dateStr,
          duration: 0,
          created_at: new Date().toISOString(),
        }]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error saving daily mood:', error);
    return false;
  }
};

export const getDailyMood = async () => {
  try {
    const user_id = await getUserId();
    const today = new Date();
    const start = startOfDay(today).toISOString();
    const end = endOfDay(today).toISOString();

    const { data, error } = await supabase
      .from('dreams')
      .select('mood')
      .eq('user_id', user_id)
      .contains('tags', ['mood_log'])
      .gte('created_at', start)
      .lte('created_at', end)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return data ? data.mood : null;
  } catch (error) {
    console.error('Error getting daily mood:', error);
    return null;
  }
};
