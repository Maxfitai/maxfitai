"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Loader2, Mail, Check } from 'lucide-react'

import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'

import { useAuth } from '@/app/(frontend)/context/AuthProvider'

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

interface ForgotFormData {
    email: string
}

export default function ForgotForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const { user, loading } = useAuth()
    const router = useRouter()

    const form = useForm<ForgotFormData>({
        defaultValues: {
            email: '',
        },
    })

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
                    <div className="text-sm text-gray-400">Checking authentication...</div>
                </div>
            </div>
        )
    }

    const handleSubmit = async (data: ForgotFormData) => {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to request password reset')
            }

            setSuccess(result.message || 'If that email exists, a reset link has been sent.')
        } catch (err) {
            console.error('Forgot password error:', err)
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
                        <CardTitle className="text-3xl font-bold text-glow">Forgot Password</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your email and we'll send a link to reset your password
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-maxfit-neon-green/20 flex items-center justify-center">
                                        <Check className="text-maxfit-neon-green w-5 h-5" />
                                    </div>
                                    <div className="text-sm text-muted-foreground">{success}</div>
                                </div>

                                <div className="space-y-2">
                                    <Link href="/login">
                                        <Button variant="ghost" className="btn-outline-neon w-full h-12">
                                            Back to Sign In
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
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
                                                            placeholder="john@example.com"
                                                            autoComplete="email"
                                                            className="pl-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                                                            style={{
                                                                backgroundColor: 'hsl(var(--color-background) / 0.5) !important',
                                                                boxShadow: '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
                                                                WebkitBoxShadow: '0 0 0 30px hsl(var(--color-background) / 0.5) inset !important',
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

                                    <Button
                                        type="button"
                                        onClick={form.handleSubmit(handleSubmit)}
                                        disabled={isLoading}
                                        className="btn-neon w-full h-12 text-base font-semibold"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
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