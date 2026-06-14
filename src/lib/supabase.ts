import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// isConfigured = true only when both env vars are present and non-empty
export const isSupabaseConfigured = Boolean(url && key && url !== 'https://your-project-id.supabase.co');

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!)
  : null;
