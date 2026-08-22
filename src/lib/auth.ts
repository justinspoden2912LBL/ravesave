import { createClient, User } from '@supabase/supabase-js'

function createAuthClient() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      ...(!supabaseUrl ? ['VITE_SUPABASE_URL'] : []),
      ...(!supabaseAnonKey ? ['VITE_SUPABASE_ANON_KEY'] : []),
    ]
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}.`
    console.error(`[auth] ${message}`)
    throw new Error(message)
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

let _supabase: ReturnType<typeof createAuthClient> | undefined

// Lazily instantiated: constructing the client at module scope crashes SSR
// when env vars are absent, because createClient throws on an empty URL.
export const supabase = new Proxy({} as ReturnType<typeof createAuthClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createAuthClient()
    return Reflect.get(_supabase, prop, receiver)
  },
})

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
  try {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  } catch (error) {
    // Supabase is not configured — report signed-out and hand back a no-op
    // unsubscribe so callers can still clean up unconditionally.
    console.error('Auth state change subscription error:', error)
    callback(null)
    return { data: { subscription: { unsubscribe() {} } } }
  }
}
