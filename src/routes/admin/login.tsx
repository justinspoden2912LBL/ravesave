import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn, supabase } from '../../lib/auth'

export const Route = createFileRoute('/admin/login')()

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.navigate({ to: '/admin' })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email first')
      return
    }

    setLoading(true)
    setError('')

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      })
      setResetSent(true)
    } catch (err: any) {
      setError(err.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h1>
          <p className="text-gray-300 text-center mb-6">Ravesave Administration</p>

          {resetSent ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200">
              <p className="font-medium mb-2">✓ Password reset email sent!</p>
              <p className="text-sm">Check your inbox for {email}. Click the link in the email to reset your password.</p>
              <button
                onClick={() => setResetSent(false)}
                className="mt-4 text-sm text-green-300 hover:text-white underline"
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading || !email}
                  className="w-full px-6 py-2 text-gray-300 hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forgot password? Reset via email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <a
              href="/"
              className="text-gray-400 hover:text-white text-sm text-center block"
            >
              ← Back to Site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
