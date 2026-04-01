'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Plus, Edit2, Trash2, Calendar } from 'lucide-react'

type Plan = {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price?: number
  isActive: boolean
  createdAt: string
}

export default function CoachPlansPage() {
  const { coach } = useCoachAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    duration: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: '',
    isActive: true,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('coach-token')
      if (!token) return

      const response = await fetch('/api/plans?where[coach][equals]=' + coach?.id, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
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

      const url = editingPlan ? `/api/plans/${editingPlan.id}` : '/api/plans'
      const method = editingPlan ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          coach: coach?.id,
          price: formData.price ? Number(formData.price) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save plan')
      }

      setMessage({
        type: 'success',
        text: editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!',
      })
      setIsDialogOpen(false)
      setEditingPlan(null)
      resetForm()
      fetchPlans()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save plan' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      const token = localStorage.getItem('coach-token')
      if (!token) return

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Plan deleted successfully!' })
        fetchPlans()
      } else {
        throw new Error('Failed to delete plan')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete plan' })
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      title: plan.title,
      description: plan.description,
      type: plan.type,
      duration: plan.duration,
      difficulty: plan.difficulty,
      price: plan.price?.toString() || '',
      isActive: plan.isActive,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      duration: '',
      difficulty: 'beginner',
      price: '',
      isActive: true,
    })
  }

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/20 text-blue-400'
      case 'weekly':
        return 'bg-green-500/20 text-green-400'
      case 'monthly':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400'
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'advanced':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-12">
          <div className="text-start">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              My Plans
            </h1>
            <p className="text-maxfit-medium-grey text-sm sm:text-lg">
              Create and manage your fitness plans
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPlan(null)
                  resetForm()
                }}
                className="btn-neon w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-maxfit-neon-green/40 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-maxfit-white text-xl">
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-maxfit-white text-sm font-medium">
                    Plan Title
                  </Label>
                  <Input
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
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="bg-[#171F2F]/50 border-white/30 text-maxfit-white min-h-[100px] text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-maxfit-white text-sm font-medium">Plan Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171F2F] border-white/30">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-maxfit-white text-sm font-medium">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                        setFormData((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171F2F] border-white/30">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-maxfit-white text-sm font-medium">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, duration: e.target.value }))
                      }
                      className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base"
                      placeholder="e.g., 30 minutes, 4 weeks"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-maxfit-white text-sm font-medium">
                      Price (USD)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      className="bg-[#171F2F]/50 border-white/30 text-maxfit-white text-sm sm:text-base"
                      placeholder="Optional"
                    />
                  </div>
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
                    ) : editingPlan ? (
                      'Update Plan'
                    ) : (
                      'Create Plan'
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
        ) : plans.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-maxfit-medium-grey mb-4" />
              <h3 className="text-lg font-semibold text-maxfit-white mb-2">No plans yet</h3>
              <p className="text-maxfit-medium-grey text-center max-w-md mb-4">
                You haven&apos;t created any fitness plans yet. Click the button above to create
                your first plan.
              </p>
              <Button
                onClick={() => {
                  setEditingPlan(null)
                  resetForm()
                  setIsDialogOpen(true)
                }}
                className="btn-neon"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-maxfit-white text-lg">{plan.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                        className="h-8 w-8 text-maxfit-medium-grey hover:text-maxfit-white cursor-pointer hover:-translate-y-1 transition-transform"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                        className="h-8 w-8 text-maxfit-medium-grey hover:text-red-400 cursor-pointer hover:-translate-y-1 transition-transform"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-maxfit-medium-grey line-clamp-2 text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPlanTypeColor(plan.type)}`}
                    >
                      {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}
                    >
                      {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                    </span>
                    {plan.isActive ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-maxfit-medium-grey/20 text-maxfit-medium-grey">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-maxfit-medium-grey">
                    <p>
                      <span className="text-maxfit-white/60">Duration:</span> {plan.duration}
                    </p>
                    {plan.price && (
                      <p>
                        <span className="text-maxfit-white/60">Price:</span> ${plan.price}
                      </p>
                    )}
                    <p>
                      <span className="text-maxfit-white/60">Created:</span>{' '}
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
