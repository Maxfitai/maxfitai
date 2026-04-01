'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, Check } from 'lucide-react'

import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
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

interface ResetForm {
  password: string
  confirmPassword: string
}

export default function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''
  const email = searchParams?.get('email') || ''
  const router = useRouter()

  const form = useForm<ResetForm>({
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or missing reset token. Please use the link from your email.')
    }
  }, [token, email])

  const handleSubmit = async (data: ResetForm) => {
    setError(null)
    setIsLoading(true)

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password: data.password }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || result.message || 'Failed to reset password')
      }

      if (result.token) {
        localStorage.setItem('user-token', result.token)
      }

      setSuccess('Password updated successfully. Redirecting...')
      setTimeout(() => {
        if (result.token) router.replace('/login')
        else router.replace('/')
      }, 1200)
    } catch (err) {
      console.error('Reset error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 hover-lift border-0">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold text-glow">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Set a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-maxfit-neon-green/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-maxfit-neon-green" />
                </div>
                <div className="text-sm text-muted-foreground">{success}</div>
              </div>
            ) : (
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    rules={{
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter new password"
                              className="pl-10 bg-background/50 border-border"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    rules={{ required: 'Please confirm your password' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Confirm password"
                              className="pl-10 bg-background/50 border-border"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={isLoading}
                    className="btn-neon w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save New Password'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/login">
                      <Button variant="ghost" className="btn-outline-neon w-full h-12">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
