import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://muvxuuybmdnbcwnjxbpw.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dnh1dXlibWRuYmN3bmp4YnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDc3MzgsImV4cCI6MjA2ODcyMzczOH0.gWE-aTgQNXclfvYmEmJFtPAeZo5_oxWHiTshuCxmPIM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
