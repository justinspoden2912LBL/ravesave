import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import AdminAuth from '../components/AdminAuth'

export const Route = createFileRoute('/admin')()

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalArtists: 0,
  })

  useEffect(() => {
    // Fetch stats from Supabase
    const fetchStats = async () => {
      // Placeholder - actual stats fetching
      setStats({
        totalUsers: 0,
        totalChats: 0,
        totalArtists: 0,
      })
    }
    fetchStats()
  }, [])

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-gray-300 text-sm mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-gray-300 text-sm mb-2">Total Chats</h3>
              <p className="text-3xl font-bold text-white">{stats.totalChats}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-gray-300 text-sm mb-2">Total Artists</h3>
              <p className="text-3xl font-bold text-white">{stats.totalArtists}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/admin/chat"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors block"
            >
              <h3 className="text-xl font-semibold text-white mb-2">AI Chat Management</h3>
              <p className="text-gray-300">Manage AI conversations and settings</p>
            </a>
            <a
              href="/admin/settings"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors block"
            >
              <h3 className="text-xl font-semibold text-white mb-2">AI Settings</h3>
              <p className="text-gray-300">Configure AI behavior and parameters</p>
            </a>
            <a
              href="/admin-key"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors block"
            >
              <h3 className="text-xl font-semibold text-white mb-2">API Key Management</h3>
              <p className="text-gray-300">Manage API keys and access</p>
            </a>
            <a
              href="/admin-design"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors block"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Design Studio</h3>
              <p className="text-gray-300">Customize site appearance</p>
            </a>
          </div>
        </div>
      </div>
    </AdminAuth>
  )
}

export default AdminDashboard
