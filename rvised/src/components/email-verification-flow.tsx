"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Mail, Loader2 } from "lucide-react"
import Image from "next/image"

interface EmailVerificationFlowProps {
  email: string
  onBack: () => void
}

export function EmailVerificationFlow({ email, onBack }: EmailVerificationFlowProps) {
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-500">
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
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-center animate-in zoom-in-50 duration-500 delay-200">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 delay-300">
              <p className="text-sm text-muted-foreground">
                We've sent you a magic link to <strong>{email}</strong>
              </p>

              <h1 className="text-3xl font-semibold text-foreground">Please check your inbox</h1>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Send again
                  </>
                )}
              </Button>
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
            <Button variant="ghost" size="sm" onClick={onBack} className="transition-colors">
              Back
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 transition-colors">
              Continue
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
