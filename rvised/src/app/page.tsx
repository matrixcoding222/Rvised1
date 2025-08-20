"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { AlertCircle, X } from "lucide-react"

function HomeContent() {
  const searchParams = useSearchParams()
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const blocked = searchParams.get('blocked')
    const message = searchParams.get('message')
    
    if (blocked) {
      setBlockedMessage(message || 'Access restricted. Join the waitlist!')
      // Clear URL params after showing message
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      {blockedMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{blockedMessage}</p>
              <p className="text-xs text-red-600 mt-1">Chrome extension launching in 2-5 days!</p>
            </div>
            <button 
              onClick={() => setBlockedMessage(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}
