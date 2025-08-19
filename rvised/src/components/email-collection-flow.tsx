"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import Image from "next/image"
import { EmailVerificationFlow } from "@/components/email-verification-flow"

interface EmailCollectionFlowProps {
  onBack: () => void
  onEmailSubmitted: (email: string) => void
}

export function EmailCollectionFlow({ onBack, onEmailSubmitted }: EmailCollectionFlowProps) {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"input" | "confirm" | "sent">("input")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && step === "input") {
      setStep("confirm")
    } else if (step === "confirm") {
      setIsSubmitting(true)
      // Added loading state simulation
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSubmitting(false)
      setStep("sent")
      onEmailSubmitted(email)
    }
  }

  const handleSendLink = async () => {
    setIsSubmitting(true)
    // Added loading state simulation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setStep("sent")
    onEmailSubmitted(email)
  }

  if (step === "sent") {
    return (
      <div className="animate-in fade-in duration-300">
        <EmailVerificationFlow email={email} onBack={() => setStep("confirm")} />
      </div>
    )
  }

  if (step === "input") {
    return (
      <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-300">
        {/* Header */}
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
              <span className="font-mono text-xl font-semibold">Rvised</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-semibold text-foreground">Please enter your email</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 text-center text-lg border-2 focus:border-primary transition-colors"
                  required
                  autoFocus
                  disabled={isSubmitting}
                />

                <p className="text-sm text-primary">We'll send you a magic link</p>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-muted/30">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Image src="/glasses.svg" alt="Rvised" width={20} height={20} className="h-5 w-5" />
              <span className="font-mono font-semibold">Rvised</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2" disabled={isSubmitting}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 transition-colors"
                onClick={handleSubmit}
                disabled={!email || isSubmitting}
              >
                {/* Added loading state to button */}
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
            <span className="font-mono text-xl font-semibold">Rvised</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-semibold text-foreground">Please enter your email</h1>

            <div className="space-y-4">
              <div className="text-3xl font-mono font-semibold text-foreground break-all animate-in zoom-in-50 duration-300">
                {email}
              </div>

              <p className="text-sm text-primary">We'll send you a magic link</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={20} height={20} className="h-5 w-5" />
            <span className="font-mono font-semibold">Rvised</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("input")}
              className="gap-2 transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 gap-2 transition-colors"
              onClick={handleSendLink}
              disabled={isSubmitting}
            >
              {/* Added loading state to send link button */}
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send link
                  <Mail className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
