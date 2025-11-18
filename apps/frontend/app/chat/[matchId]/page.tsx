'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useAuthStore } from '@/store/auth-store'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'

interface Message {
  id: string
  senderId: string
  content?: string
  type: string
  createdAt: string
}

export default function ChatPage() {
  const params = useParams()
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

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/chat`, {
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg: Message) => {
          const isOwn = msg.senderId === user?.id
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn ? 'bg-primary text-white' : 'bg-white text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

