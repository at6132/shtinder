'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { io, Socket } from 'socket.io-client'
import { Send, ArrowLeft, MessageCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  senderId: string
  content?: string
  type: string
  createdAt: string
  sender?: {
    name: string
    photos: { url: string }[]
  }
}

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
    senderId: string
  }
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string
  const user = useAuthStore((state) => state.user)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [message, setMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true) // Show sidebar by default on desktop
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, refetch } = useQuery({
    queryKey: ['chat', matchId],
    queryFn: async () => {
      const res = await api.get(`/chat/${matchId}`)
      return res.data
    },
  })

  // Fetch all matches for sidebar
  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get('/matches')
      return res.data
    },
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`
    }
    const newSocket = io(`${apiUrl}/chat`, {
      auth: { token },
    })

    newSocket.on('connect', () => {
      newSocket.emit('match:join', matchId)
    })

    newSocket.on('message:receive', () => {
      refetch()
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('match:leave', matchId)
      newSocket.disconnect()
    }
  }, [matchId, refetch])

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.post('/chat/send', {
        matchId,
        content,
        type: 'text',
      })
    },
    onSuccess: () => {
      setMessage('')
      refetch()
    },
  })

  const handleSend = () => {
    if (message.trim() && !sendMessageMutation.isPending) {
      // Only send via API - socket will broadcast to other users automatically
      sendMessageMutation.mutate(message)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get the other user's info from the first message
  const otherUser = messages?.[0]?.sender && messages[0].senderId !== user?.id 
    ? messages[0].sender 
    : null

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatLastMessageTime = (dateString: string) => {
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

  return (
    <div className="flex h-screen bg-soft-love-gradient pt-16 md:pt-0 pb-0 md:pb-0 overflow-hidden">
      {/* Sidebar - Tinder-style chat list (hidden on mobile) */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden'} hidden md:flex flex-col w-80 bg-neutral-white border-r border-neutral-light-grey`}>
        <div className="p-4 border-b border-neutral-light-grey">
          <h2 className="text-xl font-bold text-neutral-near-black flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary-purple" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {matches?.length === 0 ? (
            <div className="p-4 text-center text-neutral-dark-grey">
              <p>No matches yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-light-grey">
              {matches?.map((match: Match) => {
                const isActive = match.id === matchId
                return (
                  <Link
                    key={match.id}
                    href={`/chat/${match.id}`}
                    className={`block p-4 hover:bg-neutral-light-grey transition-colors ${isActive ? 'bg-primary-purple/10 border-l-4 border-primary-purple' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-light-grey flex-shrink-0">
                        {match.user.photos && match.user.photos[0] ? (
                          <img
                            src={match.user.photos[0].url}
                            alt={match.user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-lg font-bold text-primary-purple">
                              {match.user.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm text-neutral-near-black truncate">
                            {match.user.name}
                          </h3>
                          {match.lastMessage && (
                            <span className="text-xs text-neutral-medium-grey flex items-center gap-1 flex-shrink-0 ml-2">
                              <Clock className="w-3 h-3" />
                              {formatLastMessageTime(match.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {match.lastMessage ? (
                          <p className="text-xs text-neutral-dark-grey truncate">
                            {match.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {match.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-xs text-primary-purple font-medium">
                            Start a conversation
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header - Mobile optimized */}
        <div className="bg-neutral-white border-b border-neutral-light-grey px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-4 shadow-sm safe-area-inset-top z-10 flex-shrink-0">
          <button
            onClick={() => router.push('/dms')}
            className="p-2 -ml-1 active:bg-neutral-light-grey rounded-lg transition-colors touch-manipulation md:hidden"
            aria-label="Back to messages"
          >
            <ArrowLeft className="w-6 h-6 text-neutral-dark-grey" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block p-2 hover:bg-neutral-light-grey rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-neutral-dark-grey" />
          </button>
          {otherUser && (
            <>
              <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-neutral-light-grey flex-shrink-0">
                {otherUser.photos && otherUser.photos[0] ? (
                  <img
                    src={otherUser.photos[0].url}
                    alt={otherUser.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-base md:text-lg font-bold text-primary-purple">
                      {otherUser.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base md:text-lg text-neutral-near-black truncate">{otherUser.name}</h2>
              </div>
            </>
          )}
        </div>

        {/* Messages - Mobile optimized */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5 md:space-y-4 overscroll-contain">
          {messages?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <MessageCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto text-primary-purple/50 mb-4" />
                <p className="text-neutral-dark-grey text-sm md:text-base">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages?.map((msg: Message) => {
              const isOwn = msg.senderId === user?.id
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] md:max-w-xs lg:max-w-md px-3.5 md:px-4 py-2.5 md:py-3 rounded-2xl md:rounded-2xl shadow-sm ${
                      isOwn
                        ? 'bg-flame-gradient text-white'
                        : 'bg-neutral-light-grey text-neutral-near-black border border-neutral-light-grey'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] md:text-xs mt-1.5 ${
                      isOwn ? 'text-white/70' : 'text-neutral-dark-grey'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Mobile optimized with safe area */}
        <div className="bg-neutral-white border-t border-neutral-light-grey p-3 md:p-4 pb-safe safe-area-inset-bottom flex-shrink-0">
          <div className="flex gap-2 md:gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="w-full px-4 md:px-4 py-3 md:py-3 pr-12 md:pr-12 border border-neutral-light-grey rounded-2xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all resize-none text-base md:text-base touch-manipulation"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-flame-gradient text-white p-3 md:p-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center touch-manipulation min-w-[48px] min-h-[48px]"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
