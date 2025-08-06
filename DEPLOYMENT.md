# 🚀 Rvised Deployment Guide

Complete guide for deploying both your web app and Chrome extension.

## 📁 Repository Structure (RECOMMENDED)

Keep everything in **one GitHub repository** but deploy to different platforms:

```
RVISED3/ (Single GitHub Repo)
├── rvised/                    # Next.js Web App
├── extensions/rvised-extension/  # Chrome Extension  
├── .github/workflows/         # CI/CD (optional)
├── DEPLOYMENT.md             # This file
└── README.md
```

## 🌐 **STEP 1: Deploy Web App to Production**

### Option A: Vercel (Recommended for Next.js)
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Add Rvised web app + extension"
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import your GitHub repo
# - Set Root Directory to: "rvised"
# - Deploy!
```

### Option B: Netlify
```bash
# Same as above, but:
# - Go to netlify.com  
# - Set Base directory to: "rvised"
# - Set Build command to: "npm run build"
# - Set Publish directory to: "rvised/.next"
```

### Your Production URL
After deployment, you'll get a URL like:
- `https://rvised.vercel.app` or
- `https://app.rvised.com` (with custom domain)

## 🔧 **STEP 2: Update Extension for Production**

```bash
# Navigate to extension directory
cd extensions/rvised-extension

# Build for production
npm run build:prod

# This updates manifest.json and removes localhost references
```

**IMPORTANT**: Open these files and replace `https://app.rvised.com` with your actual production URL:
- `background/background.js` (line 33)
- `popup/popup.js` (line 75)  
- `content/content.js` (line 204)

## 📦 **STEP 3: Package Extension for Chrome Web Store**

```bash
# Create production ZIP
cd extensions/rvised-extension
npm run zip

# This creates: rvised-extension-v1.0.0.zip
```

## 🏪 **STEP 4: Submit to Chrome Web Store**

1. **Go to**: [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)
2. **Pay**: $5 one-time developer fee (if first time)
3. **Upload**: Your `rvised-extension-v1.0.0.zip` file
4. **Fill out**:
   - Description: "AI-powered YouTube video summaries with learning modes"
   - Screenshots: Take screenshots of your extension in action
   - Privacy Policy: Link to your web app's privacy policy
5. **Submit**: For review (takes 1-3 days)

## 🔄 **STEP 5: Connect Extension to Production API**

### Update Web App API for CORS
Add this to your `rvised/next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'chrome-extension://*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### Test Production Connection
1. Load your production extension in Chrome
2. Go to any YouTube video
3. Click "Summarize" - it should call your live API!

## 🧪 **Development vs Production Workflow**

### For Development (Local Testing)
```bash
# Keep web app running locally
cd rvised && npm run dev

# Build extension for dev
cd extensions/rvised-extension
npm run build:dev

# Load in Chrome (points to localhost:3000)
```

### For Production Updates
```bash
# Deploy web app changes
git push origin main  # Auto-deploys via Vercel/Netlify

# Update extension
cd extensions/rvised-extension
npm run build:prod
npm run zip

# Upload new ZIP to Chrome Web Store
```

## 🔐 **Environment Variables**

### Web App (.env.local)
```bash
# Keep these secret - never commit to GitHub
OPENAI_API_KEY=sk-proj-...
YOUTUBE_API_KEY=AIzaSyA...

# For production, set these in Vercel/Netlify dashboard
```

### Extension
- No API keys needed in extension
- Everything goes through your web app API
- Extension just sends transcript to your API

## 📊 **Monitoring & Analytics**

### Web App
- Vercel Analytics (free)
- Google Analytics 
- Error tracking (Sentry)

### Extension
- Chrome Web Store analytics
- Usage metrics through your API
- User feedback via Chrome store reviews

## 🚀 **Publishing Checklist**

### Before Going Live:
- [ ] Web app deployed and working
- [ ] Extension tested with production API
- [ ] Privacy policy published  
- [ ] Terms of service published
- [ ] Extension screenshots taken
- [ ] Chrome store listing complete
- [ ] Domain configured (optional)

### Launch Day:
- [ ] Submit extension for review
- [ ] Share web app link publicly
- [ ] Monitor for errors
- [ ] Collect user feedback

## 🔄 **Future Updates**

### Web App Updates:
```bash
git push origin main  # Auto-deploys
```

### Extension Updates:
```bash
cd extensions/rvised-extension
# Update version in package.json
npm run build:prod
npm run zip
# Upload new ZIP to Chrome Web Store
```

## 💡 **Alternative Architectures**

If you prefer separate repositories:

### Option B: Separate Repos
```
github.com/yourname/rvised-webapp     # Web app only
github.com/yourname/rvised-extension  # Extension only
```

**Pros**: Cleaner separation, different permissions
**Cons**: Harder to keep in sync, more repos to manage

### Option C: Monorepo with Packages
```
RVISED3/
├── packages/
│   ├── webapp/
│   ├── extension/
│   └── shared/        # Shared types/utilities
├── package.json       # Root package manager
└── lerna.json         # Monorepo management
```

**Pros**: Shared code, professional setup
**Cons**: More complex, overkill for MVP

## 🎯 **RECOMMENDED MVP APPROACH**

For your MVP, stick with **Option A** (single repo, separate deployments):

1. ✅ Single GitHub repo (easier to manage)
2. ✅ Web app → Vercel (automatic deployments)
3. ✅ Extension → Chrome Web Store (manual updates)
4. ✅ Simple environment detection in extension
5. ✅ Keep it simple, ship fast! 🚀

This gives you the fastest path to market while keeping everything organized and maintainable.