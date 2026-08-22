import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { checkAdminAccess, signOut } from '../lib/auth'

interface AdminAuthProps {
  children: React.ReactNode
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess().then((hasAccess) => {
      if (!hasAccess) {
        router.navigate({ to: '/admin/login' })
      } else {
        setIsAuthenticated(true)
      }
    })
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {children}
      <button
        onClick={() => {
          signOut()
          router.navigate({ to: '/admin/login' })
        }}
        className="fixed top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  )
}
