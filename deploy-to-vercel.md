# Deploy to Vercel - Final Steps

## 1. Add Environment Variables

Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables

Add these variables for **Production** environment:

```
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucnZpc2VkLmFwcCQ
CLERK_SECRET_KEY=sk_live_EIDMS9Ok0DjTjkElpuUywqYfSeuMFjMNPWgSCUYEdz
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RVhOlDXzhJJqYIfZuPptkpKjdv3AYrB4Sa1UmBKwEBHkc2VErRgwdZk6v9xKrhsBHOlUlg0sj4mc2OYbQhXlqVS00ZIzOqybZ
STRIPE_SECRET_KEY=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
STRIPE_PRICE_ID_MONTHLY=price_1RxksRDXzhJJqYIfMOmjd4vP
STRIPE_PRICE_ID_ANNUAL=price_1RxksSDXzhJJqYIfFCzqo9qa
NEXT_PUBLIC_SUPABASE_URL=https://pouzqjduusuolceqaxjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjEyNjYsImV4cCI6MjA3MDk5NzI2Nn0.-a4PGtXZiKLoKJ8jT72onyrlaOjms7XPW60DSnHKYD4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQyMTI2NiwiZXhwIjoyMDcwOTk3MjY2fQ.7O34obbHModpviFiAMHB6t6bbaD4OWwJs9YguKebtlw
NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY=3
NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES=20
NEXT_PUBLIC_APP_URL=https://rvised.app
```

## 2. Redeploy

After adding environment variables, redeploy:

```bash
cd rvised
vercel --prod --force
```

## 3. Connect Domain

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add `rvised.app`
3. Follow DNS instructions (usually add A and CNAME records)

## 4. Set Up Stripe Webhook

Once deployed:
1. Go to Stripe Dashboard
2. Add webhook endpoint: `https://rvised.app/api/webhooks/stripe`
3. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy webhook secret
5. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

## 5. Test

Visit https://rvised.app and test:
- Sign up flow
- Generate summary
- Upgrade to Pro
- Payment processing