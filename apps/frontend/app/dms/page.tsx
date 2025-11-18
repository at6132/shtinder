'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Clock, Sparkles } from 'lucide-react'

interface Match {
  id: string
  user: {
    id: string
    name: string
    age: number
    photos: { url: string }[]
  }
  lastMessage?: {
    content: string
    createdAt: string
  }
}

export default function DMsPage() {
  const router = useRouter()
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get('/matches')
      return res.data
    },
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-neutral-near-black mb-2 flex items-center gap-2 md:gap-3">
            <MessageCircle className="w-6 h-6 md:w-10 md:h-10 text-primary-purple" />
            Messages
          </h1>
          <p className="text-neutral-dark-grey">
            {matches?.length || 0} {matches?.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>

        {matches?.length === 0 ? (
          <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-8 md:p-12 text-center">
            <div className="mb-4 md:mb-6">
              <Sparkles className="w-16 h-16 md:w-20 md:h-20 mx-auto text-primary-purple" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-near-black mb-3 md:mb-4">
              No messages yet
            </h2>
            <p className="text-neutral-dark-grey mb-6 md:mb-8 text-sm md:text-base">
              Start swiping to get matches and start conversations!
            </p>
            <Link
              href="/swipe"
              className="inline-block bg-flame-gradient text-white px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Go to Swipe
            </Link>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {matches?.map((match: Match) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="flex items-center gap-3 md:gap-4 bg-neutral-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] group"
              >
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 bg-neutral-light-grey flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary-purple transition-all">
                  {match.user.photos && match.user.photos[0] ? (
                    <Image
                      src={match.user.photos[0].url}
                      alt={match.user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg md:text-2xl font-bold text-primary-purple">
                      {match.user.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-base md:text-lg text-neutral-near-black">
                      {match.user.name}, {match.user.age}
                    </h3>
                    {match.lastMessage && (
                      <div className="flex items-center gap-1 text-xs text-neutral-medium-grey">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(match.lastMessage.createdAt)}</span>
                      </div>
                    )}
                  </div>
                  {match.lastMessage ? (
                    <p className="text-sm text-neutral-dark-grey truncate">
                      {match.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-primary-purple font-medium">
                      Start a conversation
                    </p>
                  )}
                </div>
                <div className="text-primary-purple opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
