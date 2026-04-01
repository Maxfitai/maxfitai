'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/(frontend)/components/ui/card'
import { Alert, AlertDescription } from '@/app/(frontend)/components/ui/alert'
import { AvatarUploader } from '@/app/(frontend)/components/avatar-uploader'
import {
  User,
  Mail,
  CreditCard,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Globe,
  Camera,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
export default function SettingsPage() {
  const { user, setUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  // Name editing state
  const [editingName, setEditingName] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')

  // Password changing state
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Language state
  const [language, setLanguage] = useState(user?.language || '')

  // Profile image state
  const [profileImg, setProfileImg] = useState(user?.profileImg || '')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setLanguage(user.language || '')
      setProfileImg(user.profileImg || '')
    }
  }, [user])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleUpdateName = async () => {
    if (!firstName.trim() || !lastName.trim() || !language) {
      setMessage({ type: 'error', text: 'Name and language are required' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          language,
        }),
      })

      const result = await response.json()
      console.log(result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      // ✅ update global user context
      setUser((prev) =>
        prev ? { ...prev, firstName: firstName.trim(), lastName: lastName.trim(), language } : null,
      )

      setEditingName(false)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (url: string) => {
    setUploadingImage(true)
    try {
      const response = await fetch('/api/users/update-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          profileImg: url,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile image')
      }

      setUser((prev) => (prev ? { ...prev, profileImg: url } : null))

      setProfileImg(url)
      setMessage({ type: 'success', text: 'Profile image updated successfully' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile image',
      })
    } finally {
      setUploadingImage(false)
    }
  }

  if (authLoading) return null
  if (!user) return null
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }

      setMessage({ type: 'success', text: 'Password changed successfully' })
      setChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to change password',
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelNameEdit = () => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setLanguage(user?.language || 'english')
    setEditingName(false)
  }

  const cancelPasswordChange = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangingPassword(false)
  }

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'free':
        return { name: 'Free Plan', color: 'bg-gray-700', minutes: '8 minutes' }
      case 'starter':
        return { name: 'Starter Plan', color: 'bg-gray-700', minutes: '30 minutes' }
      case 'proFit':
        return { name: 'ProFit Plan', color: 'bg-gray-700', minutes: '150 minutes' }
      case 'maxFlex':
        return {
          name: 'MaxFlex Plan',
          color: 'bg-gray-700',
          minutes: '350 minutes',
        }
      default:
        return { name: 'Unknown Plan', color: 'bg-gray-500', minutes: 'Unknown' }
    }
  }

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'urdu', label: 'Urdu' },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
      </div>
    )
  }

  const planDetails = getPlanDetails(user.plan)

  return (
    <RequirePlanAccess>
      <div className="min-h-screen p-3 sm:p-6">
        <div className="mx-auto space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="mb-6 sm:mb-12 text-start mx-auto">
            <h1 className="text-2xl sm:text-4xl md:text-5xl  font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg">Manage your account preferences</p>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
              className="mx-1 sm:mx-0"
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Information */}
            <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 border-maxfit-medium-grey/20 order-1">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
                  <span className="truncate">Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {/* Profile Image */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="relative">
                    {profileImg ? (
                      <img
                        src={profileImg}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-maxfit-neon-green"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-maxfit-darker-grey border-2 border-maxfit-neon-green/50 flex items-center justify-center">
                        <User className="w-8 h-8 text-maxfit-neon-green" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-maxfit-white">Profile Photo</span>
                    <AvatarUploader onUploadSuccess={handleImageUpload} />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-maxfit-white flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>Email Address</span>
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-medium-grey text-sm sm:text-base"
                  />
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-maxfit-white flex items-center gap-2">
                    <Globe className="w-4 h-4 flex-shrink-0" />{' '}
                    {/* Changed from Mail to Globe icon */}
                    <span>Preferred Language</span>
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={!editingName}
                      className="w-full bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/30 rounded-md px-3 py-2 text-maxfit-white disabled:text-maxfit-medium-grey text-sm sm:text-base focus:ring-2 focus:ring-maxfit-neon-green appearance-none"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    >
                      {languages.map((lang) => (
                        <option
                          key={lang.value}
                          value={lang.value}
                          className="border rounded-lg text-maxfit-white"
                          style={{
                            background: 'linear-gradient(to right, #00080A, #26402D, #26220E)',
                            padding: '8px',
                            margin: '4px',
                          }}
                        >
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-maxfit-neon-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">First Name</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!editingName}
                      className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white disabled:text-maxfit-medium-grey text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!editingName}
                      className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white disabled:text-maxfit-medium-grey text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Name Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {!editingName ? (
                    <Button
                      onClick={() => setEditingName(true)}
                      variant="outline"
                      className="w-full bg-[#C7F50E] sm:w-auto border-maxfit-neon-green text-black hover:text-black hover:bg-[#C7F50E] text-sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleUpdateName}
                        disabled={loading}
                        className="btn-neon w-full sm:w-auto text-sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={cancelNameEdit}
                        variant="ghost"
                        className="w-full sm:w-auto text-maxfit-medium-grey hover:text-maxfit-white text-sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Plan */}
            <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 border-maxfit-medium-grey/20 order-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
                  <span className="truncate">Current Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="p-4 rounded-xl bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/20">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="text-base sm:text-lg font-semibold text-maxfit-white">
                      {planDetails.name}
                    </span>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${planDetails.color} flex-shrink-0`}
                    >
                      Active
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-maxfit-medium-grey">Minutes Used:</span>
                      <span className="text-maxfit-white font-medium">{user.minutesUsed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-maxfit-medium-grey">Minutes Allowed:</span>
                      <span className="text-maxfit-white font-medium">
                        {user.minutesAllowed === -1 ? 'Unlimited' : user.minutesAllowed || 1}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/pricing-plan')}
                  className="w-full btn-outline-neon text-sm"
                >
                  Change Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Section */}
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 border-maxfit-medium-grey/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {!changingPassword ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/20 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-maxfit-white font-medium">Password</div>
                    <div className="text-maxfit-medium-grey text-sm">
                      {user.IsPasswordUpdated
                        ? new Date(user.IsPasswordUpdated).toLocaleString()
                        : 'Not Updated'}
                    </div>
                  </div>
                  <Button
                    onClick={() => setChangingPassword(true)}
                    variant="outline"
                    className="w-full sm:w-auto border-maxfit-neon-green text-maxfit-neon-green text-black  bg-[#C7F50E] text-sm flex-shrink-0"
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 rounded-xl bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/20">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-maxfit-darker-grey border-maxfit-medium-grey/30 text-maxfit-white pr-10 text-sm sm:text-base"
                        style={{
                          backgroundColor: 'hsl(var(--color-background) / 0.5) !important',
                          boxShadow:
                            '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                          WebkitBoxShadow:
                            '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                          WebkitTextFillColor: '#ffffff !important',
                          color: '#ffffff !important',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-maxfit-medium-grey hover:text-maxfit-white"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-maxfit-darker-grey border-maxfit-medium-grey/30 text-maxfit-white pr-10 text-sm sm:text-base"
                        style={{
                          backgroundColor: 'hsl(var(--color-background) / 0.5) !important',
                          boxShadow:
                            '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                          WebkitBoxShadow:
                            '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                          WebkitTextFillColor: '#ffffff !important',
                          color: '#ffffff !important',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-maxfit-medium-grey hover:text-maxfit-white"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-maxfit-darker-grey border-maxfit-medium-grey/30 text-maxfit-white pr-10 text-sm sm:text-base"
                        style={{
                          backgroundColor: 'hsl(var(--color-background) / 0.5) !important',
                          boxShadow:
                            '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                          WebkitBoxShadow:
                            '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                          WebkitTextFillColor: '#ffffff !important',
                          color: '#ffffff !important',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-maxfit-medium-grey hover:text-maxfit-white"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="btn-neon w-full sm:w-auto text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button
                      onClick={cancelPasswordChange}
                      variant="ghost"
                      className="w-full sm:w-auto text-maxfit-medium-grey hover:text-maxfit-white text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RequirePlanAccess>
  )
}
