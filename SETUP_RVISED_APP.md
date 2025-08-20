# Setup Guide for rvised.app Domain

## ✅ Since you own rvised.app, here's the correct configuration:

### 1. Clerk Dashboard Configuration
Go to: https://dashboard.clerk.com

#### A. Fix Domains
1. Navigate to **Configure → Domains**
2. Remove `accounts.rvised.app` (we don't need a subdomain)
3. Add domain: `rvised.app`
4. Set as primary domain

#### B. Fix URLs & Redirects
1. Navigate to **Configure → Paths**
2. Update ALL URLs to use `rvised.app`:
   - **Application home URL**: `https://rvised.app`
   - **Sign-in URL**: `https://rvised.app/sign-in`
   - **Sign-up URL**: `https://rvised.app/sign-up`
   - **After sign-in URL**: `https://rvised.app/dashboard`
   - **After sign-up URL**: `https://rvised.app/dashboard`

#### C. Fix OAuth Settings
1. Navigate to **Configure → SSO Connections → Google**
2. Make sure redirect URIs include:
   - `https://rvised.app/sso-callback`
   - `https://rvised.app/sign-in`
   - `https://rvised.app/sign-up`

### 2. Vercel Environment Variables
Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables

Add these variables:
```
# App Configuration
NEXT_PUBLIC_APP_URL=https://rvised.app

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RlZC1mb3dsLTI1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_JnFULdSOIqszuzfwb0Zdf0jVsGYBcmdHcAohqOMOzx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI (Get new key from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
OPENAI_MODEL=gpt-4o-mini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pouzqjduusuolceqaxjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjEyNjYsImV4cCI6MjA3MDk5NzI2Nn0.-a4PGtXZiKLoKJ8jT72onyrlaOjms7XPW60DSnHKYD4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQyMTI2NiwiZXhwIjoyMDcwOTk3MjY2fQ.7O34obbHModpviFiAMHB6t6bbaD4OWwJs9YguKebtlw
```

### 3. Vercel Project Settings
Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/general

1. **Root Directory**: Set to `rvised`
2. **Domain**: Make sure `rvised.app` is connected

### 4. Google Cloud Console (if needed)
If Google OAuth still shows errors:

1. Go to: https://console.cloud.google.com
2. Select your project
3. APIs & Services → Credentials
4. Click on your OAuth 2.0 Client
5. Add to Authorized redirect URIs:
   - `https://rvised.app/sso-callback`
   - `https://rvised.app/sign-in`
   - `https://rvised.app/sign-up`
   - Any Clerk URLs shown in the error

### 5. After Setup
1. Redeploy on Vercel
2. Test at https://rvised.app
3. Sign in with Google should work!

## Important Notes
- ✅ Use `rvised.app` everywhere (no subdomains like accounts.)
- ✅ Make sure Clerk dashboard uses `rvised.app` not `rvised.vercel.app`
- ✅ Extension config now points to `rvised.app`
- ❌ Don't use `accounts.rvised.app` - it's not needed

## Your Features (Once Deployed)
- Waitlist system with email collection
- Gray-themed dashboard
- Promo code: TYSONPRO2025
- Pro access for tyson.so1122@gmail.com
- Blue upgrade button in extension
- Google OAuth authentication