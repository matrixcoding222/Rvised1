"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Sparkles, Zap, Clock, ArrowRight, Star, Shield } from "lucide-react"
import { PRICING } from "@/lib/pricing"

export default function UpgradePage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async (plan: string) => {
    setIsLoading(true)
    
    try {
      // Get user email if available (from Clerk or localStorage)
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
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  const savings = billingInterval === 'annual' ? 50 : 0
  const monthlyPrice = billingInterval === 'annual' ? '$3.99' : '$7.99'
  const annualNote = billingInterval === 'annual' ? 'Billed $47.88 annually' : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-6 pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            BOOTSTRAP LAUNCH PRICING
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-gray-200 p-1 rounded-full inline-flex shadow-sm">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'annual'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              {savings > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-700 border-0 px-2 py-0">
                  Save {savings}%
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Tier */}
          <Card className="relative p-8 bg-white border-2 border-gray-200 hover:border-gray-300 transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Free Forever</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">$0</span>
              </div>
              <p className="text-gray-500 mt-2">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>3 summaries</strong> per day
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>20-minute</strong> video cap
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">All core features</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Projects & notes</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Interactive quizzes</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 line-through">Longer videos</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 line-through">Export options</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full" disabled>
              Your Current Plan
            </Button>
          </Card>

          {/* Pro Tier */}
          <Card className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500 shadow-xl transform hover:scale-[1.02] transition-all">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm border-0">
                RECOMMENDED
              </Badge>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">{monthlyPrice}</span>
                <span className="text-gray-600">/month*</span>
              </div>
              {annualNote && (
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  *{annualNote} (save $48/year)
                </p>
              )}
              {billingInterval === 'monthly' && (
                <p className="text-sm text-gray-500 mt-2">
                  Or save 50% with annual billing
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  <strong>Unlimited</strong> summaries
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  <strong>Any</strong> video length
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Priority processing</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Export to PDF/Markdown</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">API access (coming soon)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Early access to features</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Priority support</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              onClick={() => handleUpgrade(billingInterval)}
              disabled={isLoading}
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Money Back Guarantee */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              30-day money-back guarantee
            </div>
          </Card>
        </div>


        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    <div className="flex items-center justify-center gap-2">
                      Pro
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Popular</Badge>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 text-gray-700">Daily Summaries</td>
                  <td className="text-center py-4 px-6">
                    <span className="font-medium text-gray-900">3</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="font-semibold text-green-600">Unlimited</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">Video Length</td>
                  <td className="text-center py-4 px-6">
                    <span className="font-medium text-gray-900">20 minutes</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="font-semibold text-green-600">Unlimited</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Processing Speed</td>
                  <td className="text-center py-4 px-6">Standard</td>
                  <td className="text-center py-4 px-6">
                    <span className="font-semibold text-blue-600">Priority</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">Export Options</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">API Access</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Soon</Badge>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">Support</td>
                  <td className="text-center py-4 px-6">Community</td>
                  <td className="text-center py-4 px-6">
                    <span className="font-semibold text-blue-600">Priority</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Proof */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Loved by Learners</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah K.",
                role: "Medical Student",
                quote: "Rvised saves me hours every week. The summaries are incredibly accurate and the quizzes help me retain information!",
                rating: 5
              },
              {
                name: "Mike T.",
                role: "Software Developer",
                quote: "The Build mode is perfect for technical tutorials. I can quickly extract code examples and implementation steps.",
                rating: 5
              },
              {
                name: "Emma L.",
                role: "Content Creator",
                quote: "I research topics 5x faster now. The export feature lets me turn summaries into blog posts instantly!",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 bg-white">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Questions?</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription anytime from your dashboard. No questions asked, no hassle."
              },
              {
                q: "What happens after my daily limit?",
                a: "Once you hit your 3 daily summaries, you'll need to wait until the next day or upgrade to Pro for unlimited access."
              },
              {
                q: "Do you offer student discounts?",
                a: "Yes! Students get 20% off Pro with a valid .edu email. Contact support@rvised.app to apply."
              },
              {
                q: "How does the 30-day guarantee work?",
                a: "If you're not satisfied within 30 days, we'll refund your payment in full. No questions asked."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="p-6 bg-white">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-12">
          <Card className="p-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Ready to Learn Smarter?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 50,000+ learners saving time and retaining more with Rvised Pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
                onClick={() => handleUpgrade('annual')}
              >
                Start Pro - Save 50%
              </Button>
              <span className="text-gray-500">or</span>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Continue with Free
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Cancel anytime • 30-day guarantee
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}