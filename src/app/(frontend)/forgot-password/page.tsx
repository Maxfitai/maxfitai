import * as React from 'react'
import ForgotForm from './ForgotForm'

export const metadata = {
    title: 'Forgot Password - MaxFit AI',
    description: 'Reset your MaxFit AI password. Enter your email address and we\'ll send you a link to reset your password.',
    keywords: 'forgot password, reset password, password recovery, MaxFit AI login help',
    openGraph: {
        title: 'Forgot Password - MaxFit AI',
        description: 'Reset your MaxFit AI password. Enter your email address and we\'ll send you a link.',
        type: 'website',
        url: 'https://www.maxfitai.com/forgot-password',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Forgot Password - MaxFit AI',
        description: 'Reset your MaxFit AI password. Enter your email address and we\'ll send you a link.',
    },
}

export default function ForgotPasswordPage() {
    return <ForgotForm />
}
