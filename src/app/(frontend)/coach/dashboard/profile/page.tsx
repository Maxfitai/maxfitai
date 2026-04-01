'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import { AvatarUploader } from '@/app/(frontend)/components/avatar-uploader'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/(frontend)/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/(frontend)/components/ui/dialog'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { Textarea } from '@/app/(frontend)/components/ui/textarea'
import { Loader2, Plus, Trash2, CheckCircle, XCircle, User } from 'lucide-react'

export default function CoachProfilePage() {
  const { coach, setCoach } = useCoachAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  const [formData, setFormData] = useState({
    firstName: coach?.firstName || '',
    lastName: coach?.lastName || '',
    phone: coach?.phone || '',
    bio: coach?.bio || '',
    yearsOfExperience: coach?.yearsOfExperience ?? '',
    calendlyUrl: coach?.calendlyUrl || '',
    profileImage: coach?.profileImage || '',
    pricePerSession: coach?.pricePerSession || 50,
    specializations: coach?.specializations?.map((s) => s.specialization) || [''],
    certifications: coach?.certifications?.map((c) => c.certification) || [''],
  })

  const [hasAddedSpecialization, setHasAddedSpecialization] = useState(false)
  const [hasAddedCertification, setHasAddedCertification] = useState(false)

  // Store original data to track changes
  const [originalData, setOriginalData] = useState(formData)

  useEffect(() => {
    if (coach?.specializations && coach.specializations.length > 0) {
      setHasAddedSpecialization(true)
    }
    if (coach?.certifications && coach.certifications.length > 0) {
      setHasAddedCertification(true)
    }
  }, [coach])

  // Update original data when coach data is loaded
  useEffect(() => {
    const initialData = {
      firstName: coach?.firstName || '',
      lastName: coach?.lastName || '',
      phone: coach?.phone || '',
      bio: coach?.bio || '',
      yearsOfExperience: coach?.yearsOfExperience ?? '',
      calendlyUrl: coach?.calendlyUrl || '',
      profileImage: coach?.profileImage || '',
      pricePerSession: coach?.pricePerSession || 50,
      specializations: coach?.specializations?.map((s) => s.specialization) || [''],
      certifications: coach?.certifications?.map((c) => c.certification) || [''],
    }
    setFormData(initialData)
    setOriginalData(initialData)
  }, [coach])

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.phone !== originalData.phone ||
      formData.bio !== originalData.bio ||
      formData.yearsOfExperience !== originalData.yearsOfExperience ||
      formData.calendlyUrl !== originalData.calendlyUrl ||
      formData.profileImage !== originalData.profileImage ||
      formData.pricePerSession !== originalData.pricePerSession ||
      JSON.stringify(formData.specializations) !== JSON.stringify(originalData.specializations) ||
      JSON.stringify(formData.certifications) !== JSON.stringify(originalData.certifications)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem('coach-token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/coaches/${coach?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          yearsOfExperience: Number(formData.yearsOfExperience),
          calendlyUrl: formData.calendlyUrl,
          profileImage: formData.profileImage,
          pricePerSession: Number(formData.pricePerSession),
          specializations: formData.specializations
            .filter((s) => s.trim())
            .map((s) => ({ specialization: s })),
          certifications: formData.certifications
            .filter((c) => c.trim())
            .map((c) => ({ certification: c })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }

      const updatedCoach = await response.json()
      setCoach(updatedCoach)
      // Update original data after successful save
      setOriginalData({
        firstName: updatedCoach.firstName || '',
        lastName: updatedCoach.lastName || '',
        phone: updatedCoach.phone || '',
        bio: updatedCoach.bio || '',
        yearsOfExperience: updatedCoach.yearsOfExperience || 0,
        calendlyUrl: updatedCoach.calendlyUrl || '',
        profileImage: updatedCoach.profileImage || '',
        pricePerSession: updatedCoach.pricePerSession || 50,
        specializations: updatedCoach.specializations?.map((s: any) => s.specialization) || [''],
        certifications: updatedCoach.certifications?.map((c: any) => c.certification) || [''],
      })
      setModalData({
        type: 'success',
        title: 'Profile updated successfully!',
        message: 'Your profile information has been saved.',
      })
      setModalOpen(true)
    } catch (error: any) {
      setModalData({
        type: 'error',
        title: 'Failed to update profile',
        message: error.message || 'An error occurred while saving your profile.',
      })
      setModalOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, profileImage: url }))
  }

  const addSpecialization = () => {
    setFormData((prev) => ({
      ...prev,
      specializations: [...prev.specializations, ''],
    }))
    setHasAddedSpecialization(true)
  }

  const removeSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }))
  }

  const updateSpecialization = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.map((s, i) => (i === index ? value : s)),
    }))
  }

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ''],
    }))
    setHasAddedCertification(true)
  }

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }))
  }

  const updateCertification = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c, i) => (i === index ? value : c)),
    }))
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <form onSubmit={handleSubmit} className="mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-12 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-start">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-maxfit-medium-grey text-sm sm:text-lg">
                Manage your personal information and professional details
              </p>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !hasChanges()}
              className="btn-neon py-3 px-6 text-base font-semibold cursor-pointer whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-maxfit-white text-lg sm:text-xl">
                Personal Information
              </CardTitle>
              <CardDescription className="text-maxfit-medium-grey text-sm">
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-white/10">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-maxfit-darker-grey/50 border-2 border-maxfit-neon-green/30">
                    {formData.profileImage ? (
                      <Image
                        src={formData.profileImage}
                        alt={`${formData.firstName} ${formData.lastName}`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-maxfit-medium-grey" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <h3 className="text-maxfit-white font-semibold">Profile Photo</h3>
                  <p className="text-maxfit-medium-grey text-sm text-center sm:text-left max-w-xs">
                    Upload a professional photo to help clients recognize you. JPG, PNG, or WebP up
                    to 5MB.
                  </p>
                  <AvatarUploader onUploadSuccess={handleImageUpload} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-maxfit-white text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-maxfit-white text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-maxfit-white text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-maxfit-white text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white min-h-[100px] text-sm sm:text-base"
                  placeholder="Tell clients about yourself, your approach to fitness, and your expertise..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-maxfit-white text-lg sm:text-xl">
                Professional Details
              </CardTitle>
              <CardDescription className="text-maxfit-medium-grey text-sm">
                Add your experience, specializations, and certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <Label
                  htmlFor="yearsOfExperience"
                  className="text-maxfit-white text-sm font-medium"
                >
                  Years of Experience
                </Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      yearsOfExperience:
                        e.target.value === '' ? '' : parseInt(e.target.value) || '',
                    }))
                  }
                  className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendlyUrl" className="text-maxfit-white text-sm font-medium">
                  Calendly URL
                </Label>
                <Input
                  id="calendlyUrl"
                  value={formData.calendlyUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, calendlyUrl: e.target.value }))
                  }
                  className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                  placeholder="https://calendly.com/your-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerSession" className="text-maxfit-white text-sm font-medium">
                  Price Per Session (USD)
                </Label>
                <Input
                  id="pricePerSession"
                  type="number"
                  min="0"
                  value={formData.pricePerSession}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricePerSession: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                {hasAddedSpecialization && (
                  <Label className="text-maxfit-white text-sm font-medium">Specializations</Label>
                )}
                {formData.specializations.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={spec}
                      onChange={(e) => updateSpecialization(index, e.target.value)}
                      className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                      placeholder="e.g., Weight Loss, Strength Training, Yoga"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSpecialization(index)}
                      disabled={formData.specializations.length === 1}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialization}
                  className="mt-2 bg-[#C7F50E] border-maxfit-neon-green text-black hover:text-black hover:bg-[#C7F50E] text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specialization
                </Button>
              </div>

              <div className="space-y-2">
                {hasAddedCertification && (
                  <Label className="text-maxfit-white text-sm font-medium">Certifications</Label>
                )}
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={cert}
                      onChange={(e) => updateCertification(index, e.target.value)}
                      className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white text-sm sm:text-base"
                      placeholder="e.g., NASM Certified Personal Trainer"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeCertification(index)}
                      disabled={formData.certifications.length === 1}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCertification}
                  className="mt-2 bg-[#C7F50E] border-maxfit-neon-green text-black hover:text-black hover:bg-[#C7F50E] text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success/Error Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-maxfit-neon-green/30 backdrop-blur-sm">
            <DialogHeader className="text-center items-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {modalData?.type === 'success' ? (
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                )}
              </div>
              <DialogTitle
                className={`text-2xl font-bold ${
                  modalData?.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {modalData?.title}
              </DialogTitle>
              <DialogDescription className="text-maxfit-medium-grey text-base mt-2">
                {modalData?.message}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <Button
                onClick={() => setModalOpen(false)}
                className="w-full btn-neon py-3 text-base font-semibold cursor-pointer"
              >
                {modalData?.type === 'success' ? 'Great!' : 'Try Again'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  )
}
