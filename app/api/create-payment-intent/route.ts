import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionPaymentIntent, createCustomer } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, email, name } = await request.json();

    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Amount and email are required' },
        { status: 400 }
      );
    }

    // Create or get customer
    let customerId: string | undefined;
    try {
      const customer = await createCustomer(email, name);
      customerId = customer.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      // Continue without customer ID for now
    }

    // Create payment intent
    const paymentIntent = await createSubscriptionPaymentIntent(amount, customerId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customerId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
