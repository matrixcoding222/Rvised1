# Quick Deployment Commands

## 1. Test Locally
```bash
cd rvised
npm run build
npm run start
```

## 2. Deploy to Vercel
```bash
# First time setup
npm i -g vercel
vercel

# Production deployment
vercel --prod
```

## 3. Update Extension for Production
After getting your Vercel URL, update `extensions/rvised-extension/config.js`:
```javascript
PROD: {
  API_BASE: 'https://your-vercel-url.vercel.app'
}
```

Then repackage:
```bash
cd extensions/rvised-extension
# The RVISED-READY-TO-DEPLOY.zip is already created
```

## 4. Environment Variables for Vercel
Add these in Vercel Dashboard > Settings > Environment Variables:
- OPENAI_API_KEY
- OPENAI_MODEL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID_MONTHLY
- STRIPE_PRICE_ID_ANNUAL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY
- NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES

## 5. Stripe Webhook Setup
1. Get your production URL from Vercel
2. In Stripe Dashboard, add webhook endpoint:
   `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy webhook secret to Vercel env vars

## 6. Chrome Web Store Submission
1. Developer account: https://chrome.google.com/webstore/devconsole
2. Upload: RVISED-READY-TO-DEPLOY.zip
3. Required assets:
   - 128x128 icon (already in package)
   - Screenshots (1280x800)
   - Description (132 chars max)
   - Detailed description

## Status Check
- Build succeeds
- Extension packaged
- CORS configured
- Production mode enabled