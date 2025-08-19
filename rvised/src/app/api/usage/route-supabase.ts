import { NextRequest, NextResponse } from 'next/server'
import { 
  getOrCreateUser,
  trackUsage,
  checkUsageLimits 
} from '@/lib/supabase/helpers'

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
  try {
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    
    // Get or create user
    const { user, error: userError } = await getOrCreateUser(userEmail)
    if (userError || !user) {
      // Return default limits for guests
      return NextResponse.json({
        usage: {
          summariesToday: 0,
          tier: 'free',
        },
        limits: {
          dailySummaries: 3,
          maxVideoMinutes: 20,
        },
        canSummarize: true,
      }, { headers: corsHeaders })
    }
    
    // Check usage limits
    const { canSummarize, summariesToday, limit, tier } = await checkUsageLimits(user.id)
    
    return NextResponse.json({
      usage: {
        summariesToday,
        tier,
      },
      limits: {
        dailySummaries: tier === 'pro' ? -1 : limit,
        maxVideoMinutes: tier === 'pro' ? -1 : parseInt(process.env.NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES || '20'),
      },
      canSummarize,
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Track a new summary or check limits
export async function POST(request: NextRequest) {
  try {
    const { action, videoLength } = await request.json()
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    
    // Get or create user
    const { user, error: userError } = await getOrCreateUser(userEmail)
    if (userError || !user) {
      // For guests, use simple in-memory tracking
      return NextResponse.json({
        success: true,
        usage: {
          summariesToday: 1,
          remaining: 2,
          tier: 'free',
        }
      }, { headers: corsHeaders })
    }
    
    // Check current limits
    const { canSummarize, summariesToday, limit, tier } = await checkUsageLimits(user.id)
    
    // Check if action is just checking limits
    if (action === 'check') {
      // Check daily limit for free tier
      if (tier === 'free' && !canSummarize) {
        return NextResponse.json({
          error: 'Daily limit reached',
          limitType: 'daily',
          message: `You've reached your daily limit of ${limit} summaries. Upgrade to Pro for unlimited summaries!`,
          upgradeUrl: '/dashboard/upgrade'
        }, { status: 429, headers: corsHeaders })
      }
      
      // Check video length limit for free tier (in seconds)
      const maxVideoMinutes = parseInt(process.env.NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES || '20')
      if (tier === 'free' && videoLength && videoLength > maxVideoMinutes * 60) {
        return NextResponse.json({
          error: 'Video too long',
          limitType: 'videoLength',
          message: `This video is ${Math.ceil(videoLength / 60)} minutes long. Free tier supports videos up to ${maxVideoMinutes} minutes. Upgrade to Pro for unlimited video length!`,
          upgradeUrl: '/dashboard/upgrade'
        }, { status: 429, headers: corsHeaders })
      }
      
      return NextResponse.json({
        success: true,
        canSummarize: true
      }, { headers: corsHeaders })
    }
    
    // Track usage if action is 'summarize'
    if (action === 'summarize') {
      // Check limits before tracking
      if (tier === 'free' && !canSummarize) {
        return NextResponse.json({
          error: 'Daily limit reached',
          limitType: 'daily',
          message: `You've reached your daily limit of ${limit} summaries. Upgrade to Pro for unlimited summaries!`,
          upgradeUrl: '/dashboard/upgrade'
        }, { status: 429, headers: corsHeaders })
      }
      
      // Track the usage
      const { usage, error } = await trackUsage(user.id)
      
      if (error) {
        console.error('Failed to track usage:', error)
      }
      
      return NextResponse.json({
        success: true,
        usage: {
          summariesToday: usage?.summaries_count || summariesToday + 1,
          remaining: tier === 'pro' ? -1 : Math.max(0, limit - (usage?.summaries_count || summariesToday + 1)),
          tier,
        }
      }, { headers: corsHeaders })
    }
    
    return NextResponse.json({
      error: 'Invalid action'
    }, { status: 400, headers: corsHeaders })
    
  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500, headers: corsHeaders }
    )
  }
}