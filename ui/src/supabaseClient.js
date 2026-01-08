import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://okqonozbecvrdtytbefi.supabase.co'
// WARNING: In a production app, the anon key should be in an environment variable.
// For this automation tool's MVP, we use the provided project ID.
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // I need to ask for this if not provided, or check if I can proceed without it for now.

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
