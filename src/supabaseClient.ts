import { createClient } from '@supabase/supabase-js'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'

const supabaseUrl = 'YOUR_SUPABASE_URL' // Replace with your actual Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // Replace with your actual Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

WebBrowser.maybeCompleteAuthSession()

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: AuthSession.makeRedirectUri(),
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}