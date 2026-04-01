'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/app/(frontend)/components/ui/button";
import { Input } from "@/app/(frontend)/components/ui/input";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setMessage(data.message || 'Thanks for subscribing!')
      setEmail('')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-maxfit-darker-grey border-t border-maxfit-neon-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="text-xl sm:text-2xl font-bold">
                <span className="text-white">MAX</span>
                <span className="text-maxfit-neon-green">FIT</span>
                <span className="text-white">AI</span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              Transform your fitness journey with AI-powered precision. Join thousands of users achieving their goals with personalized workout and nutrition plans.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="https://www.instagram.com/maxfit.ai" target="_blank" className="w-8 h-8 sm:w-10 sm:h-10 bg-maxfit-neon-green/10 rounded-full flex items-center justify-center hover:bg-maxfit-neon-green/20 transition-colors">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green" />
              </a>
              <a href="https://www.tiktok.com/@maxfit.ai" target="_blank" className="w-8 h-8 sm:w-10 sm:h-10 bg-maxfit-neon-green/10 rounded-full flex items-center justify-center hover:bg-maxfit-neon-green/20 transition-colors">
                <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-6">Product</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/#features" className="text-sm sm:text-base text-gray-300 hover:text-maxfit-neon-green transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm sm:text-base text-gray-300 hover:text-maxfit-neon-green transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-6">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="/about-us" className="text-sm sm:text-base text-gray-300 hover:text-maxfit-neon-green transition-colors">About Us</a></li>
              {/* <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Press Kit</a></li> */}
              <li><a href="/contact-us" className="text-sm sm:text-base text-gray-300 hover:text-maxfit-neon-green transition-colors">Contact</a></li>
              {/* <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Partners</a></li> */}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-6">Stay Updated</h3>
            <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
              Get the latest AI fitness tips and updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-maxfit-dark-grey border-maxfit-neon-green/20 text-white placeholder:text-gray-400 focus:border-maxfit-neon-green"
              />
              <Button
                type="submit"
                className="w-full btn-neon"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
              {message && (
                <p className={`text-sm ${status === 'success' ? 'text-maxfit-neon-green' : 'text-red-500'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-maxfit-neon-green/20 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
            <div className="text-gray-300 text-xs sm:text-sm">
              © 2026 MAXFITAI. All rights reserved.
            </div>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <a href="/privacy-policy" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Privacy Policy</a>
              <a href="/term-of-service" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Terms of Service</a>
              <a href="/cookie-policy" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

