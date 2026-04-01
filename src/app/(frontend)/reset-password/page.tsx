import * as React from 'react'
import { Suspense } from 'react'
import ResetPasswordContent from './ResetPasswordContent'

export const metadata = {
    title: 'Reset Password - MaxFit AI',
    description: 'Reset your MaxFit AI account password. Enter your new password to complete the password reset process.',
    keywords: 'reset password, change password, password recovery, MaxFit AI account',
    openGraph: {
        title: 'Reset Password - MaxFit AI',
        description: 'Reset your MaxFit AI account password. Enter your new password.',
        type: 'website',
        url: 'https://www.maxfitai.com/reset-password',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Reset Password - MaxFit AI',
        description: 'Reset your MaxFit AI account password. Enter your new password.',
    },
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
