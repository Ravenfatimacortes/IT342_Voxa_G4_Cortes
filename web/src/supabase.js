import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug: Log environment variables
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration:', {
    url: supabaseUrl,
    keyExists: !!supabaseAnonKey
  })
  // Create a mock client for development
  console.warn('Creating mock Supabase client for development')
  
  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Mock client - Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Mock client - Supabase not configured' } }),
      signOut: () => Promise.resolve(),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Mock client - Supabase not configured' } })
    }
  }
} else if (supabaseAnonKey.includes('sb_secret_') || supabaseAnonKey.length < 100) {
  console.error('Invalid Supabase anonymous key detected')
  console.warn('Creating mock Supabase client for development')
  
  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Mock client - Invalid Supabase key' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Mock client - Invalid Supabase key' } }),
      signOut: () => Promise.resolve(),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Mock client - Invalid Supabase key' } })
    }
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
