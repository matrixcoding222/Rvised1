import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json(
        { tier: 'free' },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-user-email',
          },
        }
      )
    }

    // TODO: Check your database or payment provider for actual user tier
    // For now, we'll check localStorage or return free
    // In production, you'd check Stripe subscription status or database
    
    // Example logic - replace with your actual tier checking
    const isDeveloper = userEmail === 'developer@rvised.app'
    const isPro = userEmail === 'pro@rvised.app' // For testing
    
    const tier = isDeveloper ? 'pro' : isPro ? 'pro' : 'free'
    
    return NextResponse.json(
      { 
        tier,
        email: userEmail
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-user-email',
        },
      }
    )
  } catch (error) {
    console.error('Error checking user tier:', error)
    return NextResponse.json(
      { tier: 'free' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-user-email',
        },
      }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-email',
    },
  })
}