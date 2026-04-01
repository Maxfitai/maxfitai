'use client'

import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import { User, ClipboardList, Award, Clock } from 'lucide-react'
import Link from 'next/link'

export default function CoachDashboardPage() {
  const { coach } = useCoachAuth()

  const stats = [
    {
      title: 'Profile Status',
      value: coach?.isActive ? 'Active' : 'Inactive',
      icon: User,
      color: coach?.isActive ? 'text-green-400' : 'text-red-400',
      bgColor: coach?.isActive ? 'bg-green-500/20' : 'bg-red-500/20',
    },
    {
      title: 'Experience',
      value: `${coach?.yearsOfExperience || 0} Years`,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Specializations',
      value: coach?.specializations?.length || 0,
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Certifications',
      value: coach?.certifications?.length || 0,
      icon: ClipboardList,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* Header Section */}
      <div className="mb-6 sm:mb-12 text-start mx-auto">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Welcome back, {coach?.firstName}!
        </h1>
        <p className="text-maxfit-medium-grey text-sm sm:text-lg">
          Manage your profile and fitness plans from your coach dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-maxfit-dark-grey/40 border border-white/5 p-5 hover-lift"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-maxfit-medium-grey mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-maxfit-neon-green/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-maxfit-dark-grey/40 border border-white/5 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/coach/dashboard/profile"
              className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-maxfit-neon-green/20">
                <User className="w-6 h-6 text-maxfit-neon-green" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-maxfit-neon-green transition-colors">
                  Edit Profile
                </h3>
                <p className="text-sm text-maxfit-medium-grey">
                  Update your personal information, bio, and profile image
                </p>
              </div>
            </Link>
            <Link
              href="/coach/dashboard/plans"
              className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-maxfit-neon-green/20">
                <ClipboardList className="w-6 h-6 text-maxfit-neon-green" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-maxfit-neon-green transition-colors">
                  Manage Plans
                </h3>
                <p className="text-sm text-maxfit-medium-grey">
                  Create and manage daily, weekly, and monthly fitness plans
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Bio Card */}
        <div className="rounded-2xl bg-maxfit-dark-grey/40 border border-white/5 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">About You</h2>
          {coach?.bio ? (
            <p className="text-maxfit-off-white leading-relaxed">{coach.bio}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-maxfit-medium-grey" />
              </div>
              <p className="text-maxfit-medium-grey mb-4">
                No bio added yet. Tell clients about yourself and your expertise.
              </p>
              <Link
                href="/coach/dashboard/profile"
                className="px-4 py-2 rounded-lg bg-maxfit-neon-green/20 text-maxfit-neon-green hover:bg-maxfit-neon-green/30 transition-colors text-sm font-medium"
              >
                Add Bio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
