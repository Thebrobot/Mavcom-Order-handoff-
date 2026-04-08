import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || 'placeholder-anon-key'

const configured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key'

if (!configured) {
  console.warn(
    '[Portal] Supabase env vars not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Portal login and deal history will not work until these are configured. ' +
    'See deal-form/.env.example for setup instructions.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseConfigured = configured
