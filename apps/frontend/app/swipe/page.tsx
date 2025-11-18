'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  age: number
  bio?: string
  photos: { url: string }[]
  distance?: number
}

export default function SwipePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [exitX, setExitX] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: async () => {
      const res = await api.get('/users/discover?limit=10')
      return res.data
    },
  })

  useEffect(() => {
    if (data) {
      setUsers(data)
    }
  }, [data])

  const swipeMutation = useMutation({
    mutationFn: async ({ targetId, direction }: { targetId: string; direction: string }) => {
      return api.post(`/swipes/${direction}`, { targetId })
    },
    onSuccess: (response, variables) => {
      if (response.data.isMatch) {
        alert(`It's a match with ${users[currentIndex]?.name}!`)
      }
      setCurrentIndex((prev) => prev + 1)
      queryClient.invalidateQueries({ queryKey: ['discover'] })
    },
  })

  const handleSwipe = (direction: 'like' | 'dislike' | 'superlike') => {
    if (currentIndex >= users.length) return

    const user = users[currentIndex]
    swipeMutation.mutate({ targetId: user.id, direction })
  }

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 1000 : -1000)
      if (info.offset.x > 0) {
        handleSwipe('like')
      } else {
        handleSwipe('dislike')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (currentIndex >= users.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-red-500">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">No more users!</h1>
          <p className="mb-4">Check back later for more matches</p>
          <button
            onClick={() => router.push('/matches')}
            className="bg-white text-primary px-6 py-2 rounded-lg font-semibold"
          >
            View Matches
          </button>
        </div>
      </div>
    )
  }

  const currentUser = users[currentIndex]
  const [photoIndex, setPhotoIndex] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-red-500 p-4">
      <div className="max-w-md mx-auto h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          <AnimatePresence>
            {currentUser && (
              <motion.div
                key={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ x: exitX, opacity: 0, scale: 0.5 }}
                className="absolute w-full max-w-sm"
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="relative h-96">
                    {currentUser.photos[photoIndex] && (
                      <Image
                        src={currentUser.photos[photoIndex].url}
                        alt={currentUser.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {currentUser.photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setPhotoIndex((prev) => Math.max(0, prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2"
                        >
                          ←
                        </button>
                        <button
                          onClick={() =>
                            setPhotoIndex((prev) =>
                              Math.min(currentUser.photos.length - 1, prev + 1)
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2"
                        >
                          →
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold">
                      {currentUser.name}, {currentUser.age}
                    </h2>
                    {currentUser.distance && (
                      <p className="text-gray-600">{currentUser.distance} km away</p>
                    )}
                    {currentUser.bio && <p className="mt-2 text-gray-700">{currentUser.bio}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-8 pb-8">
          <button
            onClick={() => handleSwipe('dislike')}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition"
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe('superlike')}
            className="w-16 h-16 rounded-full bg-blue-500 shadow-lg flex items-center justify-center text-2xl text-white hover:scale-110 transition"
          >
            ⭐
          </button>
          <button
            onClick={() => handleSwipe('like')}
            className="w-16 h-16 rounded-full bg-green-500 shadow-lg flex items-center justify-center text-2xl text-white hover:scale-110 transition"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  )
}

