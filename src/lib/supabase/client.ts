import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
const getEnvVar = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn('Error accessing environment variable:', e);
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate URL to ensure it's not a placeholder and actually looks like a URL
const isValidUrl = (url: string | undefined) => {
  if (!url) return false;
  return url.startsWith('http') && !url.includes('your-project') && !url.includes('undefined');
};

// Check if variables exist AND are valid to avoid crashing or hanging on bad config
const isConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey;

if (!isConfigured) {
  console.warn("DriftSpots: Supabase URL/Key missing or invalid. Falling back to Mock Data mode.");
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

export const isSupabaseConfigured = () => !!supabase;