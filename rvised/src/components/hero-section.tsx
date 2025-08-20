"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, BookOpen, Clock, Chrome, Target, Lightbulb, Timer, FolderOpen, ArrowRight, Sparkles, Bell, Users } from "lucide-react"
import { SignUpModal } from "@/components/sign-up-modal"
import { EmailCollectionFlow } from "@/components/email-collection-flow"
import { ExtensionDemoFixed } from "@/components/extension-demo-fixed"

export function HeroSection() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showEmailFlow, setShowEmailFlow] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEmailSignUp = () => {
    setShowEmailFlow(true)
  }

  const handleEmailSubmitted = (email: string) => {
    console.log("Email submitted:", email)
  }

  const handleBackToModal = () => {
    setShowEmailFlow(false)
    setShowSignUpModal(true)
  }

  if (showEmailFlow) {
    return <EmailCollectionFlow onBack={handleBackToModal} onEmailSubmitted={handleEmailSubmitted} />
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div className="text-center max-w-4xl">
              <div className="mb-8 flex justify-center">
                <img src="/glasses.svg" alt="Rvised" className="h-12 w-12" />
              </div>

              <h1 className="mb-8 text-5xl font-bold tracking-tight lg:text-7xl font-mono leading-tight">
                Stop watching. <br />
                Start <span className="text-primary">learning</span>.
              </h1>

              <p className="mb-10 text-xl text-muted-foreground leading-relaxed max-w-xl">
                Turn any YouTube video into structured learning with AI-powered summaries, quizzes, and knowledge
                tracking. Learn 5x faster, remember 80% more.
              </p>

              {/* Waitlist Form */}
              <div id="waitlist-form" className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-2xl mx-auto border border-blue-100">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Bell className="h-6 w-6 text-blue-600 animate-pulse" />
                    <h3 className="text-xl font-bold text-gray-900">Chrome Extension in Final Review!</h3>
                  </div>
                  
                  {!isSubmitted ? (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!waitlistEmail) return;
                      setIsSubmitting(true);
                      try {
                        const response = await fetch("/api/waitlist", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: waitlistEmail })
                        });
                        if (response.ok) {
                          setIsSubmitted(true);
                          setWaitlistEmail("");
                        }
                      } catch (error) {
                        console.error("Failed to join waitlist:", error);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }} className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="max-w-sm bg-white text-lg h-14"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        size="lg"
                        className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold"
                      >
                        {isSubmitting ? "Joining..." : "Join Waitlist"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg mb-2">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        You're on the list!
                      </div>
                      <p className="text-gray-600">We'll notify you as soon as the extension is live.</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">500+ waiting</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>Expected: <span className="font-semibold text-blue-600">2-5 days</span></span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-green-600">Free to use</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">3 Free Summaries Daily</span> • Chrome Extension • 
                AI-Powered Learning
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="w-full bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Watch it work in real-time</h2>
            <p className="text-xl text-muted-foreground">
              Try our interactive demo - click through the different learning modes and features
            </p>
          </div>

          {/* Extension Demo */}
          <ExtensionDemoFixed />

          {/* Feature Captions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
            <div>
              <h4 className="font-semibold text-lg mb-2">3 Learning Modes</h4>
              <p className="text-gray-600">Student, Build, or Deep - tailored to your needs</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">3 Depth Levels</h4>
              <p className="text-gray-600">Quick, Standard, or Detailed summaries</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Interactive Quizzes</h4>
              <p className="text-gray-600">Test your understanding with AI-generated questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Learn smarter, not harder</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who've transformed their learning with Rvised
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Save 5+ hours weekly</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Extract key insights from 2-hour videos in just 5 minutes
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Remember 3x more</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Active learning techniques proven by cognitive science
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Chrome className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Works everywhere</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                One click on any YouTube video - no setup required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white hover:border-gray-300 transition-all">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>3 summaries per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>20-minute video cap</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>All core features</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Interactive quizzes</span>
                </li>
              </ul>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => {
                  const form = document.querySelector('#waitlist-form');
                  if (form) form.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Join Waitlist
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="border-2 border-primary rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-purple-50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$8.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Or $4.17/month billed annually</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span className="font-semibold">Unlimited summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span className="font-semibold">Any video length</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>Priority processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>Export to PDF/Markdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>Early access to features</span>
                </li>
              </ul>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                asChild
              >
                <a href="/dashboard/upgrade">
                  Upgrade to Pro
                </a>
              </Button>
            </div>
          </div>

          <p className="text-center mt-8 text-gray-600">
            Save 50% with annual billing • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-5xl font-bold mb-8 font-mono">Start learning effectively today</h2>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                onClick={() => {
                  const form = document.querySelector('#waitlist-form');
                  if (form) form.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Bell className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                Join the Waitlist
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 text-xl font-bold border-2 hover:bg-white transition-all duration-300 group"
                asChild
              >
                <a href="/dashboard/upgrade">
                  <Sparkles className="mr-3 h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  See Pro Features
                </a>
              </Button>
            </div>

            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-primary">Launching in 2-5 days</span> • Be first to know •
              <span className="font-semibold">500+ learners waiting</span>
            </p>
          </div>
        </div>
      </section>

      <SignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} onEmailSignUp={handleEmailSignUp} />
    </>
  )
}
