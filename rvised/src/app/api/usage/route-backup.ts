import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for usage tracking (replace with database in production)
const userUsage = new Map<string, {
  summariesToday: number
  lastResetDate: string
  tier: 'free' | 'pro'
}>()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Get user's current usage
export async function GET(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email') || 'guest'
  const today = new Date().toISOString().split('T')[0]
  
  let usage = userUsage.get(userEmail)
  
  // Reset daily counter if it's a new day
  if (!usage || usage.lastResetDate !== today) {
    usage = {
      summariesToday: 0,
      lastResetDate: today,
      tier: usage?.tier || 'free'
    }
    userUsage.set(userEmail, usage)
  }
  
  const limits = {
    dailySummaries: usage.tier === 'pro' ? -1 : parseInt(process.env.NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY || '3'),
    maxVideoMinutes: usage.tier === 'pro' ? -1 : parseInt(process.env.NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES || '20'),
  }
  
  return NextResponse.json({
    usage: {
      summariesToday: usage.summariesToday,
      tier: usage.tier,
    },
    limits,
    canSummarize: usage.tier === 'pro' || usage.summariesToday < limits.dailySummaries,
  }, { headers: corsHeaders })
}

// Track a new summary
export async function POST(request: NextRequest) {
  try {
    const { action, videoLength } = await request.json()
    const userEmail = request.headers.get('x-user-email') || 'guest'
    const today = new Date().toISOString().split('T')[0]
    
    let usage = userUsage.get(userEmail)
    
    // Reset daily counter if it's a new day
    if (!usage || usage.lastResetDate !== today) {
      usage = {
        summariesToday: 0,
        lastResetDate: today,
        tier: usage?.tier || 'free'
      }
    }
    
    // Check if user has Pro subscription
    // TODO: Check actual subscription status from database/Stripe
    const checkSubscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe?email=${userEmail}`)
    if (checkSubscriptionResponse.ok) {
      const subData = await checkSubscriptionResponse.json()
      usage.tier = subData.tier || 'free'
    }
    
    const limits = {
      dailySummaries: usage.tier === 'pro' ? -1 : parseInt(process.env.NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY || '3'),
      maxVideoMinutes: usage.tier === 'pro' ? -1 : parseInt(process.env.NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES || '20'),
    }
    
    // Check limits for free tier
    if (usage.tier === 'free') {
      // Check daily limit
      if (usage.summariesToday >= limits.dailySummaries) {
        return NextResponse.json({
          error: 'Daily limit reached',
          limitType: 'daily',
          message: `You've reached your daily limit of ${limits.dailySummaries} summaries. Upgrade to Pro for unlimited summaries!`,
          upgradeUrl: '/dashboard/upgrade'
        }, { status: 429, headers: corsHeaders })
      }
      
      // Check video length limit (in seconds)
      if (videoLength && videoLength > limits.maxVideoMinutes * 60) {
        return NextResponse.json({
          error: 'Video too long',
          limitType: 'videoLength',
          message: `This video is ${Math.ceil(videoLength / 60)} minutes long. Free tier supports videos up to ${limits.maxVideoMinutes} minutes. Upgrade to Pro for unlimited video length!`,
          upgradeUrl: '/dashboard/upgrade'
        }, { status: 429, headers: corsHeaders })
      }
    }
    
    // Increment usage if action is 'summarize'
    if (action === 'summarize') {
      usage.summariesToday++
      userUsage.set(userEmail, usage)
    }
    
    return NextResponse.json({
      success: true,
      usage: {
        summariesToday: usage.summariesToday,
        remaining: usage.tier === 'pro' ? -1 : Math.max(0, limits.dailySummaries - usage.summariesToday),
        tier: usage.tier,
      }
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500, headers: corsHeaders }
    )
  }
}