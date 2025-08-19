// Test the Stripe checkout flow
async function testCheckout() {
  console.log('🧪 Testing Stripe checkout flow...\n');

  try {
    // Test monthly checkout
    console.log('Testing monthly subscription checkout...');
    const monthlyResponse = await fetch('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billingInterval: 'monthly',
        userEmail: 'test@rvised.app'
      })
    });

    const monthlyData = await monthlyResponse.json();
    
    if (monthlyData.error) {
      console.error('❌ Monthly checkout error:', monthlyData.error);
    } else if (monthlyData.checkoutUrl) {
      console.log('✅ Monthly checkout URL created successfully!');
      console.log('   URL:', monthlyData.checkoutUrl);
      console.log('   Session ID:', monthlyData.sessionId);
    }

    console.log('\n---\n');

    // Test annual checkout
    console.log('Testing annual subscription checkout...');
    const annualResponse = await fetch('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billingInterval: 'annual',
        userEmail: 'test@rvised.app'
      })
    });

    const annualData = await annualResponse.json();
    
    if (annualData.error) {
      console.error('❌ Annual checkout error:', annualData.error);
    } else if (annualData.checkoutUrl) {
      console.log('✅ Annual checkout URL created successfully!');
      console.log('   URL:', annualData.checkoutUrl);
      console.log('   Session ID:', annualData.sessionId);
    }

    console.log('\n🎉 Checkout flow is working! You can now:');
    console.log('1. Open the checkout URLs above to test the payment flow');
    console.log('2. Use test card: 4242 4242 4242 4242');
    console.log('3. Any future expiry date and any CVC');

  } catch (error) {
    console.error('❌ Error testing checkout:', error.message);
    console.log('\nMake sure your Next.js server is running on port 3000');
  }
}

// Run the test
testCheckout();