import { create } from 'zustand'

interface Message {
  id: string
  matchId: string
  senderId: string
  receiverId: string
  content?: string
  type: string
  read: boolean
  createdAt: string
}

interface ChatState {
  activeMatchId: string | null
  messages: Record<string, Message[]>
  setActiveMatch: (matchId: string | null) => void
  addMessage: (matchId: string, message: Message) => void
  setMessages: (matchId: string, messages: Message[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeMatchId: null,
  messages: {},
  setActiveMatch: (matchId) => set({ activeMatchId: matchId }),
  addMessage: (matchId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    })),
  setMessages: (matchId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: messages,
      },
    })),
}))

