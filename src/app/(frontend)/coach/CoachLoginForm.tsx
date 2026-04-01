'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'

import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'

import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import Logo from '@/app/(frontend)/assets/maxfit.svg'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/(frontend)/components/ui/form'
import { Alert, AlertDescription } from '@/app/(frontend)/components/ui/alert'
import Image from 'next/image'

interface CoachLoginFormData {
  email: string
  password: string
}

export default function CoachLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { coach, loading } = useCoachAuth()
  const router = useRouter()


  const form = useForm<CoachLoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!loading && coach) {
      router.replace('/coach/dashboard')
    }
  }, [coach, loading, router])

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[10000] bg-hero-gradient flex flex-col items-center justify-center"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="relative">
          <Image
            src={Logo}
            alt="MAXFIT AI"
            width={88}
            height={88}
            className="object-contain drop-shadow-lg"
            priority
          />
          <div className="absolute inset-0 rounded-full border-2 border-maxfit-neon-green/30 border-t-maxfit-neon-green animate-spin" />
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  if (coach) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-sm text-gray-400">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CoachLoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/coaches/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
          'Incorrect credentials, please enter the correct email and password.',
        )
      }

      const result = await response.json()

      localStorage.setItem('coach-token', result.token)

      console.log('Coach logged in successfully!')
      window.location.href = '/coach/dashboard'
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover-lift border-0 rounded-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold text-glow">Coach Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your coach account to manage your profile and plans
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="coach@example.com"
                            autoComplete="email"
                            className="pl-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                            style={{
                              backgroundColor: 'hsl(var(--color-background) / 0.5) !important',
                              boxShadow:
                                '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                              WebkitBoxShadow:
                                '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                              WebkitTextFillColor: 'hsl(var(--color-foreground)) !important',
                              color: 'hsl(var(--color-foreground)) !important',
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="pl-10 alert-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                            style={{
                              backgroundColor: 'hsl(var(--color-background) / 0.5) !important',
                              boxShadow:
                                '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                              WebkitBoxShadow:
                                '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                              WebkitTextFillColor: 'hsl(var(--color-foreground)) !important',
                              color: 'hsl(var(--color-foreground)) !important',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isLoading}
                  className="btn-neon w-full h-12 text-base font-semibold cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
