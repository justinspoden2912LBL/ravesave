import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getPublicSupabaseConfig } from '@/lib/runtime-config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;
const config = getPublicSupabaseConfig();

if (!config.configured) {
  console.warn(`[Supabase] Missing public configuration: ${config.missing.join(', ')}`);
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.invalid',
  supabaseAnonKey ?? 'public-placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
