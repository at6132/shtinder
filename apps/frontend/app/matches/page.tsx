'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
// Using regular img tags for external images
import Link from 'next/link'
import { Heart, MessageCircle, Sparkles } from 'lucide-react'

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

export default function MatchesPage() {
  const router = useRouter()
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get('/matches')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-neutral-near-black mb-2 flex items-center gap-2 md:gap-3">
            <Heart className="w-6 h-6 md:w-10 md:h-10 text-primary-pink fill-primary-pink" />
            Your Matches
          </h1>
          <p className="text-neutral-dark-grey">
            {matches?.length || 0} {matches?.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        {matches?.length === 0 ? (
          <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-8 md:p-12 text-center">
            <div className="mb-4 md:mb-6">
              <Sparkles className="w-16 h-16 md:w-20 md:h-20 mx-auto text-primary-purple" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-near-black mb-3 md:mb-4">
              No matches yet
            </h2>
            <p className="text-neutral-dark-grey mb-6 md:mb-8 text-sm md:text-base">
              Start swiping to find your perfect match!
            </p>
            <Link
              href="/swipe"
              className="inline-block bg-flame-gradient text-white px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Start Swiping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {matches?.map((match: Match) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden group"
              >
                <div className="relative h-48 md:h-64 bg-neutral-light-grey overflow-hidden">
                  {match.user.photos && match.user.photos[0] ? (
                    <img
                      src={match.user.photos[0].url}
                      alt={match.user.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-6xl font-bold text-primary-purple">
                        {match.user.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">View Chat</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-base md:text-lg text-neutral-near-black mb-1">
                    {match.user.name}, {match.user.age}
                  </h3>
                  {match.lastMessage && (
                    <p className="text-xs md:text-sm text-neutral-dark-grey truncate">
                      {match.lastMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
