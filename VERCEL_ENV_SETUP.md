# Setting Up Vercel Environment Variables

## Quick Setup Instructions

1. Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables

2. Add these environment variables (you'll need to get new API keys since the old ones were disabled):

### Required Environment Variables:

```
# OpenAI (Get new key from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
OPENAI_MODEL=gpt-4o-mini

# Clerk Auth (Your existing test keys should still work)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RlZC1mb3dsLTI1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_JnFULdSOIqszuzfwb0Zdf0jVsGYBcmdHcAohqOMOzx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (These should still work)
NEXT_PUBLIC_SUPABASE_URL=https://pouzqjduusuolceqaxjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjEyNjYsImV4cCI6MjA3MDk5NzI2Nn0.-a4PGtXZiKLoKJ8jT72onyrlaOjms7XPW60DSnHKYD4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQyMTI2NiwiZXhwIjoyMDcwOTk3MjY2fQ.7O34obbHModpviFiAMHB6t6bbaD4OWwJs9YguKebtlw

# App URL
NEXT_PUBLIC_APP_URL=https://rvised.vercel.app
```

### For Production (when ready):

```
# Stripe (Get from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_PRICE_ID_MONTHLY=price_YOUR_PRICE_ID
STRIPE_PRICE_ID_ANNUAL=price_YOUR_PRICE_ID
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Clerk Production Keys (Get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
CLERK_SECRET_KEY=sk_live_YOUR_KEY
```

## Steps:

1. Click "Add New" for each variable
2. Enter the key name (e.g., OPENAI_API_KEY)
3. Enter the value (your actual API key)
4. Select environments (Production, Preview, Development)
5. Click "Save"

## After Adding All Variables:

1. Go to Deployments tab
2. Click on the latest deployment
3. Click "Redeploy" → "Redeploy"

The site will rebuild with your environment variables properly configured!

## Getting New API Keys:

### OpenAI:
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key immediately (you won't see it again)

### Stripe (if needed):
1. Go to https://dashboard.stripe.com/apikeys
2. Use test keys for now
3. Switch to live keys when ready for production

## Important Notes:

- Never commit API keys to GitHub
- Always use environment variables on Vercel
- Keep your API keys secure and rotate them regularly
- The disabled keys cannot be re-enabled - you must create new ones