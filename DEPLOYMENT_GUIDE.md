# 🚀 Complete Deployment Guide for Rvised

## Overview
This guide covers deploying both the Chrome Extension to the Web Store and the Next.js app to production.

---

## Part 1: Chrome Extension Deployment

### Step 1: Prepare Extension Package
```bash
cd extensions/rvised-extension
./package-extension.bat  # On Windows
```
This creates `rvised-extension.zip` ready for submission.

### Step 2: Chrome Web Store Developer Account
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee
3. Complete account verification

### Step 3: Submit Extension
1. Click "New Item" in dashboard
2. Upload `rvised-extension.zip`
3. Fill in store listing:
   - **Name**: Rvised - YouTube Video Summarizer
   - **Summary**: Transform YouTube videos into smart summaries with AI
   - **Category**: Productivity
   - **Language**: English
   - **Description**: 
     ```
     Transform any YouTube video into structured learning content with AI-powered summaries.
     
     ✨ Features:
     • Instant AI summaries for any YouTube video
     • 3 learning modes: Student, Builder, Deep
     • Adjustable summary depth
     • Video timestamps for easy navigation
     • Save summaries to projects
     • Export to PDF/Markdown (Pro)
     
     🎯 Perfect for:
     • Students taking notes
     • Professionals learning new skills
     • Researchers gathering information
     • Anyone who wants to learn faster
     
     💡 How it works:
     1. Install the extension
     2. Go to any YouTube video
     3. Click "Generate Summary" in the Rvised panel
     4. Get instant, structured insights
     
     🆓 Free: 3 summaries per day
     💎 Pro: Unlimited summaries + longer videos
     ```

4. Add screenshots (1280x800 or 640x400):
   - Extension in action on YouTube
   - Summary panel open
   - Different modes showcase
   - Project saving feature

5. Add promotional images:
   - Small tile: 440x280
   - Large tile: 920x680
   - Marquee: 1400x560

6. Icons (use glasses.svg converted to PNG):
   - 128x128 icon

7. Set privacy practices:
   - Declare permissions usage
   - Add privacy policy URL

8. Submit for review

### Step 4: After Approval
Once approved (usually 1-3 days), you'll get:
- Extension ID (like: `abcdefghijklmnopqrstuvwx`)
- Public URL: `https://chrome.google.com/webstore/detail/rvised/[EXTENSION_ID]`

---

## Part 2: Next.js App Deployment (Vercel)

### Step 1: Prepare for Deployment

1. **Update environment variables** in `.env.production`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App
NEXT_PUBLIC_APP_URL=https://rvised.vercel.app

# OpenAI (or your AI provider)
OPENAI_API_KEY=sk-xxxxx

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx
```

2. **Update API endpoints** in extension:
```javascript
// extensions/rvised-extension/content/content.js
const API_BASE_URL = 'https://rvised.vercel.app';  // Update from localhost
```

### Step 2: Deploy to Vercel

#### Option A: Via GitHub (Recommended)
1. Push code to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Import from GitHub repository
5. Configure:
   - Framework: Next.js
   - Root Directory: `rvised`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables in Vercel dashboard
7. Deploy!

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# In rvised directory
cd rvised
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy
```

### Step 3: Configure Production Settings

1. **Set up custom domain** (optional):
   - In Vercel dashboard → Settings → Domains
   - Add your domain (e.g., `rvised.com`)
   - Update DNS records

2. **Configure Clerk for production**:
   - Go to Clerk Dashboard
   - Add production URLs:
     - Frontend: `https://rvised.vercel.app`
     - Allowed redirects: `https://rvised.vercel.app/*`

3. **Set up Stripe webhooks** (if using):
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://rvised.vercel.app/api/webhooks/stripe`
   - Select events to listen for

---

## Part 3: Update Extension with Production URLs

After deploying the web app:

1. **Update extension code**:
```javascript
// content/content.js
const DASHBOARD_URL = 'https://rvised.vercel.app/dashboard';
const API_URL = 'https://rvised.vercel.app/api';
```

2. **Re-package extension**:
```bash
./package-extension.bat
```

3. **Update in Chrome Web Store**:
   - Go to Developer Dashboard
   - Select your extension
   - Upload new package
   - Submit update

---

## Part 4: Post-Deployment Checklist

### Extension
- [ ] Extension appears in Chrome Web Store
- [ ] Install link works from website
- [ ] Extension loads on YouTube videos
- [ ] Summary generation works
- [ ] Save to dashboard works

### Web App
- [ ] Sign in with Google works
- [ ] Dashboard loads
- [ ] Projects save correctly
- [ ] Settings persist
- [ ] Payment flow works (if applicable)

### Integration
- [ ] Extension communicates with production API
- [ ] OAuth flow completes successfully
- [ ] Data syncs between extension and dashboard

---

## Part 5: Monitoring & Scaling

### Monitoring Setup
1. **Vercel Analytics**:
   - Enable in Vercel dashboard
   - Monitor performance metrics

2. **Error Tracking** (Sentry):
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

3. **Uptime Monitoring**:
   - Use services like UptimeRobot
   - Monitor API endpoints

### Scaling Considerations

1. **Database** (if needed):
   - Supabase (already configured)
   - Or PostgreSQL with Prisma

2. **Rate Limiting**:
```javascript
// api/middleware.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
```

3. **Caching**:
   - Use Vercel Edge Cache
   - Implement Redis for session data

4. **CDN for Assets**:
   - Vercel automatically provides CDN
   - Consider Cloudflare for additional protection

---

## Part 6: Marketing & Launch

### Chrome Web Store Optimization
1. **Keywords**: AI summarizer, YouTube notes, video summary, learning tool
2. **Update regularly**: Push updates every 2-3 weeks
3. **Respond to reviews**: Engage with user feedback

### Website SEO
1. Add to `rvised/src/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: 'Rvised - Transform YouTube into Your Personal Learning System',
  description: 'Generate intelligent summaries of educational videos',
  keywords: 'youtube summarizer, ai video summary, learning tool',
  openGraph: {
    title: 'Rvised',
    description: 'Transform YouTube videos into smart summaries',
    url: 'https://rvised.vercel.app',
    images: ['/og-image.png'],
  },
}
```

### Launch Checklist
- [ ] Submit to Product Hunt
- [ ] Share on Reddit (r/productivity, r/GetStudying)
- [ ] Create demo video
- [ ] Write blog post about the tool
- [ ] Reach out to YouTube educators

---

## Troubleshooting

### Extension Issues
- **Not appearing on YouTube**: Check content script matches in manifest
- **API calls failing**: Verify CORS settings and host permissions
- **Icon not showing**: Ensure all icon sizes are included

### Web App Issues
- **Build failures**: Check environment variables in Vercel
- **Auth not working**: Verify Clerk production keys
- **Database errors**: Check Supabase connection string

### Common Fixes
```bash
# Clear Vercel cache
vercel --force

# Rebuild without cache
npm run build -- --no-cache

# Check deployment logs
vercel logs
```

---

## Support & Updates

### Version Management
- Use semantic versioning (1.0.0)
- Update manifest version for each release
- Keep changelog in repository

### User Support
- Set up support email
- Create FAQ page
- Monitor Chrome Web Store reviews

### Continuous Deployment
Set up GitHub Actions:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
```

---

## 🎉 Launch Strategy

### Soft Launch (Week 1)
- Deploy to small group of beta testers
- Gather feedback
- Fix critical bugs

### Public Launch (Week 2)
- Announce on social media
- Submit to directories
- Reach out to influencers

### Growth Phase (Ongoing)
- Implement user feedback
- Add requested features
- Optimize based on analytics

---

## Important URLs

- **Extension**: `https://chrome.google.com/webstore/detail/rvised/[YOUR_EXTENSION_ID]`
- **Website**: `https://rvised.vercel.app`
- **Dashboard**: `https://rvised.vercel.app/dashboard`
- **API**: `https://rvised.vercel.app/api`

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Chrome Extension Docs: https://developer.chrome.com/docs/extensions/
- Clerk Docs: https://clerk.com/docs
- Next.js Docs: https://nextjs.org/docs