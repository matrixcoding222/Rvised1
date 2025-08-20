# 🚀 Waitlist to Launch Guide

## Current Setup ✅
Your app is now in **Waitlist Mode** and automatically:
- Collects emails from visitors
- Stores them in `waitlist-emails.json`
- Shows "Extension in Final Review" messaging
- Displays expected launch timeline (2-5 days)

## Viewing Your Waitlist

### Option 1: Admin Dashboard (Web)
1. Go to: `http://localhost:3000/admin/waitlist` (or your deployed URL)
2. Enter your admin secret: `your-secret-key` (or set `WAITLIST_ADMIN_SECRET` in `.env.local`)
3. View all collected emails
4. Download as CSV
5. Copy all emails for pasting into email service

### Option 2: Direct File Access
- Emails are stored in: `waitlist-emails.json` in your project root
- Format: JSON array of email strings

## When Chrome Extension is Approved

### Step 1: Update Configuration
Edit `src/config/app-config.ts`:

```typescript
export const APP_CONFIG = {
  // CHANGE THIS TO 'live'
  mode: 'live',  // <-- Change from 'waitlist' to 'live'
  
  // ADD YOUR CHROME EXTENSION URL
  chromeExtensionUrl: 'https://chrome.google.com/webstore/detail/rvised/YOUR_EXTENSION_ID',
  
  // ... rest of config
}
```

### Step 2: Deploy the Update
```bash
git add .
git commit -m "Launch: Switch from waitlist to live mode"
git push
# Deploy to Vercel/your hosting
```

### Step 3: Email Your Waitlist
Use the collected emails to:
1. Send launch announcement
2. Include the Chrome Extension link
3. Thank them for waiting
4. Offer special "early adopter" benefits

### Email Template Example:
```
Subject: 🎉 Rvised is LIVE! Your Chrome Extension is Ready

Hi [Name],

Great news! Rvised has been approved and is now available in the Chrome Web Store!

As promised, you're among the first to know. 

👉 Install Rvised Now: [YOUR_CHROME_EXTENSION_URL]

As an early adopter, you get:
✅ 3 free summaries daily
✅ Priority support
✅ Input on new features

Thank you for your patience during the review process!

Best,
The Rvised Team
```

## API Endpoints

### Collect Emails
- **POST** `/api/waitlist`
- Body: `{ "email": "user@example.com" }`
- Automatically saves to file

### View Waitlist Stats
- **GET** `/api/waitlist`
- Returns count and status

### Export Emails (Protected)
- **GET** `/api/waitlist/export`
- Header: `Authorization: Bearer your-secret-key`
- Returns JSON list

### Download CSV (Protected)
- **GET** `/api/waitlist/export?format=csv`
- Header: `Authorization: Bearer your-secret-key`
- Downloads as CSV file

## Environment Variables
Add to `.env.local`:
```
WAITLIST_ADMIN_SECRET=your-secure-admin-password
```

## Email Services Integration
To automatically email your waitlist, integrate with:
- SendGrid
- Mailgun
- AWS SES
- Resend
- Or any email API service

## Files Created
- `src/components/waitlist-banner.tsx` - Top banner component
- `src/config/app-config.ts` - Easy mode switching
- `src/app/api/waitlist/route.ts` - Email collection API
- `src/app/api/waitlist/export/route.ts` - Export API
- `src/app/admin/waitlist/page.tsx` - Admin dashboard
- `waitlist-emails.json` - Email storage (auto-created)

## Testing Locally
1. Submit an email through the form
2. Check `waitlist-emails.json` is created
3. Visit `/admin/waitlist` to see collected emails
4. Test download/export features

## Going Live Checklist
- [ ] Chrome Extension approved
- [ ] Extension URL obtained
- [ ] Update app-config.ts
- [ ] Deploy changes
- [ ] Export waitlist emails
- [ ] Prepare launch email
- [ ] Send to waitlist
- [ ] Monitor for issues
- [ ] Celebrate! 🎉