'use client'

import { useRef, useState } from 'react'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploaderProps {
  onUploadSuccess: (url: string) => void
}

export function AvatarUploader({ onUploadSuccess }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default')

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dioilhonc/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.secure_url) {
        onUploadSuccess(data.secure_url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="border-maxfit-neon-green/50 text-maxfit-neon-green hover:bg-maxfit-neon-green/10"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Camera className="h-4 w-4 mr-2" />
        )}
        Change Photo
      </Button>
    </>
  )
}
