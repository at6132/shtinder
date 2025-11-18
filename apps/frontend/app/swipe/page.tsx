'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
// Using regular img tags for external images to avoid Next.js optimization issues
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { X, Sparkles, Heart, RotateCcw } from 'lucide-react'

interface User {
  id: string
  name: string
  age: number
  bio?: string
  photos: { url: string }[]
}

export default function SwipePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && !user.onboardingComplete) {
      router.push('/onboarding')
    }
  }, [user, router])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [exitX, setExitX] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [lastSwipedUser, setLastSwipedUser] = useState<{ user: User; index: number } | null>(null)

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['discover', page],
    queryFn: async () => {
      const res = await api.get(`/users/discover?limit=50&page=${page}`)
      console.log('📊 Discover response:', res.data?.length || 0, 'users')
      return res.data
    },
    enabled: !!user && user.onboardingComplete === true,
  })

  useEffect(() => {
    if (data) {
      // Append new users instead of replacing (for unlimited swiping)
      setUsers((prev) => {
        if (prev.length === 0) {
          // First load - just set the data (even if empty array)
          return data
        }
        if (data.length === 0) {
          // No new users, keep existing
          return prev
        }
        const existingIds = new Set(prev.map((u: User) => u.id))
        const newUsers = data.filter((u: User) => !existingIds.has(u.id))
        return [...prev, ...newUsers]
      })
    }
  }, [data])

  // Reset photo index and drag position when current user changes
  useEffect(() => {
    setPhotoIndex(0)
    setDragX(0)
  }, [currentIndex])

  const swipeMutation = useMutation({
    mutationFn: async ({ targetId, direction }: { targetId: string; direction: string }) => {
      return api.post(`/swipes/${direction}`, { targetId })
    },
    onSuccess: (response, variables) => {
      // Store the last swiped user for undo functionality
      const swipedUser = users[currentIndex]
      if (swipedUser) {
        setLastSwipedUser({ user: swipedUser, index: currentIndex })
      }

      if (response.data.isMatch) {
        // Show match animation
        alert(`It's a match with ${users[currentIndex]?.name}!`)
      }
      setCurrentIndex((prev) => prev + 1)
      
      // Auto-fetch more users when running low (unlimited swiping)
      if (currentIndex >= users.length - 5) {
        setPage((prev) => prev + 1)
        refetch()
      }
    },
  })

  const undoMutation = useMutation({
    mutationFn: async (targetId: string) => {
      return api.delete(`/swipes/undo/${targetId}`)
    },
    onSuccess: () => {
      // Restore the last swiped user back to the feed
      if (lastSwipedUser) {
        setUsers((prev) => {
          const newUsers = [...prev]
          // Insert the user back at their original position
          newUsers.splice(lastSwipedUser.index, 0, lastSwipedUser.user)
          return newUsers
        })
        // Go back to that user
        setCurrentIndex(lastSwipedUser.index)
        setLastSwipedUser(null)
        queryClient.invalidateQueries({ queryKey: ['discover'] })
      }
    },
  })

  const handleUndo = () => {
    if (lastSwipedUser && currentIndex > 0) {
      undoMutation.mutate(lastSwipedUser.user.id)
    }
  }

  const handleSwipe = (direction: 'like' | 'dislike' | 'superlike') => {
    if (currentIndex >= users.length) return

    const user = users[currentIndex]
    swipeMutation.mutate({ targetId: user.id, direction })
  }

  const handleDrag = (event: any, info: any) => {
    setDragX(info.offset.x)
  }

  const handleDragEnd = (event: any, info: any) => {
    // Higher threshold to make swiping less sensitive
    const threshold = window.innerWidth < 768 ? 150 : 200
    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 1000 : -1000)
      if (info.offset.x > 0) {
        handleSwipe('like')
      } else {
        handleSwipe('dislike')
      }
    } else {
      // If not enough movement, snap back to center
      setDragX(0)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  // Show error if query failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="text-center text-neutral-near-black px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Error loading users</h1>
          <p className="text-lg mb-8 opacity-90">Please try refreshing the page</p>
          <button
            onClick={() => refetch()}
            className="bg-primary-purple text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Only show "no more users" if we've loaded data and it's empty
  if (!isLoading && users.length === 0 && data !== undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-flame-gradient pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="text-center text-white px-4">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">No more users!</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">Check back later for more matches</p>
          <button
            onClick={() => router.push('/matches')}
            className="bg-neutral-white text-primary-purple px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            View Matches
          </button>
        </div>
      </div>
    )
  }

  const currentUser = users[currentIndex]

  return (
    <div className="min-h-screen bg-flame-gradient p-2 md:p-4 pt-16 md:pt-4 pb-24 md:pb-8">
      <div className="max-w-md mx-auto h-[calc(100vh-8rem)] md:h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <AnimatePresence>
            {currentUser && (
                  <motion.div
                    key={currentIndex}
                    drag="x"
                    dragConstraints={{ left: -300, right: 300 }}
                    dragElastic={0.1}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, x: dragX }}
                    exit={{ x: exitX, opacity: 0, scale: 0.5 }}
                    className="absolute w-full max-w-sm swipe-card"
                    style={{ rotate: dragX * 0.05 }}
                  >
                <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative">
                  {/* Swipe Animation Overlays */}
                  {Math.abs(dragX) > 20 && (
                    <>
                      {/* Like (Green) Overlay - Right Side */}
                      {dragX > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: Math.min(dragX / 150, 0.8) }}
                          className="absolute inset-0 bg-success/30 backdrop-blur-sm z-20 rounded-2xl md:rounded-3xl flex items-center justify-center pointer-events-none"
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ 
                              scale: Math.min(dragX / 100, 1),
                              rotate: Math.min(dragX / 10, 30)
                            }}
                            className="text-success"
                          >
                            <Heart className="w-20 h-20 md:w-24 md:h-24 fill-success stroke-success" />
                          </motion.div>
                        </motion.div>
                      )}
                      {/* Dislike (Red) Overlay - Left Side */}
                      {dragX < 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: Math.min(Math.abs(dragX) / 150, 0.8) }}
                          className="absolute inset-0 bg-error/30 backdrop-blur-sm z-20 rounded-2xl md:rounded-3xl flex items-center justify-center pointer-events-none"
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: 30 }}
                            animate={{ 
                              scale: Math.min(Math.abs(dragX) / 100, 1),
                              rotate: Math.max(dragX / 10, -30)
                            }}
                            className="text-error"
                          >
                            <X className="w-20 h-20 md:w-24 md:h-24 stroke-error" strokeWidth={4} />
                          </motion.div>
                        </motion.div>
                      )}
                    </>
                  )}
                  <div className="relative h-[60vh] md:h-[500px] bg-neutral-light-grey flex items-center justify-center overflow-hidden">
                    {currentUser.photos && currentUser.photos.length > 0 && currentUser.photos[photoIndex] ? (
                      <img
                        src={currentUser.photos[photoIndex].url}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-primary-purple text-6xl md:text-8xl font-bold">
                        {currentUser.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    {currentUser.photos && currentUser.photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPhotoIndex((prev) => Math.max(0, prev - 1))
                          }}
                          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-neutral-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:bg-neutral-white transition-all z-10 touch-manipulation"
                        >
                          <span className="text-xl md:text-2xl text-neutral-near-black">←</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPhotoIndex((prev) =>
                              Math.min(currentUser.photos.length - 1, prev + 1)
                            )
                          }}
                          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-neutral-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:bg-neutral-white transition-all z-10 touch-manipulation"
                        >
                          <span className="text-xl md:text-2xl text-neutral-near-black">→</span>
                        </button>
                        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {currentUser.photos.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 md:h-2 rounded-full transition-all ${
                                idx === photoIndex ? 'w-6 md:w-8 bg-neutral-white' : 'w-1.5 md:w-2 bg-neutral-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 md:p-6 bg-gradient-to-b from-neutral-white to-neutral-light-grey">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl md:text-3xl font-bold text-neutral-near-black">
                        {currentUser.name}, {currentUser.age}
                      </h2>
                    </div>
                    {currentUser.bio && (
                      <p className="text-sm md:text-base text-neutral-dark-grey leading-relaxed">{currentUser.bio}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-4 md:gap-6 pb-2 md:pb-8 relative">
          {/* Undo/Back Button - positioned to the left of the action buttons */}
          {lastSwipedUser && currentIndex > 0 && (
            <button
              onClick={handleUndo}
              disabled={undoMutation.isPending}
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-neutral-white shadow-xl flex items-center justify-center active:scale-95 md:hover:scale-110 hover:shadow-2xl transition-all touch-manipulation disabled:opacity-50 z-10"
              aria-label="Undo last swipe"
            >
              <RotateCcw className="w-6 h-6 md:w-7 md:h-7 text-primary-purple" />
            </button>
          )}

          {/* Dislike Button */}
          <div className="relative">
            <button
              onClick={() => handleSwipe('dislike')}
              onMouseEnter={() => setShowTooltip('dislike')}
              onMouseLeave={() => setShowTooltip(null)}
              onTouchStart={() => setShowTooltip('dislike')}
              onTouchEnd={() => setTimeout(() => setShowTooltip(null), 2000)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-white shadow-xl flex items-center justify-center active:scale-95 md:hover:scale-110 hover:shadow-2xl transition-all group touch-manipulation"
              aria-label="Dislike"
            >
              <X className="w-8 h-8 md:w-10 md:h-10 text-error group-active:rotate-90 transition-transform" />
            </button>
            {showTooltip === 'dislike' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-near-black text-neutral-white text-xs md:text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none"
              >
                Pass
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-neutral-near-black rotate-45"></div>
              </motion.div>
            )}
          </div>

          {/* Super Like Button */}
          <div className="relative">
            <button
              onClick={() => handleSwipe('superlike')}
              onMouseEnter={() => setShowTooltip('superlike')}
              onMouseLeave={() => setShowTooltip(null)}
              onTouchStart={() => setShowTooltip('superlike')}
              onTouchEnd={() => setTimeout(() => setShowTooltip(null), 2000)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-super-like shadow-xl flex items-center justify-center active:scale-95 md:hover:scale-110 hover:shadow-2xl transition-all group touch-manipulation"
              aria-label="Super Like"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white group-active:rotate-180 transition-transform" />
            </button>
            {showTooltip === 'superlike' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-near-black text-neutral-white text-xs md:text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none"
              >
                Super Like - Stand out!
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-neutral-near-black rotate-45"></div>
              </motion.div>
            )}
          </div>

          {/* Like Button */}
          <div className="relative">
            <button
              onClick={() => handleSwipe('like')}
              onMouseEnter={() => setShowTooltip('like')}
              onMouseLeave={() => setShowTooltip(null)}
              onTouchStart={() => setShowTooltip('like')}
              onTouchEnd={() => setTimeout(() => setShowTooltip(null), 2000)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-success shadow-xl flex items-center justify-center active:scale-95 md:hover:scale-110 hover:shadow-2xl transition-all group touch-manipulation"
              aria-label="Like"
            >
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-white group-active:scale-125 transition-transform fill-white" />
            </button>
            {showTooltip === 'like' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-near-black text-neutral-white text-xs md:text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none"
              >
                Like
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-neutral-near-black rotate-45"></div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
