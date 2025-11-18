'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useAuthStore } from '@/store/auth-store'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import { Send, ArrowLeft, Image as ImageIcon } from 'lucide-react'

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

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string
  const user = useAuthStore((state) => state.user)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, refetch } = useQuery({
    queryKey: ['chat', matchId],
    queryFn: async () => {
      const res = await api.get(`/chat/${matchId}`)
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
    if (message.trim()) {
      sendMessageMutation.mutate(message)
      socket?.emit('message:send', {
        matchId,
        content: message,
        type: 'text',
      })
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

  return (
    <div className="flex flex-col h-screen bg-soft-love-gradient pt-16 md:pt-0 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-neutral-white border-b border-neutral-light-grey px-3 md:px-4 py-2 md:py-3 flex items-center gap-3 md:gap-4 shadow-sm safe-area-inset-top">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-light-grey rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-dark-grey" />
        </button>
        {otherUser && (
          <>
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-light-grey flex-shrink-0">
              {otherUser.photos && otherUser.photos[0] ? (
                <img
                  src={otherUser.photos[0].url}
                  alt={otherUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-lg font-bold text-primary-purple">
                    {otherUser.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-neutral-near-black">{otherUser.name}</h2>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages?.map((msg: Message) => {
          const isOwn = msg.senderId === user?.id
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-[75%] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-md ${
                  isOwn
                    ? 'bg-flame-gradient text-white'
                    : 'bg-neutral-light-grey text-neutral-near-black border border-neutral-light-grey'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                <p className={`text-xs mt-1.5 ${
                  isOwn ? 'text-white/70' : 'text-neutral-dark-grey'
                }`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-neutral-white border-t border-neutral-light-grey p-3 md:p-4 safe-area-inset-bottom">
        <div className="flex gap-2 md:gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="w-full px-3 md:px-4 py-2.5 md:py-3 pr-10 md:pr-12 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all resize-none text-sm md:text-base"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-flame-gradient text-white p-2.5 md:p-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center touch-manipulation"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
