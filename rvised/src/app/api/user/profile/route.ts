import { NextRequest, NextResponse } from 'next/server'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, x-user-tier',
  'Access-Control-Max-Age': '86400'
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    const userTier = request.headers.get('x-user-tier') || 'free'
    
    // Mock user profile for testing
    const profile = {
      email: userEmail,
      tier: userTier,
      name: userEmail.split('@')[0],
      avatar: null,
      subscription: {
        status: userTier === 'pro' ? 'active' : 'free',
        plan: userTier,
        expiresAt: userTier === 'pro' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
      },
      usage: {
        summariesGenerated: 5,
        summariesLimit: userTier === 'free' ? 10 : -1,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
    
    return NextResponse.json(profile, {
      status: 200,
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}