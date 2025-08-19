// Update Stripe Prices for COMPETITIVE PRICING
// $8.99/month or $49.99/year (save 54%!)

const stripe = require('stripe')('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');

async function updatePrices() {
  try {
    console.log('Creating competitive prices...');
    
    // Archive old prices first
    console.log('Archiving old prices...');
    await stripe.prices.update('price_1RxkniDXzhJJqYIfVIDcSCPH', { active: false });
    await stripe.prices.update('price_1RxkniDXzhJJqYIf7EKmrcjx', { active: false });

    // Use existing product
    const productId = 'prod_StXtDNRiGYqWh8';

    // Create new monthly price ($8.99/month - beats competitor's $9.99!)
    const monthlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 899, // $8.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'monthly',
        competitor_price: '9.99'
      }
    });

    console.log('Monthly price created: $8.99/month -', monthlyPrice.id);

    // Create annual price ($49.99/year - beats competitor's $59.99!)
    // User saves $57.89 vs monthly!
    const annualPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 4999, // $49.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan: 'annual',
        competitor_price: '59.99',
        monthly_equivalent: '4.17'
      }
    });

    console.log('Annual price created: $49.99/year -', annualPrice.id);

    console.log('\n✅ COMPETITIVE PRICING CREATED!\n');
    console.log('Monthly: $8.99 (competitor: $9.99) - Save $1/month');
    console.log('Annual: $49.99 (competitor: $59.99) - Save $10/year');
    console.log('Annual subscribers save 54% vs monthly!\n');
    console.log('Update your .env.production.local:\n');
    console.log(`STRIPE_PRICE_ID_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ID_ANNUAL=${annualPrice.id}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

updatePrices();