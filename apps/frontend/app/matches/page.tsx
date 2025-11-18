'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
        <div className="space-y-2">
          {matches?.map((match: Match) => (
            <Link
              key={match.id}
              href={`/chat/${match.id}`}
              className="flex items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {match.user.photos[0] && (
                  <Image
                    src={match.user.photos[0].url}
                    alt={match.user.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {match.user.name}, {match.user.age}
                </h3>
                {match.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {match.lastMessage.content}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {matches?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No matches yet. Start swiping!</p>
              <Link
                href="/swipe"
                className="text-primary font-semibold mt-2 inline-block"
              >
                Go to Swipe
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

