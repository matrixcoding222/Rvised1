import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const { priceId, billingInterval, userEmail } = await request.json()

    // Determine the correct price ID based on billing interval
    let stripePriceId: string
    
    if (billingInterval === 'monthly') {
      stripePriceId = process.env.STRIPE_PRICE_ID_MONTHLY!
    } else if (billingInterval === 'annual') {
      stripePriceId = process.env.STRIPE_PRICE_ID_ANNUAL!
    } else {
      // For now, default to monthly if price ID is not set
      stripePriceId = priceId || process.env.STRIPE_PRICE_ID_MONTHLY!
    }

    // Check if price ID is still a placeholder
    if (stripePriceId?.includes('placeholder')) {
      return NextResponse.json(
        { 
          error: 'Stripe products not configured. Please create products in Stripe Dashboard and update .env.local with price IDs.' 
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: billingInterval === 'annual' || billingInterval === 'monthly' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade?canceled=true`,
      customer_email: userEmail || undefined,
      metadata: {
        userEmail: userEmail || 'guest',
        plan: billingInterval || 'pro',
      },
      subscription_data: billingInterval === 'annual' || billingInterval === 'monthly' ? {
        metadata: {
          userEmail: userEmail || 'guest',
          plan: billingInterval,
        },
      } : undefined,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create checkout session' 
      },
      { status: 500, headers: corsHeaders }
    )
  }
}