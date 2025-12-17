import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnrvllyaoipzunhltvex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnZsbHlhb2lwenVuaGx0dmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzQ4MjMsImV4cCI6MjA4MTM1MDgyM30.V76Axv8ETxZHptSeAFds7zmMdN95MOAB69fXTZSA6p0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
