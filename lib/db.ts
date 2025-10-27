import { getSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// Type for our nullable Supabase client
type NullableSupabaseClient = SupabaseClient<Database> | null;

// Get current user (RLS guarantees only own row)
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient() as NullableSupabaseClient;
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return null;
  }
  
  const { data, error } = await (supabase as SupabaseClient<Database>).from('users').select('*').single();
  if (error?.code === 'PGRST116') return null; // no row
  if (error) throw error;
  return data;
}

// Insert new user (after wallet sign-in)
export async function insertUser(payload: UserInsert): Promise<void> {
  const supabase = getSupabaseClient() as NullableSupabaseClient;
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return;
  }
  
  const { error } = await (supabase as SupabaseClient<Database>).from('users').insert(payload);
  if (error) throw error;
}

// Update user (customer_code, card_code, etc.)
export async function updateUser(payload: UserUpdate): Promise<void> {
  const supabase = getSupabaseClient() as NullableSupabaseClient;
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return;
  }
  
  const { error } = await (supabase as SupabaseClient<Database>).from('users').update(payload);
  if (error) throw error;
}