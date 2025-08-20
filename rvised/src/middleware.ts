import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// WAITLIST MODE - Set to false when ready to launch
const WAITLIST_MODE = true

// Allowed users during waitlist period
const ALLOWED_EMAILS = [
  'tyson.so1122@gmail.com',
  'developer@rvised.app',
  'pro@rvised.app'
]

// Pro users who have full access
const PRO_USERS = [
  'tyson.so1122@gmail.com',
  'developer@rvised.app',
  'pro@rvised.app'
]

const isProtectedRoute = createRouteMatcher([
  '/projects(.*)',
  '/library(.*)',
  '/settings(.*)',
  '/dashboard(.*)'
])

const isProOnlyRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/library(.*)',
  '/projects(.*)'
])

// These routes should be accessible without authentication (for extension and testing)
const isPublicApiRoute = createRouteMatcher([
  '/api/health(.*)',
  '/api/summarize(.*)',
  '/api/transcript(.*)',
  '/api/projects(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Skip Clerk middleware entirely for public API routes
  const url = new URL(req.url)
  if (isPublicApiRoute(req)) {
    return
  }

  // BLOCK ALL SIGN-IN/SIGN-UP PAGES IN WAITLIST MODE
  if (WAITLIST_MODE) {
    // Block sign-in and sign-up pages entirely
    if (url.pathname.startsWith('/sign-in') || 
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/sso-callback')) {
      
      // Check if trying to authenticate
      const { userId, sessionClaims } = await auth()
      const userEmail = sessionClaims?.email as string | undefined
      
      // If no user or not in whitelist, block completely
      if (!userEmail || !ALLOWED_EMAILS.includes(userEmail.toLowerCase())) {
        console.log(`BLOCKED: ${userEmail || 'unknown'} tried to access ${url.pathname}`)
        // Show waitlist message
        const blockedUrl = new URL('/', req.url)
        blockedUrl.searchParams.set('blocked', 'waitlist')
        blockedUrl.searchParams.set('message', 'Sign-ups are closed. Join the waitlist!')
        return NextResponse.redirect(blockedUrl)
      }
    }
  }

  // Get user info
  const { userId, sessionClaims } = await auth()
  const userEmail = sessionClaims?.email as string | undefined

  // WAITLIST MODE: Block any authenticated user not in whitelist
  if (WAITLIST_MODE && userId && userEmail) {
    if (!ALLOWED_EMAILS.includes(userEmail.toLowerCase())) {
      console.log(`BLOCKING USER: ${userEmail} not in whitelist`)
      // Sign them out and redirect
      if (url.pathname !== '/' && !url.pathname.startsWith('/api')) {
        const blockedUrl = new URL('/', req.url)
        blockedUrl.searchParams.set('blocked', 'unauthorized')
        blockedUrl.searchParams.set('message', 'Your account is not authorized. Join the waitlist!')
        return NextResponse.redirect(blockedUrl)
      }
    }
  }

  // PRO FEATURES: Block non-pro users from pro-only routes
  if (isProOnlyRoute(req) && userId && userEmail) {
    if (!PRO_USERS.includes(userEmail.toLowerCase())) {
      console.log(`BLOCKING PRO FEATURE: ${userEmail} tried to access ${url.pathname}`)
      // Redirect to upgrade page
      return NextResponse.redirect(new URL('/dashboard/upgrade', req.url))
    }
  }

  // Standard protection for authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}