# Fix Clerk Sign-In Issues

## 1. Update Vercel Environment Variable
Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables

Update:
```
NEXT_PUBLIC_APP_URL = https://rvised-tysonso1122-2100s-projects.vercel.app
```
(Change from rvised.app to your Vercel URL)

## 2. In Clerk Dashboard

### Production Instance Settings:
1. Go to: https://dashboard.clerk.com
2. Select your app
3. Go to **Paths** or **URLs & Redirects**

### Update these URLs:
- **Home URL**: https://rvised-tysonso1122-2100s-projects.vercel.app
- **Sign-in URL**: https://rvised-tysonso1122-2100s-projects.vercel.app/sign-in
- **Sign-up URL**: https://rvised-tysonso1122-2100s-projects.vercel.app/sign-up
- **Redirect URL after sign-in**: https://rvised-tysonso1122-2100s-projects.vercel.app/dashboard
- **Redirect URL after sign-up**: https://rvised-tysonso1122-2100s-projects.vercel.app/dashboard

### In Domains section:
- Add: `rvised-tysonso1122-2100s-projects.vercel.app`
- Remove or disable: `rvised.app` (for now)

## 3. Redeploy
```bash
cd rvised
vercel --prod --force
```

## 4. Test
Visit: https://rvised-tysonso1122-2100s-projects.vercel.app/sign-in

Should work now!