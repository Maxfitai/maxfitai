import * as React from 'react'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Login - MaxFit AI',
  description: 'Sign in to your MaxFit AI account to access personalized AI-powered fitness plans, workout tracking, and meal recommendations.',
  keywords: 'login, sign in, MaxFit AI account, fitness app login, AI coach access',
  openGraph: {
    title: 'Login - MaxFit AI',
    description: 'Sign in to your MaxFit AI account to access personalized AI-powered fitness plans.',
    type: 'website',
    url: 'https://www.maxfitai.com/login',
    siteName: 'MaxFit AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login - MaxFit AI',
    description: 'Sign in to your MaxFit AI account to access personalized AI-powered fitness plans.',
  },
}

export default function LoginPage() {
  return <LoginForm />
}
