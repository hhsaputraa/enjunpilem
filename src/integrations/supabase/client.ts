// Supabase client configuration with environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/env';

// Use environment configuration
const SUPABASE_URL = supabaseConfig.url;
const SUPABASE_PUBLISHABLE_KEY = supabaseConfig.anonKey;

// Create and export the supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);