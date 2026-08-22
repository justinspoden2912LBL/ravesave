import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import AdminAuth from '../../components/AdminAuth'

export const Route = createFileRoute('/admin/chat')()

function AdminChatPageInner() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch chats from Supabase
    const fetchChats = async () => {
      try {
        // Placeholder - actual chat fetching
        setChats([])
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">AI Chat Management</h1>
        
        {loading ? (
          <div className="text-white text-xl">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <p className="text-gray-300">No chats found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div key={chat.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-white">{chat.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminChatPage() {
  return (
    <AdminAuth>
      <AdminChatPageInner />
    </AdminAuth>
  )
}
