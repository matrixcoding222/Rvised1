"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Chrome, Sparkles, Users, Clock } from "lucide-react"

export function WaitlistBanner() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
      }
    } catch (error) {
      console.error("Failed to join waitlist:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-lg font-semibold text-gray-900">
                Rvised Chrome Extension is in Final Review!
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>500+ on waitlist</span>
              <span className="text-gray-400">•</span>
              <Clock className="h-4 w-4" />
              <span>Launching in 2-5 days</span>
            </div>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-xs bg-white"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              You're on the list! We'll notify you when we launch.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}