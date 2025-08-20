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

  // Get user info
  const { userId, sessionClaims } = await auth()
  const userEmail = sessionClaims?.email as string | undefined

  // WAITLIST MODE: Block signups for non-allowed users
  if (WAITLIST_MODE && userId && userEmail) {
    if (!ALLOWED_EMAILS.includes(userEmail.toLowerCase())) {
      // Redirect unauthorized users to home with message
      if (url.pathname !== '/' && !url.pathname.startsWith('/api')) {
        return NextResponse.redirect(new URL('/?blocked=waitlist', req.url))
      }
    }
  }

  // PRO FEATURES: Block non-pro users from pro-only routes
  if (isProOnlyRoute(req) && userId && userEmail) {
    if (!PRO_USERS.includes(userEmail.toLowerCase())) {
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