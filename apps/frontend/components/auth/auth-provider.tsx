'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import axios from 'axios'

interface AuthProviderProps {
  children: React.ReactNode
}

// Protected routes that require authentication
const protectedRoutes = ['/swipe', '/matches', '/chat', '/profile', '/settings', '/dms', '/admin']
const authRoutes = ['/auth/login', '/auth/register', '/auth/callback']

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, accessToken, refreshToken, setAuth, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have tokens in localStorage
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const hasTokens = !!(storedAccessToken || storedRefreshToken)

      // If on auth routes and already logged in, redirect immediately
      if (hasTokens && authRoutes.some(route => pathname?.startsWith(route))) {
        // We have tokens, validate them first
        if (user && accessToken) {
          // User is already in store, redirect immediately
          if (user.isAdmin) {
            router.push('/admin')
          } else if (!user.onboardingComplete) {
            router.push('/onboarding')
          } else {
            router.push('/swipe')
          }
          return
        }
        // User not in store yet, but we have tokens - will validate below
      }

      // If on protected routes and no tokens, redirect to login immediately
      if (!hasTokens && protectedRoutes.some(route => pathname?.startsWith(route))) {
        router.push('/auth/login')
        return
      }

      // Skip auth check for public routes (home page and onboarding)
      // Note: We allow onboarding page even if user has completed it, to prevent redirect loops
      if (pathname === '/' || pathname === '/onboarding') {
        setIsLoading(false)
        return
      }

      if (!hasTokens) {
        // No tokens and not on protected route - allow access
        setIsLoading(false)
        return
      }

      // If we have tokens but no user in store, try to refresh/validate
      if (hasTokens && !user) {
        try {
          // Ensure API URL has protocol
          let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
            API_URL = `https://${API_URL}`
          }

          // Try to get user info with current token
          try {
            const userResponse = await api.get('/auth/me')
            const userData = userResponse.data
            
            // Update store with user data
            setAuth(
              userData,
              storedAccessToken || '',
              storedRefreshToken || ''
            )

            // If we're on auth routes, redirect now that we have user data
            if (authRoutes.some(route => pathname?.startsWith(route))) {
              if (userData.isAdmin) {
                router.push('/admin')
              } else if (!userData.onboardingComplete) {
                router.push('/onboarding')
              } else {
                router.push('/swipe')
              }
              return
            }

            setIsLoading(false)
            return
          } catch (error: any) {
            // Token might be expired, try refresh
            if (error.response?.status === 401 && storedRefreshToken) {
              try {
                const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
                  refreshToken: storedRefreshToken,
                })
                
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data
                localStorage.setItem('accessToken', newAccessToken)
                if (newRefreshToken) {
                  localStorage.setItem('refreshToken', newRefreshToken)
                }

                // Get user data with new token
                api.defaults.headers.Authorization = `Bearer ${newAccessToken}`
                const userResponse = await api.get('/auth/me')
                const userData = userResponse.data

                setAuth(
                  userData,
                  newAccessToken,
                  newRefreshToken || storedRefreshToken
                )

                // If we're on auth routes, redirect now that we have user data
                if (authRoutes.some(route => pathname?.startsWith(route))) {
                  if (userData.isAdmin) {
                    router.push('/admin')
                  } else if (!userData.onboardingComplete) {
                    router.push('/onboarding')
                  } else {
                    router.push('/swipe')
                  }
                  return
                }

                setIsLoading(false)
                return
              } catch (refreshError) {
                // Refresh failed - clear tokens and redirect
                logout()
                if (protectedRoutes.some(route => pathname?.startsWith(route))) {
                  router.push('/auth/login')
                } else if (authRoutes.some(route => pathname?.startsWith(route))) {
                  // On auth route, just allow access
                  setIsLoading(false)
                } else {
                  setIsLoading(false)
                }
                return
              }
            } else {
              // Other error - clear and redirect
              logout()
              if (protectedRoutes.some(route => pathname?.startsWith(route))) {
                router.push('/auth/login')
              } else {
                setIsLoading(false)
              }
              return
            }
          }
        } catch (error) {
          // Failed to validate - clear and redirect
          logout()
          if (protectedRoutes.some(route => pathname?.startsWith(route))) {
            router.push('/auth/login')
          } else {
            setIsLoading(false)
          }
          return
        }
      }

      // If we have user and tokens, check if we're on auth routes
      if (user && accessToken && authRoutes.some(route => pathname?.startsWith(route))) {
        // Already logged in, redirect based on user type
        if (user.isAdmin) {
          router.push('/admin')
        } else if (!user.onboardingComplete) {
          router.push('/onboarding')
        } else {
          router.push('/swipe')
        }
        return
      }

      // If we have user and tokens, and user hasn't completed onboarding, redirect to onboarding
      // BUT only if we're not already on the onboarding page (to prevent redirect loops)
      if (user && accessToken && !user.onboardingComplete && pathname !== '/onboarding') {
        // Only redirect if we're on a protected route
        if (protectedRoutes.some(route => pathname?.startsWith(route))) {
          // Before redirecting, try to refresh user data in case it's stale
          try {
            const userResponse = await api.get('/auth/me')
            const freshUserData = userResponse.data
            if (freshUserData.onboardingComplete) {
              // User actually completed onboarding, update store and allow access
              setAuth(freshUserData, accessToken, refreshToken || '')
              setIsLoading(false)
              return
            }
            // User really hasn't completed onboarding, redirect
            setAuth(freshUserData, accessToken, refreshToken || '')
          } catch (error) {
            // Failed to refresh, proceed with redirect
            console.error('Failed to refresh user data:', error)
          }
          router.push('/onboarding')
          return
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, user, accessToken, refreshToken, setAuth, logout, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-purple border-t-transparent mx-auto"></div>
          <p className="mt-4 text-neutral-dark-grey">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

