'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { Textarea } from '@/app/(frontend)/components/ui/textarea'
import { Alert, AlertDescription } from '@/app/(frontend)/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select'
import { Badge } from '@/app/(frontend)/components/ui/badge'
import { Loader2, Plus, Edit2, Trash2, Library, Video, ExternalLink, Play } from 'lucide-react'

type ContentType = 'youtube' | 'tiktok' | 'instagram'
type Category =
  | 'strength'
  | 'cardio'
  | 'yoga'
  | 'hiit'
  | 'nutrition'
  | 'recovery'
  | 'mobility'
  | 'other'

type WorkoutItem = {
  id: string
  title: string
  description: string
  contentType: ContentType
  videoUrl: string
  thumbnailUrl?: string
  category: Category
  tags?: { tag: string }[]
  isPublic: boolean
  createdAt: string
}

export default function WorkoutLibraryPage() {
  const { coach } = useCoachAuth()
  const [items, setItems] = useState<WorkoutItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkoutItem | null>(null)
  const [tagInput, setTagInput] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'youtube' as ContentType,
    videoUrl: '',
    thumbnailUrl: '',
    category: 'strength' as Category,
    tags: [] as string[],
    isPublic: true,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('coach-token')
      if (!token) return

      const response = await fetch('/api/workout-library?where[coach][equals]=' + coach?.id, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch workout library items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('coach-token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const url = editingItem ? `/api/workout-library/${editingItem.id}` : '/api/workout-library'
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          coach: coach?.id,
          tags: formData.tags.map((tag) => ({ tag })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save workout item')
      }

      setMessage({
        type: 'success',
        text: editingItem
          ? 'Workout item updated successfully!'
          : 'Workout item added successfully!',
      })
      setIsDialogOpen(false)
      setEditingItem(null)
      resetForm()
      fetchItems()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save workout item' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this workout item?')) return

    try {
      const token = localStorage.getItem('coach-token')
      if (!token) return

      const response = await fetch(`/api/workout-library/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Workout item deleted successfully!' })
        fetchItems()
      } else {
        throw new Error('Failed to delete workout item')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete workout item' })
    }
  }

  const handleEdit = (item: WorkoutItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      contentType: item.contentType,
      videoUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl || '',
      category: item.category,
      tags: item.tags?.map((t) => t.tag) || [],
      isPublic: item.isPublic,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentType: 'youtube',
      videoUrl: '',
      thumbnailUrl: '',
      category: 'strength',
      tags: [],
      isPublic: true,
    })
    setTagInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }))
  }

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'youtube':
        return <Video className="h-4 w-4 text-red-500" />
      case 'tiktok':
        return <Play className="h-4 w-4 text-pink-500" />
      case 'instagram':
        return <Play className="h-4 w-4 text-purple-500" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case 'youtube':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'tiktok':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'instagram':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getCategoryColor = (category: Category) => {
    const colors: Record<string, string> = {
      strength: 'bg-blue-500/20 text-blue-400',
      cardio: 'bg-green-500/20 text-green-400',
      yoga: 'bg-purple-500/20 text-purple-400',
      hiit: 'bg-orange-500/20 text-orange-400',
      nutrition: 'bg-yellow-500/20 text-yellow-400',
      recovery: 'bg-cyan-500/20 text-cyan-400',
      mobility: 'bg-indigo-500/20 text-indigo-400',
      other: 'bg-gray-500/20 text-gray-400',
    }
    return colors[category] || colors.other
  }

  const extractVideoId = (url: string, type: ContentType) => {
    try {
      if (type === 'youtube') {
        // Support various YouTube URL formats
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
          /youtube\.com\/shorts\/([^&\s?]+)/,
        ]
        for (const pattern of patterns) {
          const match = url.match(pattern)
          if (match) return match[1]
        }
      }
      return null
    } catch {
      return null
    }
  }

  const getVideoThumbnail = (item: WorkoutItem): string | null => {
    const videoId = extractVideoId(item.videoUrl, item.contentType)

    if (item.thumbnailUrl) {
      return item.thumbnailUrl
    }

    if (videoId && item.contentType === 'youtube') {
      // Try maxres first, then fallback to hqdefault
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }

    // For Instagram and TikTok, return null to show platform indicator
    // (These platforms don't allow easy thumbnail extraction)
    return null
  }

  const handleThumbnailError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    const videoId = img.dataset.videoid
    if (videoId) {
      // Fallback to hqdefault if maxres fails
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-12">
          <div className="text-start">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Workout Library
            </h1>
            <p className="text-maxfit-medium-grey text-sm sm:text-lg">
              Manage your workout videos and content
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null)
                  resetForm()
                }}
                className="btn-neon w-full sm:w-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-maxfit-neon-green/40 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-maxfit-white text-xl">
                  {editingItem ? 'Edit Workout Item' : 'Add New Content'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-maxfit-white text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    placeholder="Enter title"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-maxfit-white text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Enter description"
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="bg-[#171F2F]/50 border-white/30 text-maxfit-white min-h-[100px] text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-maxfit-white text-sm font-medium">Content Type</Label>
                    <Select
                      value={formData.contentType}
                      onValueChange={(value: ContentType) =>
                        setFormData((prev) => ({ ...prev, contentType: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171F2F] border-white/30">
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-maxfit-white text-sm font-medium">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: Category) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171F2F] border-white/30">
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="hiit">HIIT</SelectItem>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="recovery">Recovery</SelectItem>
                        <SelectItem value="mobility">Mobility</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-maxfit-white text-sm font-medium">
                    Video URL
                  </Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="text-maxfit-white text-sm font-medium">
                    Thumbnail URL
                    <span className="text-maxfit-medium-grey text-xs ml-2">(Optional)</span>
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
                    }
                    className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base"
                    placeholder="https://..."
                  />
                  {formData.contentType !== 'youtube' && (
                    <p className="text-xs text-yellow-400/80 mt-1">
                      Recommended for {formData.contentType} videos. Thumbnails are auto-generated
                      for YouTube only.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-maxfit-white text-sm font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base"
                      placeholder="Add a tag and press Enter"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="outline"
                      className="border-maxfit-neon-green/50 text-maxfit-neon-green hover:bg-maxfit-neon-green/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-maxfit-neon-green/20 text-maxfit-neon-green border border-maxfit-neon-green/30 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
                    }
                    className="rounded border-white/30 bg-[#171F2F]/50 text-maxfit-neon-green"
                  />
                  <Label htmlFor="isPublic" className="text-maxfit-white text-sm">
                    Make visible to clients
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-maxfit-medium-grey hover:text-black cursor-pointer hover:bg-white"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="btn-neon cursor-pointer">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingItem ? (
                      'Update'
                    ) : (
                      'Add Content'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert
            variant={message.type === 'error' ? 'destructive' : 'default'}
            className="mx-1 sm:mx-0"
          >
            <AlertDescription className="text-sm">{message.text}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-maxfit-neon-green" />
          </div>
        ) : items.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Library className="h-12 w-12 text-maxfit-medium-grey mb-4" />
              <h3 className="text-lg font-semibold text-maxfit-white mb-2">No content yet</h3>
              <p className="text-maxfit-medium-grey text-center max-w-md mb-4">
                Your workout library is empty. Add YouTube videos, TikToks, and Instagram content to
                share with your clients.
              </p>
              <Button
                onClick={() => {
                  setEditingItem(null)
                  resetForm()
                  setIsDialogOpen(true)
                }}
                className="btn-neon"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const videoId = extractVideoId(item.videoUrl, item.contentType)
              const thumbnail = getVideoThumbnail(item)

              return (
                <Card
                  key={item.id}
                  className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-video bg-black overflow-hidden group">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-videoid={videoId || ''}
                        onError={handleThumbnailError}
                        unoptimized={!thumbnail.startsWith('https://img.youtube.com')}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        {item.contentType === 'tiktok' ? (
                          <>
                            <div className="text-pink-500 mb-2">
                              <Play className="h-12 w-12" />
                            </div>
                            <span className="text-pink-500 font-bold text-lg">TikTok Video</span>
                          </>
                        ) : item.contentType === 'instagram' ? (
                          <>
                            <div className="text-purple-500 mb-2">
                              <Play className="h-12 w-12" />
                            </div>
                            <span className="text-purple-500 font-bold text-lg">
                              Instagram Video
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="text-gray-500 mb-2">
                              <Video className="h-12 w-12" />
                            </div>
                            <span className="text-gray-500 font-bold text-lg">Video</span>
                          </>
                        )}
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-maxfit-neon-green text-black p-4 rounded-full font-semibold flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-maxfit-neon-green/50"
                      >
                        <Play className="h-6 w-6 ml-1" fill="currentColor" />
                      </a>
                    </div>
                    {/* Content Type Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${getContentTypeColor(
                          item.contentType,
                        )}`}
                      >
                        {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                      </span>
                    </div>
                    {/* Duration Badge (if available) */}
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                        Watch Now
                      </span>
                    </div>
                  </div>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-maxfit-white text-lg">{item.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 text-maxfit-medium-grey hover:text-maxfit-white cursor-pointer hover:-translate-y-1 transition-transform"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-maxfit-medium-grey hover:text-red-400 cursor-pointer hover:-translate-y-1 transition-transform"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-maxfit-medium-grey line-clamp-2 text-sm">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                          item.category,
                        )}`}
                      >
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                      {item.isPublic ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                          Public
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-maxfit-medium-grey/20 text-maxfit-medium-grey">
                          Private
                        </span>
                      )}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tagObj) => (
                          <Badge
                            key={tagObj.tag}
                            variant="outline"
                            className="text-xs border-maxfit-neon-green/30 text-maxfit-neon-green"
                          >
                            {tagObj.tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-maxfit-neon-green hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Watch Video
                      </a>
                      <p className="text-xs text-maxfit-medium-grey">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
