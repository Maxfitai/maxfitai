'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Send, User, Loader2 } from 'lucide-react'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { useChat, ChatMessage } from '@/app/(frontend)/hooks/use-chat'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  sender: string | { id: string; value?: string }
  senderType?: string
  createdAt: string
}

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  coachId: string
  coachName: string
  coachImage: string
}

export default function ChatPopup({
  isOpen,
  onClose,
  conversationId,
  coachId,
  coachName,
  coachImage,
}: ChatPopupProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ─── WebSocket: join the conversation room ────────────────────────────
  const rooms = useMemo(
    () => (isOpen && conversationId ? [`conv:${conversationId}`] : []),
    [isOpen, conversationId],
  )

  const handleWsMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      // Replace optimistic message if it exists with same content
      const optimisticIdx = prev.findIndex(
        (m) => m.id.startsWith('optimistic-') && m.content === msg.content,
      )
      if (optimisticIdx !== -1) {
        const updated = [...prev]
        updated[optimisticIdx] = msg
        return updated
      }
      return [...prev, msg]
    })
  }, [])

  const { isConnected, clearSeenCache } = useChat({
    rooms,
    onMessage: handleWsMessage,
    enabled: isOpen && !!conversationId,
  })

  // ─── Reset unread count when user opens the chat ──────────────────────
  const resetUnread = useCallback(async () => {
    if (!conversationId) return
    try {
      await fetch(`/api/conversations/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, role: 'user' }),
      })
    } catch {
      // non-critical
    }
  }, [conversationId])

  // ─── Fetch message history ─────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!conversationId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  // Load history and reset unread when popup opens
  useEffect(() => {
    if (!isOpen || !conversationId) return
    clearSeenCache()
    fetchHistory()
    resetUnread()
  }, [isOpen, conversationId, fetchHistory, resetUnread, clearSeenCache])

  // Reset unread when new messages arrive from the other side
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.senderType !== 'user' && !lastMsg.id.startsWith('optimistic-')) {
        resetUnread()
      }
    }
  }, [messages, isOpen, resetUnread])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Optimistic update
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      content,
      sender: user.email,
      senderType: 'user',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: user.email,
          senderType: 'user',
          content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const realMsg: Message = { ...data.message, senderType: 'user' }
        // Replace optimistic with real if WS hasn't already done it
        setMessages((prev) => {
          const alreadyAdded = prev.some((m) => m.id === realMsg.id)
          if (alreadyAdded) {
            return prev.filter((m) => m.id !== optimistic.id)
          }
          return prev.map((m) => (m.id === optimistic.id ? realMsg : m))
        })
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setIsSending(false)
    }
  }

  const isOwnMessage = (msg: Message) => {
    if (msg.senderType) return msg.senderType === 'user'
    if (typeof msg.sender === 'object' && msg.sender !== null) {
      const s = msg.sender as any
      if (s.relationTo) return s.relationTo === 'users'
      const id = s.value?.id ?? s.value ?? s.id
      return id === (user as any)?.id || id === user?.email
    }
    return (msg.sender as string) === user?.email || (msg.sender as string) === (user as any)?.id
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-20 right-4 w-80 md:w-96 h-[500px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#BEEA0C] to-[#9AC40A]">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={coachImage}
              alt={coachName}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="font-bold text-black">{coachName}</h3>
            <p className="text-xs text-black/70">
              {isConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg transition-colors">
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#BEEA0C] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const own = isOwnMessage(msg)
            return (
              <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${own
                    ? 'bg-[#BEEA0C] text-black rounded-br-md'
                    : 'bg-gray-800 text-white rounded-bl-md'
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${own ? 'text-black/60' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#BEEA0C]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-[#BEEA0C] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#9AC40A] transition-colors"
          >
            <Send className="w-5 h-5 text-black" />
          </button>
        </div>
      </form>
    </div>
  )
}
