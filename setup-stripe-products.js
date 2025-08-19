const Stripe = require('stripe');

// Use your test secret key
const stripe = new Stripe('sk_test_51RVhOyD1nlcujrqESxg5uNekmxiwVP4M6IBRJzILI0RvreK8m2qDNuXpLKwRQxf87nIWpXkBHYWRoOchLMifdCXC007DH6uFpQ');

async function setupProducts() {
  try {
    console.log('🚀 Creating Stripe products...\n');

    // Create the main product
    const product = await stripe.products.create({
      name: 'Rvised Pro',
      description: 'Unlimited video summaries, any length, with priority processing and export features',
      metadata: {
        app: 'rvised',
        tier: 'pro'
      }
    });

    console.log('✅ Product created:', product.id);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 799, // $7.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      nickname: 'Monthly',
      metadata: {
        billing: 'monthly'
      }
    });

    console.log('✅ Monthly price created:', monthlyPrice.id);

    // Create annual price
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 4788, // $47.88 in cents ($3.99/month * 12)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'Annual (Save 50%)',
      metadata: {
        billing: 'annual',
        savings: '50%'
      }
    });

    console.log('✅ Annual price created:', annualPrice.id);

    // Output the configuration
    console.log('\n📝 Add these to your .env.local file:\n');
    console.log(`STRIPE_PRICE_ID_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ID_ANNUAL=${annualPrice.id}`);

    // Also save to a file for easy copying
    const fs = require('fs');
    const envContent = `
# Stripe Price IDs (Generated)
STRIPE_PRICE_ID_MONTHLY=${monthlyPrice.id}
STRIPE_PRICE_ID_ANNUAL=${annualPrice.id}
`;

    fs.writeFileSync('stripe-price-ids.txt', envContent);
    console.log('\n✅ Price IDs also saved to stripe-price-ids.txt');

    return {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      annualPriceId: annualPrice.id
    };

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 Tip: Make sure you\'re using the correct Stripe secret key');
    }
    process.exit(1);
  }
}

// Run the setup
setupProducts().then(result => {
  console.log('\n🎉 Stripe products created successfully!');
  console.log('Next steps:');
  console.log('1. Update your .env.local with the Price IDs above');
  console.log('2. Restart your Next.js server (npm run dev)');
  console.log('3. Test the checkout flow');
  process.exit(0);
});