//Payload CMS Built in imports
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

//My imports
import Navbar from '@/app/(frontend)/components/layout/Navbar'
import Hero from '@/app/(frontend)/components/sections/Hero'
import Features from '@/app/(frontend)/components/sections/Features'
import HowItWorks from '@/app/(frontend)/components/sections/HowItWorks'
import Testimonials from '@/app/(frontend)/components/sections/Testimonials'
import Pricing from '@/app/(frontend)/components/sections/Pricing'
import Footer from '@/app/(frontend)/components/layout/Footer'
import UaePopup from './components/sections/UaePopup'

export const metadata = {
  title: 'MAXFITAI - Your AI-Powered Fitness Companion',
  description: 'Transform your fitness journey with AI-powered workout plans, personalized meal recommendations, and expert coaching. Join 10,000+ users today.',
  keywords: 'AI fitness coach, AI workout planner, personalized fitness app, AI meal planning, fitness tracker, workout generator, AI personal trainer',
  openGraph: {
    title: 'MaxFit AI - Your AI-Powered Personal Fitness Coach',
    description: 'Transform your fitness journey with AI-powered workout plans and meal recommendations. Join 10,000+ users today.',
    type: 'website',
    url: 'https://www.maxfitai.com/',
    siteName: 'MaxFit AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxFit AI - Your AI-Powered Personal Fitness Coach',
    description: 'Transform your fitness journey with AI-powered workout plans and meal recommendations. Join 10,000+ users today.',
  },
}

export default async function HomePage() {
  const _headers = await getHeaders()

  const payloadConfig = await config
  const _payload = await getPayload({ config: payloadConfig })

  const _fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Footer />
      {/* <UaePopup /> */}
    </>
  )
}
