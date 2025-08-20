# Fix Vercel Deployment Error

## The Problem
Vercel is failing with: `sh: line 1: cd: rvised: No such file or directory`

## Solution

### Option 1: Fix in Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/general

2. Scroll down to **"Root Directory"**

3. Change it from empty or `.` to: `rvised`

4. Click **Save**

5. Go to Deployments and click **Redeploy**

### Option 2: Use Vercel CLI

```bash
cd C:\Users\User\RVISED3
vercel --prod
```

When prompted:
- Set up and deploy: Y
- Which scope: (your account)
- Link to existing project: Y
- What's the name: rvised
- **In which directory is your code located?: ./rvised**

### The Correct Project Structure

Your repository structure:
```
RVISED3/ (repository root)
├── vercel.json
├── rvised/ (Next.js app is here)
│   ├── package.json
│   ├── next.config.ts
│   ├── src/
│   └── ...
├── extensions/
└── other files...
```

## After Fixing Root Directory

Don't forget to add environment variables in Vercel:

1. Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables

2. Add these (minimum required):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RlZC1mb3dsLTI1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_JnFULdSOIqszuzfwb0Zdf0jVsGYBcmdHcAohqOMOzx
OPENAI_API_KEY=YOUR_NEW_OPENAI_KEY
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=https://rvised.vercel.app
```

3. Redeploy after adding variables

## Testing

Once deployed successfully:
1. Visit: https://rvised.vercel.app
2. Sign in should work with Google OAuth (after you fix Clerk settings)
3. Dashboard should show with gray theme
4. Promo code TYSONPRO2025 should work