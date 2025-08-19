// Setup Stripe Products for LIVE MODE
// Run this script to create your products and prices in Stripe

const stripe = require('stripe')('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');

async function setupStripeProducts() {
  try {
    console.log('Creating products in LIVE mode...');

    // Create the main product
    const product = await stripe.products.create({
      name: 'Rvised Pro',
      description: 'Unlimited YouTube video summaries with advanced AI features',
      metadata: {
        tier: 'pro'
      }
    });

    console.log('Product created:', product.id);

    // Create monthly price ($9.99/month)
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'monthly'
      }
    });

    console.log('Monthly price created:', monthlyPrice.id);

    // Create annual price ($99/year - save $20)
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900, // $99 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan: 'annual'
      }
    });

    console.log('Annual price created:', annualPrice.id);

    console.log('\n✅ SUCCESS! Add these to your .env.production.local:\n');
    console.log(`STRIPE_PRICE_ID_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ID_ANNUAL=${annualPrice.id}`);

  } catch (error) {
    console.error('Error setting up products:', error);
  }
}

setupStripeProducts();