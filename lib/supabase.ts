import { createClient } from "@supabase/supabase-js"
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export const supabase = createBrowserSupabaseClient<Database>();

export function useSupabaseClient() {
  return supabase
}
