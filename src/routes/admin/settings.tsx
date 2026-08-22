import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import AdminAuth from '../../components/AdminAuth'

export const Route = createFileRoute('/admin/settings')()

function AdminSettingsPageInner() {
  const [settings, setSettings] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  })

  const handleSave = async () => {
    // Save settings to Supabase
    console.log('Saving settings:', settings)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">AI Settings</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 space-y-6">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Model</label>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Temperature</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Max Tokens</label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <AdminAuth>
      <AdminSettingsPageInner />
    </AdminAuth>
  )
}
