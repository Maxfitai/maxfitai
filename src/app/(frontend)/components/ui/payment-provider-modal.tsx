'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/(frontend)/components/ui/dialog'
import { Button } from '@/app/(frontend)/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaymentProviderModalProps {
  isOpen: boolean
  onClose: () => void
  plan: 'starter' | 'proFit' | 'maxFlex'
  planName: string
  onStripeSelect: () => void
  onPayPalSelect: () => void
  onDodoSelect: () => void
  isLoading: boolean
}

export function PaymentProviderModal({
  isOpen,
  onClose,
  plan,
  planName,
  onStripeSelect,
  onPayPalSelect,
  onDodoSelect,
  isLoading,
}: PaymentProviderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#B8E30B] border-2 border-[#8fb308] shadow-[0_0_40px_rgba(183,226,10,0.6)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Choose Payment Method
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-gray-800 font-medium">
            Select how you would like to pay for{' '}
            <span className="font-bold text-gray-900">{planName}</span>
          </p>

          <div className="space-y-4">
            {/* Stripe Option
            <Button
              onClick={onStripeSelect}
              disabled={isLoading}
              className="w-full h-auto py-4 bg-white hover:bg-gray-50 border-2 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-gray-900 font-bold hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-900" />
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  <span className="font-semibold">Pay with Credit/Debit Card (Stripe)</span>
                </>
              )}
            </Button>

            PayPal Option
            <Button
              onClick={onPayPalSelect}
              disabled={isLoading}
              className="w-full h-auto py-4 bg-white hover:bg-gray-50 border-2 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-gray-900 font-bold hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-900" />
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.683l-.8 5.09a.49.49 0 01-.483.415H7.943a.424.424 0 01-.419-.492l1.344-8.517c.04-.256.26-.453.518-.461l3.816-.013c3.815 0 6.549-1.552 7.866-5.631z" />
                    <path d="M6.124 4.033A1.087 1.087 0 017.125 3h7.223c1.24 0 2.25.116 3.01.35.21.064.41.142.6.233.96.43 1.619 1.269 1.818 2.559.019.127.035.258.048.392a9.1 9.1 0 01-.65 4.773c-.74 1.553-1.982 2.635-3.655 3.263-.814.306-1.762.485-2.817.532l-.306.012-3.816.013a.98.98 0 00-.968.842l-.951 6.03c-.034.215-.22.38-.437.38h-2.63a.36.36 0 01-.356-.419l2.244-14.23c.084-.534.543-.937 1.085-.937h7.036z" />
                  </svg>
                  <span className="font-semibold">Pay with PayPal</span>
                </>
              )}
            </Button> */}

            {/* Dodo Payments Option */}
            <Button
              onClick={onDodoSelect}
              disabled={isLoading}
              className="w-full h-auto py-4 bg-white hover:bg-gray-50 border-2 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-gray-900 font-bold hover:scale-[1.02] cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-900" />
              ) : (
                <>
                  <div className="mr-2 h-5 w-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    D
                  </div>
                  <span className="font-semibold">Pay with Dodo Payments</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-800 hover:text-black cursor-pointer border border-gray-700 bg-white hover:border-[#BBE810] hover:shadow-[0_0_10px_#BBE81040] font-semibold transition-all duration-300 hover:scale-[1.03]"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
