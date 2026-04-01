import * as React from 'react'
import SignupForm from './SignupForm'

export const metadata = {
  title: 'Sign Up - MaxFit AI',
  description: 'Create your free MaxFit AI account and start your personalized fitness journey with AI-powered workout plans and meal recommendations.',
  keywords: 'sign up, register, MaxFit AI account, free fitness app, AI coach signup',
  openGraph: {
    title: 'Sign Up - MaxFit AI',
    description: 'Create your free MaxFit AI account and start your personalized fitness journey.',
    type: 'website',
    url: 'https://www.maxfitai.com/signup',
    siteName: 'MaxFit AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up - MaxFit AI',
    description: 'Create your free MaxFit AI account and start your personalized fitness journey.',
  },
}

export default function SignupPage() {
  return <SignupForm />
}
