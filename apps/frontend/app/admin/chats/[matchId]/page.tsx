'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, MessageSquare, User } from 'lucide-react'

const ADMIN_PASSWORD = 'Taub6132'

export default function AdminChatPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string
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

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin', 'chat', matchId],
    queryFn: async () => {
      const res = await api.get(`/admin/chats/${matchId}`, {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
      return res.data
    },
    enabled: isAuthenticated && !!matchId,
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

  if (!messages || messages.length === 0) {
    return (
      <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-neutral-light-grey">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-light-grey text-neutral-dark-grey rounded-xl font-semibold hover:bg-neutral-medium-grey transition-all mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-neutral-medium-grey opacity-50" />
              <h1 className="text-2xl font-bold text-neutral-near-black mb-2">No messages</h1>
              <p className="text-neutral-dark-grey">This match has no messages yet.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get unique users from messages
  const users: any[] = Array.from(
    new Map(
      messages.flatMap((msg: any) => [
        [msg.sender.id, msg.sender],
        [msg.receiver.id, msg.receiver],
      ])
    ).values()
  )

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-light-grey text-neutral-dark-grey rounded-xl font-semibold hover:bg-neutral-medium-grey transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </button>

          <div className="flex items-center gap-4">
            <MessageSquare className="w-6 h-6 text-primary-purple" />
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              Chat Messages
            </h1>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {users.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-light-grey rounded-lg"
              >
                <User className="w-4 h-4 text-primary-purple" />
                <span className="font-semibold text-neutral-near-black">{user.name}</span>
                <span className="text-sm text-neutral-dark-grey">({user.email})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-neutral-light-grey">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {messages.map((msg: any) => {
              const isFirstUser = users.length > 0 && msg.sender.id === users[0]?.id
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFirstUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-md px-4 py-3 rounded-xl ${
                      isFirstUser
                        ? 'bg-neutral-light-grey text-neutral-near-black'
                        : 'bg-premium-gradient text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold opacity-75">
                        {msg.sender.name}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm md:text-base leading-relaxed break-words">
                      {msg.content || '(No content)'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

