import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import AdminAuth from '../components/AdminAuth'

export const Route = createFileRoute('/admin-design')()

function AdminDesignPageInner() {
  const [design, setDesign] = useState({
    primaryColor: '#7c3aed',
    backgroundColor: '#111827',
    textColor: '#ffffff',
  })

  const handleSave = () => {
    // Save design to Supabase
    console.log('Saving design:', design)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Design Studio</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 space-y-6">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Primary Color</label>
            <div className="flex gap-4">
              <input
                type="color"
                value={design.primaryColor}
                onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={design.primaryColor}
                onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Background Color</label>
            <div className="flex gap-4">
              <input
                type="color"
                value={design.backgroundColor}
                onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={design.backgroundColor}
                onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Text Color</label>
            <div className="flex gap-4">
              <input
                type="color"
                value={design.textColor}
                onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={design.textColor}
                onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Save Design
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDesignPage() {
  return (
    <AdminAuth>
      <AdminDesignPageInner />
    </AdminAuth>
  )
}
