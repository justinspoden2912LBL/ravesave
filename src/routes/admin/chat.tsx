import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/chat')()

const chatModels = [
  { id: 'groq-llama', name: 'Groq Llama 3.1', status: 'Active', requests: 0 },
  { id: 'groq-mixtral', name: 'Groq Mixtral', status: 'Inactive', requests: 0 },
  { id: 'openai-gpt', name: 'OpenAI GPT', status: 'Inactive', requests: 0 },
]

const chatLogs = [
  { id: 1, user: 'User', message: 'Hello', timestamp: '2026-08-22 17:00', model: 'groq-llama' },
]

export default function AdminChatPage() {
  const [selectedModel, setSelectedModel] = useState('groq-llama')
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')

  const handleTest = () => {
    setTestResponse('AI Response: This is a test response from ' + selectedModel)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a href="/admin" className="text-purple-300 hover:text-purple-200">← Back to Admin</a>
            <h1 className="text-4xl font-bold text-white">AI Chat Management</h1>
          </div>
          <p className="text-gray-300">Chat-Konfiguration, Modelle und Logs</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Models */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">AI Models</h3>
            <div className="space-y-3">
              {chatModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedModel === model.id
                      ? 'bg-purple-600/30 border-purple-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{model.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      model.status === 'Active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Requests: {model.requests}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Test Chat */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Test AI Chat</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Test Message</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  rows={4}
                  placeholder="Enter a test message..."
                />
              </div>
              <button
                onClick={handleTest}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Send Test Message
              </button>
              {testResponse && (
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-gray-300 text-sm mb-2">Response:</p>
                  <p className="text-white">{testResponse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Logs */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Chat Logs</h3>
            <div className="space-y-3">
              {chatLogs.map((log) => (
                <div key={log.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{log.user}</span>
                    <span className="text-gray-400 text-sm">{log.timestamp}</span>
                  </div>
                  <p className="text-gray-300 mb-2">{log.message}</p>
                  <p className="text-purple-300 text-sm">Model: {log.model}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
