import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/projects(.*)',
  '/library(.*)',
  '/settings(.*)',
  '/dashboard(.*)'
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