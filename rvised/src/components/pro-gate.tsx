"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, BarChart3, Sparkles, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ProGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [userTier, setUserTier] = useState<string>("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserTier = async () => {
      if (!isLoaded) {
        return
      }

      if (!user) {
        // No user logged in - redirect to sign in
        router.push("/sign-in?redirect_url=/dashboard")
        return
      }

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress || ""
        
        // IMPORTANT: Default to free unless explicitly pro
        let tier = "free"
        
        // Check hardcoded pro users list
        const proUsers = [
          'tyson.so1122@gmail.com',
          'developer@rvised.app',
          'pro@rvised.app'
        ]
        
        if (proUsers.includes(userEmail.toLowerCase())) {
          tier = "pro"
        }
        
        // Also check with API for dynamic tier checking
        try {
          const response = await fetch("/api/user/tier", {
            headers: {
              "x-user-email": userEmail
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            // Only upgrade to pro if API says so, never downgrade
            if (data.tier === "pro" || data.tier === "premium") {
              tier = data.tier
            }
          }
        } catch (apiError) {
          console.error("API check failed, using hardcoded list", apiError)
        }
        
        setUserTier(tier)
        console.log(`User ${userEmail} tier: ${tier}`)
      } catch (error) {
        console.error("Error checking user tier:", error)
        setUserTier("free")
      } finally {
        setLoading(false)
      }
    }

    checkUserTier()
  }, [user, isLoaded, router])

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  // IMPORTANT: Only allow pro/premium users
  if (userTier === "pro" || userTier === "premium") {
    return <>{children}</>
  }

  // Show Pro upgrade page for free users
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/glasses.svg" alt="Rvised" width={32} height={32} />
              <span className="text-xl font-semibold">Rvised</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/")}
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Lock Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
                <Lock className="h-12 w-12 text-blue-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-xs font-bold">PRO</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Unlock Your Full Learning Potential
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get unlimited access to all features including the dashboard, advanced analytics, and priority support
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Learning Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your progress with detailed analytics, streak tracking, and time saved metrics
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Advanced Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get personalized insights and recommendations based on your learning patterns
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your weekly and monthly progress with beautiful visualizations
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access all your summaries, projects, and settings from one central dashboard
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span>🎉</span>
                <span>Limited Time Offer</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Start Your Pro Journey Today
              </h2>
              <p className="text-gray-600 mb-2 text-lg">
                <span className="line-through text-gray-400">$19.99</span>
                <span className="text-3xl font-bold text-blue-600 ml-2">$9.99</span>
                <span className="text-gray-500">/month</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Cancel anytime • 7-day free trial
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/upgrade">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Zap className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={() => router.push("/")}>
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Free Features Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Currently using the free plan (3 summaries per day)
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600"></span>
                Instant activation
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600"></span>
                No credit card required for trial
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}