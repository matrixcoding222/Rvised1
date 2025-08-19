# RVISED - Ready to Deploy Checklist

## Current Status
Your app is ready for deployment. Here's what you need to do:

## Step 1: Test Locally First
```bash
cd rvised
npm run build
npm run start
```
Open http://localhost:3000 and test:
- Sign up/Sign in flow
- Generate a summary on YouTube
- Save to project
- View dashboard

## Step 2: Prepare Production Environment Variables
Create a `.env.production.local` file in the `rvised` folder with:
```
# Keep your existing keys
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini

# Clerk (keep test keys for now, update later for production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe - Switch to LIVE keys when ready
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (will get from Vercel)

# Keep your price IDs
STRIPE_PRICE_ID_MONTHLY=price_1RwwStD1nlcujrqEToU41vx2
STRIPE_PRICE_ID_ANNUAL=price_1RwwStD1nlcujrqEo8993b0U

# Update this to your production URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=https://pouzqjduusuolceqaxjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Limits (keep existing)
NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY=3
NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES=20
```

## Step 3: Deploy to Vercel
```bash
# If you haven't installed Vercel CLI
npm i -g vercel

# Deploy
cd rvised
vercel

# Follow prompts, then deploy to production
vercel --prod
```

## Step 4: Configure Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.production.local`

## Step 5: Set Up Stripe Webhook
1. In Vercel dashboard, copy your production URL
2. Go to Stripe Dashboard > Webhooks
3. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.*`
5. Copy webhook secret and update in Vercel

## Step 6: Update Extension for Production
1. Edit `extensions/rvised-extension/config.js`:
```javascript
const API_URL = 'https://your-app.vercel.app';
```

2. Package extension:
```bash
cd extensions/rvised-extension
# Create a zip file with manifest.json, background/, content/, popup/, icons/
```

## Step 7: Test Production Setup
1. Visit your Vercel URL
2. Install extension locally (developer mode)
3. Test complete flow with production backend

## Step 8: Submit to Chrome Web Store
1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 developer fee (one-time)
3. Upload your extension zip
4. Add store listing details
5. Submit for review

## Quick Commands
```bash
# Build and test locally
cd rvised && npm run build && npm run start

# Deploy to Vercel
vercel --prod

# Package extension (Windows)
cd extensions/rvised-extension
powershell Compress-Archive -Path manifest.json,background,content,popup,icons,onboarding -DestinationPath rvised-extension.zip -Force
```

## Important Notes
- Keep test Stripe keys until you're ready to accept real payments
- Extension review takes 1-3 days typically
- Monitor Vercel logs for any production issues
- Your Supabase free tier supports up to 500MB database

You're ready to go! Start with local testing, then deploy to Vercel.