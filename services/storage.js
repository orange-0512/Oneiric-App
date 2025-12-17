import { supabase } from '../lib/supabase';

// Helper to get current user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const saveDream = async (dreamData) => {
  try {
    const user_id = await getUserId();
    
    // Map camelCase to snake_case for DB insert
    const dbPayload = {
      user_id,
      title: dreamData.title,
      date: dreamData.date,
      created_at: new Date().toISOString(),
      summary: dreamData.summary,
      tags: dreamData.tags || [],
      duration: dreamData.duration,
      mood: dreamData.mood,
      is_favorite: dreamData.isFavorite || false,
      generated_image: dreamData.generatedImage,
      sleep_time: dreamData.sleepTime,
      wake_time: dreamData.wakeTime,
    };

    const { data, error } = await supabase
      .from('dreams')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;
    
    // Return with camelCase keys for app usage
    return {
      ...data,
      createdAt: data.created_at,
      isFavorite: data.is_favorite,
      generatedImage: data.generated_image,
      sleepTime: data.sleep_time,
      wakeTime: data.wake_time,
    };
  } catch (error) {
    console.error('Error saving dream:', error);
    throw error;
  }
};

export const getDreams = async () => {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case to camelCase if needed, or keep as is.
    // Our app uses camelCase (e.g. isFavorite), but DB uses snake_case (is_favorite).
    // Let's map it for compatibility.
    return data.map(dream => ({
      ...dream,
      createdAt: dream.created_at,
      isFavorite: dream.is_favorite,
      generatedImage: dream.generated_image,
    }));
  } catch (error) {
    console.error('Error getting dreams:', error);
    return [];
  }
};

export const getLatestDream = async () => {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    return {
      ...data,
      createdAt: data.created_at,
      isFavorite: data.is_favorite,
      generatedImage: data.generated_image,
    };
  } catch (error) {
    console.error('Error getting latest dream:', error);
    return null;
  }
};

export const clearDreams = async () => {
  // Usually we don't want to clear all cloud data easily, but for dev:
  try {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('dreams')
      .delete()
      .eq('user_id', user_id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error clearing dreams:', error);
  }
};

export const toggleDreamFavorite = async (id) => {
  try {
    // First get current status
    const { data: currentDream, error: fetchError } = await supabase
      .from('dreams')
      .select('is_favorite')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('dreams')
      .update({ is_favorite: !currentDream.is_favorite })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Return all dreams to update UI state, or just the updated one?
    // The original function returned all dreams. Let's stick to that pattern or refactor UI.
    // Refactoring UI to update local state is better, but to minimize changes, let's fetch all.
    return await getDreams();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const updateDream = async (id, updates) => {
  try {
    // Map camelCase updates to snake_case
    const dbUpdates = {};
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.generatedImage !== undefined) dbUpdates.generated_image = updates.generatedImage;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.sleepTime !== undefined) dbUpdates.sleep_time = updates.sleepTime;
    if (updates.wakeTime !== undefined) dbUpdates.wake_time = updates.wakeTime;

    const { data, error } = await supabase
      .from('dreams')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: data.created_at,
      isFavorite: data.is_favorite,
      generatedImage: data.generated_image,
    };
  } catch (error) {
    console.error('Error updating dream:', error);
    throw error;
  }
};

export const deleteDream = async (id) => {
  try {
    const { error } = await supabase
      .from('dreams')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return await getDreams();
  } catch (error) {
    console.error('Error deleting dream:', error);
    throw error;
  }
};

// Seed function is less relevant for cloud, but we can keep it for manual seeding if needed
export const seedDreams = async () => {
  // Implementation skipped for cloud to avoid accidental spam
  return [];
};
