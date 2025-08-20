# Fix Google OAuth Authentication Issue

## The Problem
Your Google OAuth is redirecting to `accounts.rvised.app` which doesn't exist. Your app is deployed at `rvised.vercel.app`.

## Quick Fix Steps

### 1. Update Clerk Dashboard Settings

Go to: https://dashboard.clerk.com

#### A. Fix Domains
1. Navigate to **Configure → Domains**
2. Remove or disable `accounts.rvised.app`
3. Add domain: `rvised.vercel.app`
4. Set as primary domain

#### B. Fix URLs & Redirects
1. Navigate to **Configure → Paths**
2. Update ALL URLs to use `rvised.vercel.app`:
   - **Application home URL**: `https://rvised.vercel.app`
   - **Sign-in URL**: `https://rvised.vercel.app/sign-in`
   - **Sign-up URL**: `https://rvised.vercel.app/sign-up`
   - **After sign-in URL**: `https://rvised.vercel.app/dashboard`
   - **After sign-up URL**: `https://rvised.vercel.app/dashboard`

#### C. Fix OAuth Settings
1. Navigate to **Configure → SSO Connections → Google**
2. Make sure redirect URIs include:
   - `https://rvised.vercel.app/sso-callback`
   - `https://rvised.vercel.app/sign-in`
   - `https://rvised.vercel.app/sign-up`

### 2. Update Vercel Environment Variables

Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables

Add/Update these variables:
```
NEXT_PUBLIC_APP_URL=https://rvised.vercel.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Get Your Clerk Keys

While in Clerk Dashboard:
1. Go to **API Keys**
2. Copy the keys for your environment (Development or Production)
3. Add to Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY`
   - `CLERK_SECRET_KEY=sk_test_YOUR_KEY`

### 4. Redeploy on Vercel

After updating environment variables:
1. Go to Vercel Deployments
2. Click on the latest deployment
3. Click **Redeploy** → **Redeploy**

## Testing

After redeployment (takes 1-2 minutes):
1. Visit: https://rvised.vercel.app
2. Click "Sign In" 
3. Choose "Continue with Google"
4. Should work without redirect errors!

## If Still Not Working

### Option A: Use Clerk Development Instance
If you're using production keys but want to test first:
1. In Clerk Dashboard, switch to Development instance
2. Use the development keys (start with `pk_test_` and `sk_test_`)
3. Development instance is more flexible with domains

### Option B: Check Google Console
1. Go to: https://console.cloud.google.com
2. Select your project
3. APIs & Services → Credentials
4. Click on your OAuth 2.0 Client
5. Add these to Authorized redirect URIs:
   - `https://rvised.vercel.app/sso-callback`
   - Any Clerk redirect URLs shown in error

## Important Notes

- **Never use `rvised.app`** until you own that domain
- **Always use `rvised.vercel.app`** for now
- When ready for production, you can buy a custom domain and update these settings

## Current Working Configuration

Your app should use:
- **Main URL**: https://rvised.vercel.app
- **Sign In**: https://rvised.vercel.app/sign-in
- **Dashboard**: https://rvised.vercel.app/dashboard
- **Extension API**: https://rvised.vercel.app/api/

NO subdomain like `accounts.` should be used!