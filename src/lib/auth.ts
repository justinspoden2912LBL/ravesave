import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Admin whitelist
const ADMIN_EMAILS = ['justin.spoden2912@gmail.com']

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.error('Sign in error:', error.message)
    throw new Error(error.message)
  }
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error.message)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user ?? null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    
    const isAdmin = ADMIN_EMAILS.includes(user.email || '')
    if (!isAdmin) {
      console.warn('User is not an admin:', user.email)
    }
    return isAdmin
  } catch (error) {
    console.error('Check admin access error:', error)
    return false
  }
}

export async function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}
