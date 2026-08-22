import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/settings')()

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    defaultModel: 'groq-llama',
    maxTokens: 1024,
    temperature: 0.7,
    enableChat: true,
    enableLogging: true,
    rateLimitPerHour: 100,
  })

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    alert('Settings saved! (Demo)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a href="/admin" className="text-purple-300 hover:text-purple-200">← Back to Admin</a>
            <h1 className="text-4xl font-bold text-white">AI Settings</h1>
          </div>
          <p className="text-gray-300">Konfiguration der AI-Parameter und Modelle</p>
        </header>

        {/* Settings Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-6">
          {/* Default Model */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Default AI Model</label>
            <select
              value={settings.defaultModel}
              onChange={(e) => handleChange('defaultModel', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="groq-llama">Groq Llama 3.1</option>
              <option value="groq-mixtral">Groq Mixtral</option>
              <option value="openai-gpt">OpenAI GPT</option>
            </select>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Max Tokens per Response</label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Temperature */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Temperature (0.0 - 1.0)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            />
            <p className="text-gray-400 text-xs mt-1">Higher = more creative, Lower = more focused</p>
          </div>

          {/* Enable Chat */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableChat}
              onChange={(e) => handleChange('enableChat', e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-gray-300">Enable AI Chat for Users</label>
          </div>

          {/* Enable Logging */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableLogging}
              onChange={(e) => handleChange('enableLogging', e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-gray-300">Enable Chat Logging</label>
          </div>

          {/* Rate Limit */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Rate Limit (requests per hour)</label>
            <input
              type="number"
              value={settings.rateLimitPerHour}
              onChange={(e) => handleChange('rateLimitPerHour', parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">AI Configuration Tips</h3>
          <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
            <li>Temperature 0.7 ist ein guter Mittelwert für kreative aber fokussierte Antworten</li>
            <li>Max Tokens begrenzt die AntwortlÃ¤nge und API-Kosten</li>
            <li>Rate Limit schützt vor Missbrauch und hohen Kosten</li>
            <li>Logging ist wichtig für Debugging und QualitÃ¤tskontrolle</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
