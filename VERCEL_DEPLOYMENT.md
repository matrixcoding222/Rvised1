# Vercel Deployment Guide

## Prerequisites
- Vercel account (free tier is sufficient)
- GitHub account (for automatic deployments)
- Production environment variables ready

## Step 1: Prepare for Deployment

### Build Test
```bash
cd rvised
npm run build
```
✅ Build completed successfully

### Files Ready
- ✅ Production build created
- ✅ Environment variables template created
- ✅ All TypeScript errors resolved

## Step 2: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to production:
```bash
cd rvised
vercel --prod
```

3. Follow the prompts:
   - Link to existing project or create new
   - Select "rvised" as project name
   - Configure project settings

### Option B: Deploy via GitHub

1. Push your code to GitHub:
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `rvised`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 3: Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

### Required Variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://rvised.app
NEXT_PUBLIC_EXTENSION_ID=[YOUR_EXTENSION_ID]
```

### Optional Variables (if using):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## Step 4: Configure Custom Domain

1. In Vercel Dashboard > Settings > Domains
2. Add domain: `rvised.app`
3. Configure DNS records at your domain registrar:
   - A Record: Point to Vercel IP
   - CNAME: Point to `cname.vercel-dns.com`

## Step 5: Update Extension Configuration

After deployment, update the extension config with production URL:

1. Edit `extensions/rvised-extension/config.js`
2. Set production API URL to your Vercel deployment URL
3. Repackage extension if needed

## Step 6: Enable CORS for Extension

Ensure your API routes allow the Chrome extension:

### Already Configured in:
- `/api/projects/route.ts`
- `/api/summarize/route.ts`
- `/api/transcript/route.ts`

Headers include:
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email'
```

## Step 7: Post-Deployment Checklist

- [ ] Verify production build at https://rvised.app
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Test extension connection to production API
- [ ] Verify CORS headers working
- [ ] Check all API endpoints responding
- [ ] Test summary generation
- [ ] Verify project creation/deletion
- [ ] Test data persistence

## Step 8: Monitor & Optimize

### Vercel Analytics
- Enable Web Analytics in Vercel Dashboard
- Monitor Core Web Vitals
- Track usage patterns

### Error Monitoring (Optional)
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- PostHog for product analytics

## Deployment Commands Summary

```bash
# Initial deployment
cd rvised
vercel --prod

# Subsequent deployments (after git push)
vercel --prod

# Preview deployment (for testing)
vercel

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

## Rollback Plan

If issues arise:
1. Go to Vercel Dashboard > Deployments
2. Find previous working deployment
3. Click "..." menu > "Promote to Production"
4. Fix issues in development
5. Redeploy when ready

## Environment-Specific URLs

- **Production:** https://rvised.app
- **Preview:** https://rvised-[branch]-[username].vercel.app
- **Development:** http://localhost:3003

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)