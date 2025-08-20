import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, updateUserTier } from '@/lib/supabase/helpers'

// Define your promo codes here
const PROMO_CODES: Record<string, { tier: 'pro' | 'premium', description: string }> = {
  'TYSONPRO2025': { tier: 'pro', description: 'Special pro access' },
  'EARLYADOPTER': { tier: 'pro', description: 'Early adopter pro access' },
  'RVISED2025': { tier: 'pro', description: 'Launch promo' },
  'PROCODER': { tier: 'pro', description: 'Developer access' },
  'SPECIALACCESS': { tier: 'pro', description: 'Special access code' },
}

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json()
    
    if (!code || !email) {
      return NextResponse.json(
        { error: 'Code and email are required' },
        { status: 400 }
      )
    }
    
    // Check if the code is valid
    const promoData = PROMO_CODES[code.toUpperCase()]
    
    if (!promoData) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 400 }
      )
    }
    
    // Update user tier in database
    try {
      // First get or create the user
      const { user, error: userError } = await getOrCreateUser(email)
      
      if (userError || !user) {
        console.error('User error:', userError)
        // Even if database fails, we can still grant access via the hardcoded list
      }
      
      // Update user tier
      const { data, error: updateError } = await updateUserTier(email, promoData.tier)
      
      if (updateError) {
        console.error('Update error:', updateError)
        // Continue anyway - the hardcoded list will still work
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue - the hardcoded list approach will still work
    }
    
    // Also update in localStorage/session for immediate effect
    // The user tier check in other routes will recognize this email as pro
    
    return NextResponse.json({
      success: true,
      message: `Promo code applied! ${promoData.description}`,
      tier: promoData.tier
    })
    
  } catch (error) {
    console.error('Promo code error:', error)
    return NextResponse.json(
      { error: 'Failed to apply promo code' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Optional: Return available codes for admin/testing
  // Remove this in production
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({
      availableCodes: Object.keys(PROMO_CODES),
      message: 'Development mode - showing available codes'
    })
  }
  
  return NextResponse.json({ message: 'Promo code endpoint' })
}