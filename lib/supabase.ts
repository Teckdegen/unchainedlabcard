import { createClient } from "@supabase/supabase-js"
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient<Database> | null = null

export function createClientComponentClient() {
  // Check if we're in a browser environment and have the required env vars
  if (typeof window !== 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Only create client if we have the required environment variables
    if (supabaseUrl && supabaseAnonKey) {
      return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    }
  }
  
  // Return a minimal client or null for server-side/build-time
  return null
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

export function useSupabaseClient() {
  return getSupabaseClient()
}