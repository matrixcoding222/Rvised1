# OAuth Configuration Guide for Rvised

## Change "Continue to Clerk" to "Continue to Rvised"

To customize the OAuth application name that appears on Google's sign-in page, follow these steps:

### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Navigate to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project named "Rvised" or select an existing one

2. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search for and enable "Google+ API"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in the application information:
     - **App name**: Rvised
     - **User support email**: Your email
     - **App logo**: Upload the glasses.svg logo (convert to PNG first if needed)
     - **Application home page**: https://rvised.vercel.app (or your domain)
     - **Authorized domains**: Add your domain(s)
     - **Developer contact information**: Your email

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Rvised Web Client"
   - Authorized JavaScript origins:
     - `https://rvised.vercel.app`
     - `http://localhost:3000` (for development)
   - Authorized redirect URIs (get these from Clerk Dashboard):
     - `https://YOUR-CLERK-FRONTEND-API.clerk.accounts.dev/v1/oauth_callback`
     - Add any other URIs that Clerk provides

5. **Save Your Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

### Step 2: Clerk Dashboard Configuration

1. **Access Clerk Dashboard**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your Rvised application

2. **Configure Google OAuth**
   - Navigate to "User & Authentication" → "Social Connections"
   - Find "Google" in the list
   - Toggle it ON if not already enabled
   - Click on "Google" to configure

3. **Use Custom Credentials**
   - Click "Use custom credentials"
   - Enter your Google OAuth credentials:
     - **Client ID**: Paste from Google Cloud Console
     - **Client Secret**: Paste from Google Cloud Console
   - Save the configuration

### Step 3: Test the Integration

1. **Clear your browser cache** (important!)
2. Visit your app and click "Sign In"
3. You should now see "Choose an account to continue to **Rvised**" with your logo

### Troubleshooting

If you still see "Continue to Clerk":
- Make sure you've enabled "Use custom credentials" in Clerk
- Verify the OAuth consent screen is properly configured in Google
- Check that your domain is verified in Google Cloud Console
- Try using an incognito/private browser window

### Important Notes

- **Development vs Production**: You may need separate OAuth apps for development (localhost) and production
- **Verification**: For production use, Google may require app verification if you request sensitive scopes
- **Logo Requirements**: Google requires logos to be square, at least 120x120px, PNG format
- **Domain Verification**: Your domain needs to be verified in Google Search Console

### Environment Variables

After setting up custom OAuth, your environment variables remain the same:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
```

The custom OAuth credentials are stored in Clerk's dashboard, not in your code.

## Benefits of Custom OAuth

✅ Professional appearance with your brand name  
✅ Your logo on Google's sign-in page  
✅ Builds trust with users  
✅ Consistent branding throughout auth flow  
✅ No mention of third-party services (Clerk)

## Need Help?

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/google)
- [Google OAuth Setup Guide](https://support.google.com/cloud/answer/6158849)
- [Google Branding Guidelines](https://developers.google.com/identity/branding-guidelines)