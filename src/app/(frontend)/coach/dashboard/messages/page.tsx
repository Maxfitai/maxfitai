'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import { Send, Loader2, User, MessageCircle, ArrowLeft } from 'lucide-react'
import { useChat, ChatMessage } from '@/app/(frontend)/hooks/use-chat'

interface Conversation {
  id: string
  user: string
  userName: string
  coachName: string
  lastMessage: string
  lastMessageAt: string
  userUnreadCount: number
  coachUnreadCount: number
}

interface Message {
  id: string
  content: string
  sender: string | { id: string; value?: string }
  senderType?: string
  createdAt: string
  conversationId?: string
}

export default function MessagesPage() {
  const { coach, loading: coachLoading } = useCoachAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeConvIdRef = useRef<string | null>(null)

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) ?? null

  // ─── WebSocket rooms ──────────────────────────────────────────────────
  // Always join the coach-level room. Additionally join the active
  // conversation room when a conversation is selected.
  const rooms = useMemo(() => {
    const r: string[] = []
    if (coach) r.push(`coach:${coach.id}`)
    if (selectedConvId) r.push(`conv:${selectedConvId}`)
    return r
  }, [coach, selectedConvId])

  // ─── Handle incoming WebSocket messages ───────────────────────────────
  const handleWsMessage = useCallback(
    (msg: ChatMessage) => {
      const convId = msg.conversationId

      // 1) If the message belongs to the active conversation, add to chat
      if (convId && convId === activeConvIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          // Replace optimistic message with same content
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
      }

      // 2) If the message has no conversationId, it's from the conv: room
      //    for the active chat — add it directly
      if (!convId) {
        if (activeConvIdRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
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
        }
      }

      // 3) Update sidebar for any conversation
      if (convId) {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === convId)
          if (!exists) {
            // New conversation — re-fetch full list to get enriched data
            fetchConversations()
            return prev
          }
          return prev.map((c) => {
            if (c.id !== convId) return c
            const isActive = activeConvIdRef.current === convId
            return {
              ...c,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              coachUnreadCount:
                isActive || msg.senderType === 'coach'
                  ? c.coachUnreadCount
                  : c.coachUnreadCount + 1,
            }
          })
        })
      }
    },
    [], // fetchConversations is stable via useCallback
  )

  const { isConnected, clearSeenCache } = useChat({
    rooms,
    onMessage: handleWsMessage,
    enabled: !!coach && !coachLoading,
  })

  // ─── Fetch conversations ─────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!coach) return
    try {
      const response = await fetch(`/api/conversations?coachId=${coach.id}`)
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [coach])

  useEffect(() => {
    if (coach && !coachLoading) {
      fetchConversations()
    }
  }, [coach, coachLoading, fetchConversations])

  // ─── Fetch message history ────────────────────────────────────────────────
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsMessagesLoading(true)
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      if (activeConvIdRef.current === conversationId) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsMessagesLoading(false)
    }
  }, [])

  // ─── Reset unread count when coach opens a conversation ──────────────────
  const resetUnread = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, coachUnreadCount: 0 } : c)),
    )
    try {
      await fetch(`/api/conversations/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, role: 'coach' }),
      })
    } catch {
      // non-critical
    }
  }, [])

  // ─── Open a conversation ─────────────────────────────────────────────────
  const openConversation = useCallback(
    (convId: string) => {
      if (activeConvIdRef.current === convId) return
      activeConvIdRef.current = convId
      setSelectedConvId(convId)
      setMessages([])
      clearSeenCache()
      fetchMessages(convId)
      resetUnread(convId)
    },
    [fetchMessages, resetUnread, clearSeenCache],
  )

  // ─── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── Send a message ───────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !coach || !selectedConvId) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      content,
      sender: coach.id,
      senderType: 'coach',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          senderId: coach.id,
          senderType: 'coach',
          content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const realMsg: Message = { ...data.message, senderType: 'coach' }
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
    if (msg.senderType) return msg.senderType === 'coach'
    if (typeof msg.sender === 'object' && msg.sender !== null) {
      const s = msg.sender as any
      if (s.relationTo) return s.relationTo === 'coaches'
      const id = s.value?.id ?? s.value ?? s.id
      return id === coach?.id
    }
    return (msg.sender as string) === coach?.id
  }

  if (coachLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#BEEA0C] animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-80px)]">
      <h1 className="text-2xl sm:text-4xl font-bold text-white mb-6">Messages</h1>

      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl h-[calc(100%-80px)] overflow-hidden flex">
        {/* Conversations List */}
        <div
          className={`${selectedConvId ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-gray-800 overflow-y-auto`}
        >
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-2">
                Users will be able to chat after their enrollment is accepted
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                    selectedConvId === conv.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BEEA0C]/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#BEEA0C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">{conv.userName}</h3>
                        {conv.coachUnreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-[#BEEA0C] text-black text-xs rounded-full">
                            {conv.coachUnreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      {conv.lastMessageAt && (
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`${selectedConvId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <button
                  onClick={() => {
                    activeConvIdRef.current = null
                    setSelectedConvId(null)
                    setMessages([])
                  }}
                  className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#BEEA0C]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#BEEA0C]" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{selectedConversation.userName}</h3>
                  <p className="text-xs text-gray-500">
                    {isConnected ? 'Connected' : 'Reconnecting...'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isMessagesLoading ? (
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
                          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                            own
                              ? 'bg-[#BEEA0C] text-black rounded-br-md'
                              : 'bg-gray-800 text-white rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${own ? 'text-black/60' : 'text-gray-500'}`}
                          >
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

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm mt-2">Choose a user to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
