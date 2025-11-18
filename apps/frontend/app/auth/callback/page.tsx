'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (accessToken && refreshToken) {
      // Fetch user data
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          setAuth(user, accessToken, refreshToken)
          if (user.isAdmin) {
            router.push('/admin')
          } else {
            router.push('/swipe')
          }
        })
        .catch(() => {
          router.push('/auth/login')
        })
    } else {
      router.push('/auth/login')
    }
  }, [searchParams, router, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing login...</p>
      </div>
    </div>
  )
}

