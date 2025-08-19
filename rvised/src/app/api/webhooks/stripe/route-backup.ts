import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// In-memory storage for user subscriptions (replace with database in production)
const userSubscriptions = new Map<string, {
  tier: 'free' | 'pro'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodEnd?: Date
}>()

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
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Get user email from session
      const userEmail = session.customer_email || session.metadata?.userEmail || 'unknown'
      
      // Update user subscription status
      userSubscriptions.set(userEmail, {
        tier: 'pro',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      })

      console.log(`✅ User ${userEmail} upgraded to Pro`)
      
      // TODO: Update user in your database
      // TODO: Send confirmation email
      
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Find user by customer ID
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      const userEmail = customer.email || 'unknown'
      
      // Update subscription info
      userSubscriptions.set(userEmail, {
        tier: 'pro',
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      })

      console.log(`📅 Subscription updated for ${userEmail}`)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Find user by customer ID
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      const userEmail = customer.email || 'unknown'
      
      // Downgrade to free tier
      userSubscriptions.set(userEmail, {
        tier: 'free',
        stripeCustomerId: subscription.customer as string,
      })

      console.log(`⬇️ User ${userEmail} downgraded to Free`)
      
      // TODO: Update user in your database
      // TODO: Send cancellation email
      
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

  return NextResponse.json({ received: true })
}

// Helper endpoint to check user subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ tier: 'free' })
  }
  
  const subscription = userSubscriptions.get(email)
  
  return NextResponse.json({
    tier: subscription?.tier || 'free',
    currentPeriodEnd: subscription?.currentPeriodEnd,
  })
}