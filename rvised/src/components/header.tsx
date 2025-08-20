"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { SignUpModal } from "@/components/sign-up-modal"
import { EmailCollectionFlow } from "@/components/email-collection-flow"
import { WaitlistBanner } from "@/components/waitlist-banner"
import { Chrome, Bell } from "lucide-react"
import { isWaitlistMode } from "@/config/app-config"

export function Header() {
  const { isSignedIn } = useAuth()
  const { redirectToSignIn } = useClerk()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showEmailFlow, setShowEmailFlow] = useState(false)
  const inWaitlistMode = isWaitlistMode()

  const handleEmailSignUp = () => {
    setShowEmailFlow(true)
  }

  const handleEmailSubmitted = (email: string) => {
    // This will be handled in the next task (email verification)
    console.log("Email submitted:", email)
  }

  const handleBackToModal = () => {
    setShowEmailFlow(false)
    setShowSignUpModal(true)
  }

  const handleSignIn = () => {
    // Directly navigate to sign-in page which will auto-trigger Google OAuth
    window.location.href = "/sign-in?redirect_url=/dashboard"
  }

  if (showEmailFlow) {
    return <EmailCollectionFlow onBack={handleBackToModal} onEmailSubmitted={handleEmailSubmitted} />
  }

  return (
    <>
      <WaitlistBanner />
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image src="/glasses.svg" alt="Rvised" width={28} height={28} className="h-7 w-7" />
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-gray-900 hover:text-primary transition-colors"
            >
              Rvised
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a
              href="#demo"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
            >
              See Demo
            </a>
            <a
              href="#benefits"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Benefits
            </a>
            <Link
              href="/dashboard/upgrade"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* HIDE SIGN-IN COMPLETELY DURING WAITLIST MODE */}
            {!inWaitlistMode && (
              isSignedIn ? (
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              )
            )}
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 h-10 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => {
                const banner = document.querySelector('#waitlist-form');
                if (banner) banner.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Bell className="mr-2 h-4 w-4" />
              Join Waitlist
            </Button>
          </div>
        </div>
      </header>

      <SignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} onEmailSignUp={handleEmailSignUp} />
    </>
  )
}
