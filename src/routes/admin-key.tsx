import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import AdminAuth from '../components/AdminAuth'

export const Route = createFileRoute('/admin-key')()

function AdminKeyPageInner() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const generateKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    setApiKey(newKey)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">API Key Management</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 space-y-6">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Current API Key</label>
            <div className="flex gap-4">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
                placeholder="No key generated yet"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            onClick={generateKey}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Generate New Key
          </button>

          {apiKey && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                ⚠️ Store this key securely. It won't be shown again!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminKeyPage() {
  return (
    <AdminAuth>
      <AdminKeyPageInner />
    </AdminAuth>
  )
}
