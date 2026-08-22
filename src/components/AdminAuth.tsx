import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { checkAdminAccess, signOut, getCurrentUser } from '../lib/auth'

interface AdminAuthProps {
  children: React.ReactNode
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.navigate({ to: '/admin/login' })
          return
        }
        
        setUserEmail(user.email || '')
        const hasAccess = await checkAdminAccess()
        
        if (!hasAccess) {
          alert('Access denied: Not an admin user')
          router.navigate({ to: '/admin/login' })
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth error:', error)
        router.navigate({ to: '/admin/login' })
      }
    }

    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {children}
      <button
        onClick={async () => {
          await signOut()
          router.navigate({ to: '/admin/login' })
        }}
        className="fixed top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg"
      >
        Logout {userEmail && `(${userEmail})`}
      </button>
    </div>
  )
}
