'use client'

import { Coach } from './constants'
import { Card, CardContent, CardHeader } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Star, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitter,
  FaShareAlt,
} from 'react-icons/fa'
import { SetStateAction, useState, useEffect } from 'react'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'

export default function FitnessCoachesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user } = useAuth()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCoaches()
  }, [])

  const fetchCoaches = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/coaches/list')
      if (!response.ok) {
        throw new Error('Failed to fetch coaches')
      }
      const data = await response.json()
      setCoaches(data)
    } catch (err) {
      console.error('Error fetching coaches:', err)
      setError('Failed to load coaches. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/dashboard/fitness-coaches/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)

    setTimeout(() => {
      setCopiedId(null) // remove tooltip after 2 seconds
    }, 2000)
  }
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-12 text-start mx-auto">
        <h1 className="text-2xl sm:text-4xl md:text-5xl  font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Fitness <span className="text-maxfit-neon-green">Coaches</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg">
          Connect with world-class trainers who can help you achieve your fitness goals through
          personalized guidance and expert strategies.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maxfit-neon-green"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchCoaches} variant="outline" className="text-black">
            Try Again
          </Button>
        </div>
      )}

      {/* Coaches Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 mx-auto">
          {coaches.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-400">No coaches available at the moment.</p>
            </div>
          ) : (
            coaches.map((coach) => (
              <Card
                key={coach.id}
                className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-800 hover:border-maxfit-neon-green/50 transition-all duration-300 group overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 md:h-44 w-full overflow-hidden">
                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                <CardHeader className="relative -mt-10 sm:-mt-12 px-4 sm:px-6 pb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{coach.name}</h2>
                    {coach.verified && (
                      <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-[#B0DA09]" />
                    )}
                    <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 ml-2">
                      ${coach.pricePerSession}/hr
                    </span>
                  </div>
                  <p className="text-maxfit-neon-green font-medium text-xs sm:text-sm uppercase tracking-wider">
                    {coach.role}
                  </p>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 space-y-4 sm:space-y-6">
                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 border-b border-gray-800 pb-3 sm:pb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Trophy className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-maxfit-neon-green" />
                      <span>{coach.experience} Exp</span>
                    </div>

                    {/* Social Links */}
                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                      {coach.socialLinks?.facebook && (
                        <a
                          href={coach.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#B6E10A]"
                        >
                          <FaFacebookF size={14} />
                        </a>
                      )}
                      {coach.socialLinks?.instagram && (
                        <a
                          href={coach.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#B6E10A]"
                        >
                          <FaInstagram size={14} />
                        </a>
                      )}
                      {coach.socialLinks?.youtube && (
                        <a
                          href={coach.socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#B6E10A]"
                        >
                          <FaYoutube size={14} />
                        </a>
                      )}
                      {coach.socialLinks?.tiktok && (
                        <a
                          href={coach.socialLinks.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#B6E10A]"
                        >
                          <FaTiktok size={14} />
                        </a>
                      )}
                      {coach.socialLinks?.twitter && (
                        <a
                          href={coach.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#B6E10A]"
                        >
                          <FaTwitter size={14} />
                        </a>
                      )}

                      <button
                        onClick={() => handleCopyLink(coach.id)}
                        className="hover:text-[#B6E10A] relative"
                        title="Copy Profile Link"
                      >
                        <FaShareAlt size={14} />
                        {copiedId === coach.id && (
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            Link Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Specializations Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {coach.specializations.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-gray-800/50 text-gray-300 border border-gray-700/50"
                      >
                        {spec}
                      </span>
                    ))}
                    {coach.specializations.length > 3 && (
                      <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-gray-800/50 text-gray-400 border border-gray-700/50">
                        +{coach.specializations.length - 3}
                      </span>
                    )}
                  </div>

                  <Link href={`/dashboard/fitness-coaches/${coach.id}`} className="block">
                    <Button className="w-full bg-accent-gradient text-black hover:bg-maxfit-neon-green hover:text-black transition-colors font-semibold group-hover:shadow-lg group-hover:shadow-maxfit-neon-green/20 h-9 sm:h-10 text-sm cursor-pointer">
                      View Profile
                      <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
