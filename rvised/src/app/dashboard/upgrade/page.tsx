"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ArrowLeft } from "lucide-react"

export default function UpgradePage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async (plan: string) => {
    setIsLoading(true)
    
    try {
      const userEmail = localStorage.getItem('userEmail') || 'guest@rvised.app'
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingInterval: plan,
          userEmail,
        }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        setIsLoading(false)
        return
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  const monthlyPrice = billingInterval === 'annual' ? '4.17' : '8.99'
  const billingNote = billingInterval === 'annual' ? 'Billed $49.99 annually' : 'Billed monthly'
  const savings = billingInterval === 'annual' ? 'Save 54%' : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b border-border/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Image src="/glasses.svg" alt="Rvised" width={28} height={28} className="h-7 w-7" />
              <span className="text-xl font-bold tracking-tight text-gray-900">Rvised</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-mono">Choose your plan</h1>
          <p className="text-xl text-muted-foreground">
            Unlock unlimited learning with Rvised Pro
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-1 rounded-lg inline-flex shadow-sm">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingInterval === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Annual {savings && <span className="text-green-600 ml-1">({savings})</span>}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <Card className="p-8 relative bg-white hover:shadow-lg transition-all duration-200 border-gray-200">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">3 summaries per day</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">20-minute video cap</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic features</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 relative border-2 border-primary bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all duration-200">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                RECOMMENDED
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${monthlyPrice}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{billingNote}</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Unlimited summaries</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Any video length</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Priority processing</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Export to PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Priority support</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
              size="lg"
              onClick={() => handleUpgrade(billingInterval)}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Upgrade to Pro'}
            </Button>

            <p className="text-center text-xs text-gray-500 mt-4">
              30-day money-back guarantee
            </p>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-3xl font-bold mb-8 text-center font-mono">Frequently Asked Questions</h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-lg">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription anytime from your dashboard. No questions asked.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-lg">What happens after my daily limit?</h3>
              <p className="text-muted-foreground">
                Once you hit your 3 daily summaries, you'll need to wait until the next day or upgrade to Pro for unlimited access.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-lg">Do you offer student discounts?</h3>
              <p className="text-muted-foreground">
                Yes! Students get 20% off Pro with a valid .edu email. Contact support@rvised.app to apply.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-lg">How does the guarantee work?</h3>
              <p className="text-muted-foreground">
                If you're not satisfied within 30 days, we'll refund your payment in full.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}