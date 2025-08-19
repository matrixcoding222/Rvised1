import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star } from "lucide-react"
import Image from "next/image"
import { PaymentForm } from "@/components/payment-form"
import { useState } from "react"

export function SubscriptionScreen() {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  
  const proFeatures = [
    "Unlimited video summaries",
    "Advanced AI insights & analysis",
    "Smart quiz generation",
    "Advanced project management",
    "Export to Notion, Obsidian & more",
    "Priority support",
    "Advanced search & filtering",
    "Learning analytics & progress tracking",
    "Chrome extension access",
    "Smart note-taking tools",
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/glasses.svg" alt="Rvised" width={32} height={32} className="h-8 w-8" />
            <span className="font-mono text-2xl font-semibold">Rvised</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Rvised!</h1>
          <p className="text-gray-600 text-lg">Transform your YouTube learning experience</p>
        </div>

        {/* Pro Plan */}
        <Card className="relative border-2 border-blue-600 shadow-lg">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-600 text-white px-3 py-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Premium Experience
            </Badge>
          </div>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Rvised Pro</CardTitle>
            </div>
            <CardDescription className="text-3xl font-bold text-gray-900">$9.99/month</CardDescription>
            <p className="text-gray-600">Unlock your full learning potential</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 space-y-3">
              {!showPaymentForm ? (
                <>
                  <Button 
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  >
                    Start 7-Day Free Trial
                  </Button>
                  <p className="text-xs text-gray-500 text-center">Cancel anytime. No commitment required.</p>
                </>
              ) : (
                <PaymentForm 
                  amount={9.99} 
                  onSuccess={() => {
                    // Handle successful payment
                    console.log('Payment successful!')
                  }} 
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Join thousands of learners who've transformed their YouTube experience
          </p>
        </div>
      </div>
    </div>
  )
}
