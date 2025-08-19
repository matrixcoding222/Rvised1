"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignUpModal } from "@/components/sign-up-modal"
import { EmailCollectionFlow } from "@/components/email-collection-flow"
import { Chrome } from "lucide-react"

export function Header() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showEmailFlow, setShowEmailFlow] = useState(false)

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

  if (showEmailFlow) {
    return <EmailCollectionFlow onBack={handleBackToModal} onEmailSubmitted={handleEmailSubmitted} />
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Image src="/glasses.svg" alt="Rvised" width={28} height={28} className="h-7 w-7" />
            </div>
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
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign In
              </Button>
            </Link>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 h-10 shadow-sm hover:shadow-md transition-all duration-200"
              asChild
            >
              <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                <Chrome className="mr-2 h-4 w-4" />
                Add to Chrome
              </a>
            </Button>
          </div>
        </div>
      </header>

      <SignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} onEmailSignUp={handleEmailSignUp} />
    </>
  )
}
