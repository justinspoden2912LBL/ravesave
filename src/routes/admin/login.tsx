import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn } from '../../lib/auth'

export const Route = createFileRoute('/admin/login')()

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h1>
          <p className="text-gray-300 text-center mb-6">Ravesave Administration</p>

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
          </form>

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
