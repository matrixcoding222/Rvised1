import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { 
  getOrCreateUser,
  updateUserTier,
  createOrUpdateSubscription 
} from '@/lib/supabase/helpers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get user email from session
        const userEmail = session.customer_email || session.metadata?.userEmail
        if (!userEmail) {
          console.error('No email found in checkout session')
          break
        }
        
        // Get or create user
        const { user, error: userError } = await getOrCreateUser(userEmail)
        if (userError || !user) {
          console.error('Failed to get/create user:', userError)
          break
        }
        
        // Update user with Stripe customer ID
        const supabase = require('@/lib/supabase/server').createAdminClient()
        await supabase
          .from('users')
          .update({
            stripe_customer_id: session.customer as string,
            tier: 'pro'
          })
          .eq('id', user.id)
        
        console.log(`✅ User ${userEmail} upgraded to Pro via checkout`)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        const userEmail = customer.email
        if (!userEmail) {
          console.error('No email found for customer')
          break
        }
        
        // Get or create user
        const { user, error: userError } = await getOrCreateUser(userEmail)
        if (userError || !user) {
          console.error('Failed to get/create user:', userError)
          break
        }
        
        // Create or update subscription record
        const { subscription: sub, error } = await createOrUpdateSubscription(
          user.id,
          subscription.id,
          subscription.customer as string,
          subscription.status,
          subscription.items.data[0].price.id,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000)
        )
        
        if (error) {
          console.error('Failed to update subscription:', error)
        } else {
          console.log(`📅 Subscription updated for ${userEmail}`)
        }
        
        // Update user tier based on subscription status
        const tier = subscription.status === 'active' ? 'pro' : 'free'
        await updateUserTier(userEmail, tier)
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        const userEmail = customer.email
        if (!userEmail) {
          console.error('No email found for customer')
          break
        }
        
        // Downgrade user to free tier
        await updateUserTier(userEmail, 'free')
        
        // Update subscription status in database
        const supabase = require('@/lib/supabase/server').createAdminClient()
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        
        console.log(`⬇️ User ${userEmail} downgraded to Free`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`💰 Payment succeeded for invoice ${invoice.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`❌ Payment failed for invoice ${invoice.id}`)
        
        // TODO: Send email to user about failed payment
        // TODO: Implement retry logic or downgrade after multiple failures
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

// Helper endpoint to check user subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ tier: 'free' })
  }
  
  try {
    const { user } = await getOrCreateUser(email)
    
    if (!user) {
      return NextResponse.json({ tier: 'free' })
    }
    
    // Get active subscription
    const supabase = require('@/lib/supabase/server').createAdminClient()
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    return NextResponse.json({
      tier: subscription ? 'pro' : 'free',
      currentPeriodEnd: subscription?.current_period_end,
    })
  } catch (error) {
    console.error('Error checking subscription:', error)
    return NextResponse.json({ tier: 'free' })
  }
}