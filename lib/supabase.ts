import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, Next.js, etc.)
const getEnv = (key: string) => {
  // Check import.meta.env (Vite standard)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  
  // Check process.env (Next.js / CRA / Node standard)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  return undefined;
};

// Use environment variables if available, otherwise fallback to the provided values
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://ncqaiywmkxcwfqnszldf.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'sb_publishable_JTaPDeiR-VmkkvWrBzWMFQ_ba9m3G-R';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);