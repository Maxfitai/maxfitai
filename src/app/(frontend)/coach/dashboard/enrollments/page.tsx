'use client'

import { useEffect, useState } from 'react'
import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Card, CardContent } from '@/app/(frontend)/components/ui/card'
import { Check, X, Loader2, Clock, User, Dumbbell } from 'lucide-react'

interface Enrollment {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  coach: string
  plan: {
    id: string
    title: string
    price: number
  }
  status: 'pending' | 'accepted' | 'rejected'
  paymentStatus: string
  notes: string
  createdAt: string
}

export default function EnrollmentsPage() {
  const { coach, loading: coachLoading } = useCoachAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    if (coach && !coachLoading) {
      fetchEnrollments()
    }
  }, [coach, coachLoading])

  const fetchEnrollments = async () => {
    if (!coach) return

    try {
      const response = await fetch(`/api/enrollments?coachId=${coach.id}`)
      const data = await response.json()

      const enrichedEnrollments = await Promise.all(
        (data.enrollments || []).map(async (enrollment: any) => {
          // Payload may return user/plan as already-populated objects or as IDs
          let userData =
            enrollment.user && typeof enrollment.user === 'object'
              ? enrollment.user
              : { firstName: 'Unknown', lastName: '', email: enrollment.user }

          let planData =
            enrollment.plan && typeof enrollment.plan === 'object'
              ? enrollment.plan
              : { title: 'Unknown Plan', price: 0 }

          // Only fetch user if it came back as a plain ID/email string
          if (typeof enrollment.user === 'string') {
            try {
              const userResponse = await fetch(
                `/api/users/get-user?email=${encodeURIComponent(enrollment.user)}`,
              )
              const uData = await userResponse.json()
              if (uData.user) userData = uData.user
            } catch (e) {
              console.error('Error fetching user:', e)
            }
          }

          // Only fetch plan if it came back as a plain ID string
          if (typeof enrollment.plan === 'string') {
            try {
              const planResponse = await fetch(`/api/plans/${enrollment.plan}`)
              const pData = await planResponse.json()
              if (pData.plan) planData = pData.plan
            } catch (e) {
              console.error('Error fetching plan:', e)
            }
          }

          return {
            ...enrollment,
            user: userData,
            plan: planData,
          }
        }),
      )

      setEnrollments(enrichedEnrollments)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnrollmentAction = async (enrollmentId: string, status: 'accepted' | 'rejected') => {
    setProcessingId(enrollmentId)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e)))
      }
    } catch (error) {
      console.error('Error updating enrollment:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredEnrollments = enrollments.filter((e) =>
    filter === 'all' ? true : e.status === filter,
  )

  if (coachLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#BEEA0C] animate-spin" />
      </div>
    )
  }

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Enrollment Requests</h1>
          <p className="text-maxfit-medium-grey">
            Manage user enrollment requests for your training plans
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#BEEA0C] text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No enrollment requests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="bg-gray-900/40 border-gray-800 overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#BEEA0C]/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#BEEA0C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {enrollment.user?.firstName} {enrollment.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-400">{enrollment.user?.email}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Dumbbell className="w-4 h-4" />
                        <span>Plan: {enrollment.plan?.title || 'N/A'}</span>
                      </div>
                      {enrollment.notes && (
                        <p className="mt-2 text-sm text-gray-400 italic">
                          Note: {enrollment.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : enrollment.status === 'accepted'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>

                    {enrollment.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEnrollmentAction(enrollment.id, 'accepted')}
                          disabled={processingId === enrollment.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === enrollment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleEnrollmentAction(enrollment.id, 'rejected')}
                          disabled={processingId === enrollment.id}
                          variant="destructive"
                        >
                          {processingId === enrollment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
