'use client'

import { useEffect } from 'react'
import { useSignIn, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn()
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get redirect URL from query params
    const redirectUrl = searchParams.get('redirect_url') || '/dashboard'
    const isFromExtension = redirectUrl.includes('extension=true')
    
    // If already signed in, redirect immediately
    if (isSignedIn && user) {
      console.log('Already signed in, redirecting...')
      
      // If from extension, handle specially
      if (isFromExtension) {
        // Add extension params to redirect
        const finalUrl = redirectUrl.includes('?') 
          ? `${redirectUrl}&already_auth=true`
          : `${redirectUrl}?already_auth=true`
        router.push(finalUrl)
      } else {
        router.push(redirectUrl)
      }
      return
    }
    
    // Otherwise, trigger Google OAuth when the page loads
    if (isLoaded && signIn && !isSignedIn) {
      const initiateGoogleSignIn = async () => {
        try {
          await signIn.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: '/sso-callback',
            redirectUrlComplete: redirectUrl
          })
        } catch (error) {
          console.error('Error initiating Google sign-in:', error)
          // If there's an error, show the fallback UI
        }
      }
      
      initiateGoogleSignIn()
    }
  }, [isLoaded, signIn, isSignedIn, user, router, searchParams])

  // Show a loading state while redirecting to Google
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Image 
            src="/glasses.svg" 
            alt="Rvised" 
            width={48} 
            height={48} 
            className="h-12 w-12 animate-pulse"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Google...</h2>
        <p className="text-gray-600">Please wait while we redirect you to sign in with Google</p>
        
        <div className="mt-8">
          <div className="inline-flex items-center gap-3 text-sm text-gray-500">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  )
}