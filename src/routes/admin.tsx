import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin')()

const stats = [
  { label: 'AI Requests', value: '0', change: '+0%' },
  { label: 'Groq API Key', value: 'Not Set', change: '' },
  { label: 'Last Used', value: 'Never', change: '' },
  { label: 'Uptime', value: '99.9%', change: '' },
]

const features = [
  {
    title: 'AI Chat Integration',
    description: 'Chat-Begleitung für Users mit AI-Unterstitzung',
    href: '/admin/chat',
    status: 'Coming Soon',
  },
  {
    title: 'API Key Management',
    description: 'Groq und andere AI-APIs verwalten',
    href: '/admin-key',
    status: 'Active',
  },
  {
    title: 'Design Studio',
    description: 'UI/UX Design-Anpassungen',
    href: '/admin-design',
    status: 'Active',
  },
  {
    title: 'AI Settings',
    description: 'AI-Parameter und Modelle konfigurieren',
    href: '/admin/settings',
    status: 'Coming Soon',
  },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">AI-Management und System-Ü°bersicht</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              {stat.change && <p className="text-green-400 text-sm mt-1">{stat.change}</p>}
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="block bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  feature.status === 'Active' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {feature.status}
                </span>
              </div>
              <p className="text-gray-300">{feature.description}</p>
            </a>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/admin-key" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              API Keys
            </a>
            <a href="/admin-design" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Design Studio
            </a>
            <a href="/chat" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              AI Chat
            </a>
            <a href="/" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              Back to Site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
