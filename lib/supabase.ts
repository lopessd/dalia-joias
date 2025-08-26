import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Profile {
  id: string
  role: 'admin' | 'reseller'
  created_at: string
}

export interface UserWithProfile {
  id: string
  email: string
  role: 'admin' | 'reseller'
}
