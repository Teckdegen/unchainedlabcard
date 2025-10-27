import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// Get current user (RLS guarantees only own row)
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').single();
  if (error?.code === 'PGRST116') return null; // no row
  if (error) throw error;
  return data;
}

// Insert new user (after wallet sign-in)
export async function insertUser(payload: UserInsert): Promise<void> {
  const { error } = await supabase.from('users').insert(payload);
  if (error) throw error;
}

// Update user (customer_code, card_code, etc.)
export async function updateUser(payload: UserUpdate): Promise<void> {
  const { error } = await supabase.from('users').update(payload);
  if (error) throw error;
}