'use client'

import { useEffect, useState } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import {
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  DollarSign,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CallLog {
  id: string
  assistantName: string
  createdAt: string
  startedAt?: string
  endedAt?: string
  duration: number
  status: string
  type: string
  cost: number
  costBreakdown?: {
    total: number
    transport?: number
    stt?: number
    llm?: number
    tts?: number
    vapi?: number
  }
  transcript: string
  summary: string
  orgId: string
  assistantId: string
}

interface CallHistoryResponse {
  success: boolean
  data: CallLog[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export default function CallHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [openCall, setOpenCall] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const fetchCallHistory = async (refresh = false, page = 1) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    setError(null)

    try {
      const authToken = localStorage.getItem('user-token')

      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/call-history?refresh=${refresh}&page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: CallHistoryResponse = await response.json()
      setCallLogs(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching call history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch call history')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCallHistory(false, currentPage)
    }
  }, [user, currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-maxfit-neon-green" />
      case 'failed':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const toggleCall = (callId: string) => {
    setOpenCall(openCall === callId ? null : callId)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const parseTranscript = (transcript: string) => {
    if (!transcript) return []

    // Try to parse as JSON first (in case it's structured)
    try {
      const parsed = JSON.parse(transcript)
      if (Array.isArray(parsed)) {
        return parsed
      }
      // If it's an object with messages property
      if (parsed.messages && Array.isArray(parsed.messages)) {
        return parsed.messages
      }
    } catch {
      // If not JSON, split by common patterns
      const lines = transcript.split(/\n|(?:User:|Assistant:|AI:|Human:)/i)
      return lines
        .filter((line) => line.trim().length > 0)
        .map((line, index) => ({
          speaker: index % 2 === 0 ? 'User' : 'Assistant',
          message: line.trim(),
        }))
    }

    return []
  }
  if (authLoading) return null
  if (!user) return null
  if (loading && !refreshing) {
    return (
      <RequirePlanAccess>
        <div className="min-h-screen bg-hero-gradient p-3 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20  rounded-xl sm:rounded-2xl p-4 sm:p-8">
              <div className="animate-pulse">
                <div className="h-6 sm:h-8 bg-maxfit-medium-grey/20 rounded w-1/3 mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-maxfit-medium-grey/20 rounded w-2/3 mb-6 sm:mb-8"></div>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 sm:h-20 bg-maxfit-medium-grey/10 rounded-lg sm:rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </RequirePlanAccess>
    )
  }

  return (
    <RequirePlanAccess>
      <div className="min-h-screen bg-hero-gradient p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-maxfit-white mb-1 sm:mb-2">
                  Call <span className="text-maxfit-neon-green text-glow">History</span>
                </h1>
                <p className="text-maxfit-medium-grey text-sm sm:text-lg">
                  View your AI voice assistant conversation logs and transcripts
                </p>
              </div>
              <button
                onClick={() => fetchCallHistory(true, currentPage)}
                disabled={refreshing}
                className="btn-neon px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base w-fit"
              >
                <RefreshCw
                  className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error ? (
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20  rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center">
              <AlertCircle className="w-10 sm:w-16 h-10 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-maxfit-white mb-1.5 sm:mb-2">
                Error Loading Calls
              </h3>
              <p className="text-maxfit-medium-grey text-sm sm:text-base mb-4 sm:mb-6">{error}</p>
              <button
                onClick={() => fetchCallHistory(true, currentPage)}
                className="btn-neon px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          ) : callLogs.length === 0 && !loading ? (
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center">
              <Phone className="w-10 sm:w-16 h-10 sm:h-16 text-maxfit-medium-grey mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-maxfit-white mb-1.5 sm:mb-2">
                No Call History Yet
              </h3>
              <p className="text-maxfit-medium-grey text-sm sm:text-base mb-4 sm:mb-6">
                Start a conversation with our AI assistant to see your call history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {callLogs.map((call) => (
                <div
                  key={call.id}
                  className="bg-gradient-to-r from-gray-800/40 to-gray-700/20  rounded-xl sm:rounded-2xl overflow-hidden"
                >
                  {/* Call Header */}
                  <div
                    className="p-3 sm:p-6 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors border-b border-maxfit-medium-grey/20"
                    onClick={() => toggleCall(call.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex-shrink-0">
                          {openCall === call.id ? (
                            <ChevronDown className="w-5 sm:w-6 h-5 sm:h-6 text-maxfit-neon-green" />
                          ) : (
                            <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6 text-maxfit-medium-grey" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                            <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-neon-green" />
                            <span className="text-maxfit-white font-semibold text-xs sm:text-base">
                              {formatDate(call.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-medium-grey" />
                              <span className="text-maxfit-medium-grey text-[10px] sm:text-sm">
                                {call.assistantName}
                              </span>
                            </div>
                            {call.summary && (
                              <span className="text-maxfit-medium-grey text-[10px] sm:text-sm line-clamp-1 hidden sm:inline">
                                {call.summary.slice(0, 100)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-0.5 sm:mb-1">
                          {getStatusIcon(call.status)}
                          <span className="text-maxfit-neon-green font-semibold capitalize text-xs sm:text-base">
                            {call.status}
                          </span>
                        </div>
                        {/* <div className="flex items-center space-x-2 sm:space-x-4 text-[10px] sm:text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-medium-grey" />
                            <span className="text-maxfit-medium-grey">
                              {formatDuration(call.duration)}
                            </span>
                          </div>
                          {call.cost > 0 && (
                            <div className="flex items-center space-x-1 hidden sm:flex">
                              <DollarSign className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-neon-green" />
                              <span className="text-maxfit-neon-green">
                                ${call.cost.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {/* Call Details */}
                  {openCall === call.id && (
                    <div className="p-6 bg-maxfit-darker-grey/30">
                      {/* Call Summary */}
                      {call.summary && (
                        <div className="mb-6">
                          <h3 className="text-sm sm:text-xl font-bold text-maxfit-white mb-3">
                            Call Summary
                          </h3>
                          <p className="text-xs sm:text-sm text-maxfit-medium-grey leading-relaxed">
                            {call.summary}
                          </p>
                        </div>
                      )}

                      {/* Call Transcript */}
                      {call.transcript && (
                        <div className="mb-6">
                          <h3 className="text-sm sm:text-xl font-bold text-maxfit-white mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-maxfit-neon-green" />
                            Conversation Transcript
                          </h3>
                          <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20  rounded-xl p-4 max-h-96 overflow-y-auto">
                            {parseTranscript(call.transcript).length > 0 ? (
                              <div className="space-y-4">
                                {parseTranscript(call.transcript).map(
                                  (message: any, index: any) => (
                                    <div key={index} className="flex gap-3">
                                      <div className="flex-shrink-0">
                                        {message.speaker === 'User' ? (
                                          <div className="w-8 h-8 bg-maxfit-neon-green/20 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-maxfit-neon-green" />
                                          </div>
                                        ) : (
                                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-purple-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs sm:text-sm text-maxfit-medium-grey mb-1">
                                          {message.speaker ||
                                            (index % 2 === 0 ? 'User' : 'Assistant')}
                                        </div>
                                        <div className="text-maxfit-white text-sm sm:text-base leading-relaxed">
                                          {message.message || message}
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <MessageSquare className="w-12 h-12 text-maxfit-medium-grey mx-auto mb-3" />
                                <p className="text-xs sm:text-sm text-maxfit-medium-grey">
                                  No transcript available for this call
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Call Details & Cost Breakdown */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* <div>
                          <h4 className="text-lg font-bold text-maxfit-white mb-3">Call Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-maxfit-medium-grey">Call ID:</span>
                              <code className="text-maxfit-neon-green text-sm bg-maxfit-darker-grey/50 px-2 py-1 rounded">
                                {call.id.slice(0, 12)}...
                              </code>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-maxfit-medium-grey">Type:</span>
                              <span className="text-maxfit-white capitalize">{call.type}</span>
                            </div>
                            {call.startedAt && (
                              <div className="flex justify-between">
                                <span className="text-maxfit-medium-grey">Started:</span>
                                <span className="text-maxfit-white text-sm">
                                  {formatDate(call.startedAt)}
                                </span>
                              </div>
                            )}
                            {call.endedAt && (
                              <div className="flex justify-between">
                                <span className="text-maxfit-medium-grey">Ended:</span>
                                <span className="text-maxfit-white text-sm">
                                  {formatDate(call.endedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div> */}

                        {/* {call.costBreakdown && (
                          <div>
                            <h4 className="text-lg font-bold text-maxfit-white mb-3">
                              Cost Breakdown
                            </h4>
                            <div className="space-y-2">
                              {call.costBreakdown.transport && (
                                <div className="flex justify-between">
                                  <span className="text-maxfit-medium-grey">Transport:</span>
                                  <span className="text-maxfit-white">
                                    ${call.costBreakdown.transport.toFixed(4)}
                                  </span>
                                </div>
                              )}
                              {call.costBreakdown.stt && (
                                <div className="flex justify-between">
                                  <span className="text-maxfit-medium-grey">Speech-to-Text:</span>
                                  <span className="text-maxfit-white">
                                    ${call.costBreakdown.stt.toFixed(4)}
                                  </span>
                                </div>
                              )}
                              {call.costBreakdown.llm && (
                                <div className="flex justify-between">
                                  <span className="text-maxfit-medium-grey">LLM:</span>
                                  <span className="text-maxfit-white">
                                    ${call.costBreakdown.llm.toFixed(4)}
                                  </span>
                                </div>
                              )}
                              {call.costBreakdown.tts && (
                                <div className="flex justify-between">
                                  <span className="text-maxfit-medium-grey">Text-to-Speech:</span>
                                  <span className="text-maxfit-white">
                                    ${call.costBreakdown.tts.toFixed(4)}
                                  </span>
                                </div>
                              )}
                              {call.costBreakdown.vapi && (
                                <div className="flex justify-between">
                                  <span className="text-maxfit-medium-grey">Vapi:</span>
                                  <span className="text-maxfit-white">
                                    ${call.costBreakdown.vapi.toFixed(4)}
                                  </span>
                                </div>
                              )}
                              <div className="border-t border-maxfit-medium-grey/20 pt-2 mt-2">
                                <div className="flex justify-between font-semibold">
                                  <span className="text-maxfit-white">Total:</span>
                                  <span className="text-maxfit-neon-green">
                                    ${call.cost.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )} */}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/20  rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-maxfit-medium-grey">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} calls
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-1 bg-maxfit-medium-grey/20 hover:bg-maxfit-medium-grey/30 disabled:bg-maxfit-medium-grey/10 text-maxfit-white rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-maxfit-medium-grey">
                        Page {pagination.page}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        className="px-3 py-1 bg-maxfit-medium-grey/20 hover:bg-maxfit-medium-grey/30 disabled:bg-maxfit-medium-grey/10 text-maxfit-white rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RequirePlanAccess>
  )
}
