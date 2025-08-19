"use client"
import { SignIn } from "@clerk/nextjs"
import Image from "next/image"

export function SignInPage() {

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
            <span className="text-xl font-semibold">Rvised</span>
          </div>
        </div>

        {/* Clerk SignIn Component */}
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none",
              headerTitle: "text-2xl font-semibold text-gray-900",
              headerSubtitle: "text-gray-600",
              socialButtonsProviderIcon__google: "w-5 h-5",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
            }
          }}
          routing="hash"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
