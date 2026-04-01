'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Textarea } from '@/app/(frontend)/components/ui/textarea'
import { Label } from '@/app/(frontend)/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/(frontend)/components/ui/card'
import { Star, Send, MessageSquare } from 'lucide-react'
import { useToast } from '@/app/(frontend)/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthProvider'

export default function FeedbackPage() {
  const [subject, setSubject] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])
  if (loading) return null
  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('user-token')
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          subject,
          rating,
          feedback,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      toast({
        title: 'Feedback submitted!',
        description: 'Thank you for your feedback. We appreciate your input.',
        className: 'bg-accent-gradient text-black border-none',
      })

      // Reset form
      setSubject('')
      setRating(0)
      setFeedback('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-black text-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full ">
        <div className="mb-4 sm:mb-8 text-start">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            We Value Your <span className="text-maxfit-neon-green">Feedback</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Help us improve your experience by sharing your thoughts and suggestions.
          </p>
        </div>

        <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-maxfit-neon-green" />
              Share your experience
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Your feedback helps us build a better platform for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-200">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="What is this regarding?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-maxfit-neon-green focus:ring-maxfit-neon-green/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200 text-sm">Rating</Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 sm:w-8 h-6 sm:h-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'fill-[#C7F50D] text-[#C7F50D]'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs sm:text-sm text-gray-400">
                    {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-gray-200 text-sm">
                  Your Feedback
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you think..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  className="min-h-[100px] sm:min-h-[150px] bg-gray-800/50 border-gray-700 text-white text-sm sm:text-base placeholder:text-gray-500 focus:border-maxfit-neon-green focus:ring-maxfit-neon-green/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent-gradient text-black hover:bg-maxfit-neon-green/90 font-bold h-10 sm:h-12 text-sm sm:text-lg shadow-lg shadow-maxfit-neon-green/20 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 sm:w-5 h-4 sm:h-5" />
                    Submit Feedback
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
