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
      if (!isLoaded || !user) {
        setLoading(false)
        return
      }

      try {
        // Check user metadata for tier
        const tier = user.publicMetadata?.tier as string || "free"
        setUserTier(tier)
        
        // Also check with API
        const response = await fetch("/api/user/tier", {
          headers: {
            "x-user-email": user.primaryEmailAddress?.emailAddress || ""
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || "free")
        }
      } catch (error) {
        console.error("Error checking user tier:", error)
        setUserTier("free")
      } finally {
        setLoading(false)
      }
    }

    checkUserTier()
  }, [user, isLoaded])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (userTier === "pro" || userTier === "premium") {
    return <>{children}</>
  }

  // Show Pro upgrade page for free users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/glasses.svg" alt="Rvised" width={32} height={32} />
              <span className="text-xl font-semibold">Rvised</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/library">
                <Button variant="ghost">Library</Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost">Projects</Button>
              </Link>
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
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Lock className="h-10 w-10 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dashboard is a Pro Feature
            </h1>
            <p className="text-xl text-gray-600">
              Unlock powerful analytics and insights to track your learning journey
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
          <Card className="border-2 border-primary bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Upgrade to Pro Today
              </h2>
              <p className="text-gray-600 mb-6">
                Get unlimited summaries, advanced features, and full dashboard access
              </p>
              <div className="flex items-center justify-center">
                <Link href="/dashboard/upgrade">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                    <Zap className="h-5 w-5 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Free Features Note */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              As a free user, you can still access your Library and manage your Projects.
            </p>
            <p className="mt-1">
              The Dashboard unlocks with a Pro subscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}