"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { LoadingScreen } from "@/components/loading-screen"

interface EmailVerificationPageProps {
  token?: string
}

export function EmailVerificationPage({ token }: EmailVerificationPageProps) {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [showCopyLink, setShowCopyLink] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const verificationLink =
    "https://rvised.com/auth/email/verify-confirm?p=eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ0b2tlbiI6ImFiYzEyMyJ9"

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setStatus("success")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleVerifyEmail = () => {
    setStatus("verifying")
    setTimeout(() => {
      setShowLoading(true)
    }, 500)
  }

  const handleLoadingComplete = () => {
    setShowLoading(false)
    setStatus("success")
  }

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={2500} />
  }

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-300">
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
              <span className="font-mono text-xl font-semibold">Rvised</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        </main>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-500">
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
              <span className="font-mono text-xl font-semibold">Rvised</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-center animate-in zoom-in-50 duration-500 delay-200">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 delay-300">
                <h1 className="text-3xl font-semibold text-foreground">Welcome to Rvised!</h1>
                <p className="text-muted-foreground">
                  Your email has been verified successfully. You can now start transforming your YouTube learning
                  experience.
                </p>
              </div>

              <div className="animate-in slide-in-from-bottom-2 duration-500 delay-500">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 transition-colors">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-300">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
            <span className="font-mono text-xl font-semibold">Rvised</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="flex justify-center animate-in zoom-in-50 duration-300 delay-200">
              <div className="rounded-full bg-yellow-100 p-3">
                <div className="rounded-full bg-yellow-200 p-2">
                  <Image src="/glasses.svg" alt="Rvised" width={32} height={32} className="h-8 w-8" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold font-mono animate-in slide-in-from-bottom-2 duration-500 delay-300">
              Sign in to <span className="text-primary">Rvised</span>
            </h1>
          </div>

          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 delay-400">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Use the button below to sign in to Rvised.</p>
              <p className="text-muted-foreground">
                The link expires in <strong>20 minutes</strong> and can only be used once.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 transition-colors"
                onClick={handleVerifyEmail}
              >
                Verify your email address
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">If you want to sign in on a different device, copy this link:</p>
                  <div className="bg-background rounded border p-3 font-mono text-xs break-all">{verificationLink}</div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              If you did not request this link, please contact us at{" "}
              <a href="mailto:support@rvised.com" className="text-primary hover:underline transition-colors">
                support@rvised.com
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={20} height={20} className="h-5 w-5" />
            <span className="font-mono font-semibold">Rvised</span>
          </div>
          <div className="text-sm text-muted-foreground">Transform your YouTube learning experience</div>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact us
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
