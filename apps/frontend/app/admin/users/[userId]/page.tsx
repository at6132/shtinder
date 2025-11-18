'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Trash2,
  Ban,
  Eye,
  Mail,
  Calendar,
  MapPin,
  Heart,
  MessageSquare,
  Users,
  Shield,
  X,
  CheckCircle,
} from 'lucide-react'

const ADMIN_PASSWORD = 'Taub6132'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const userId = params.userId as string
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.replace('/admin')
    }
    setIsChecking(false)
  }, [router])

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`, {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
      return res.data
    },
    enabled: isAuthenticated && !!userId,
  })

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/admin/users/${userId}`, {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
    },
    onSuccess: () => {
      router.push('/admin')
    },
  })

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-soft-love-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-love-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-soft-love-gradient flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-near-black mb-4">User not found</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-primary-purple text-white rounded-xl font-semibold hover:bg-primary-pink transition-all"
          >
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  // Combine matches from both relations
  const allMatches = [
    ...(user.matches1 || []).map((m: any) => ({ ...m, otherUser: m.user2 })),
    ...(user.matches2 || []).map((m: any) => ({ ...m, otherUser: m.user1 })),
  ]

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-light-grey text-neutral-dark-grey rounded-xl font-semibold hover:bg-neutral-medium-grey transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete user ${user.name}? This action cannot be undone.`)) {
                  deleteUserMutation.mutate()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {user.photos && user.photos.length > 0 ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-neutral-light-grey">
                  <img
                    src={user.photos[0].url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary-purple/20 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-primary-purple">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-near-black">
                  {user.name}
                </h1>
                {user.isAdmin && (
                  <span className="px-3 py-1 bg-premium-gradient text-white text-sm font-bold rounded-lg">
                    Admin
                  </span>
                )}
                {user.onboardingComplete ? (
                  <span className="px-3 py-1 bg-success text-white text-sm font-bold rounded-lg">
                    Complete
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-warning text-white text-sm font-bold rounded-lg">
                    Pending
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm md:text-base">
                <div className="flex items-center gap-2 text-neutral-dark-grey">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-neutral-dark-grey">
                  <Calendar className="w-4 h-4" />
                  {user.age} years old • {user.gender}
                </div>
                {user.bio && (
                  <p className="text-neutral-dark-grey mt-3">{user.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-primary-pink" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Swipes Sent</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              {user.swipes?.length || 0}
            </p>
          </div>

          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-primary-purple" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Swipes Received</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              {user.receivedSwipes?.length || 0}
            </p>
          </div>

          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-success" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Matches</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              {allMatches.length}
            </p>
          </div>

          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-primary-flame" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Photos</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              {user.photos?.length || 0}
            </p>
          </div>
        </div>

        {/* Photos */}
        {user.photos && user.photos.length > 0 && (
          <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
            <h2 className="text-xl font-bold text-neutral-near-black mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-purple" />
              Photos ({user.photos.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {user.photos.map((photo: any) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-neutral-light-grey group"
                >
                  <img src={photo.url} alt="Photo" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Swipes */}
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
          <h2 className="text-xl font-bold text-neutral-near-black mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-pink" />
            Swipes Sent ({user.swipes?.length || 0})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {user.swipes && user.swipes.length > 0 ? (
              user.swipes.map((swipe: any) => (
                <div
                  key={swipe.id}
                  className="flex items-center justify-between p-3 bg-neutral-light-grey rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        swipe.direction === 'like'
                          ? 'bg-success text-white'
                          : swipe.direction === 'superlike'
                          ? 'bg-super-like text-white'
                          : 'bg-error text-white'
                      }`}
                    >
                      {swipe.direction === 'like'
                        ? 'Like'
                        : swipe.direction === 'superlike'
                        ? 'Super Like'
                        : 'Pass'}
                    </span>
                    <span className="font-semibold text-neutral-near-black">
                      {swipe.target?.name}
                    </span>
                    <span className="text-sm text-neutral-dark-grey">{swipe.target?.email}</span>
                  </div>
                  <span className="text-xs text-neutral-medium-grey">
                    {new Date(swipe.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-neutral-dark-grey text-center py-4">No swipes sent</p>
            )}
          </div>
        </div>

        {/* Matches */}
        {allMatches.length > 0 && (
          <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
            <h2 className="text-xl font-bold text-neutral-near-black mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              Matches ({allMatches.length})
            </h2>
            <div className="space-y-2">
              {allMatches.map((match: any) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 bg-neutral-light-grey rounded-xl hover:bg-neutral-medium-grey transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/chats/${match.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-success" />
                    <span className="font-semibold text-neutral-near-black">
                      {match.otherUser?.name}
                    </span>
                    <span className="text-sm text-neutral-dark-grey">
                      {match.otherUser?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-medium-grey">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </span>
                    <MessageSquare className="w-4 h-4 text-primary-purple" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

