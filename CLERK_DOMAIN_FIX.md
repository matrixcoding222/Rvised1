# Fix Clerk Domain Configuration

## The Problem
Clerk is redirecting to `accounts.rvised.app` but we want everything on `rvised.app`

## Solution in Clerk Dashboard

### 1. Go to Clerk Dashboard
https://dashboard.clerk.com

### 2. Navigate to Paths
Configure → Paths

### 3. IMPORTANT: Change ALL Component Paths

For each setting, select **"Sign-in page on application domain"** NOT "Account Portal":

- **<SignIn />**: Select "application domain" → `/sign-in`
- **<SignUp />**: Select "application domain" → `/sign-up`  
- **Signing Out**: Select "Path on application domain" → `/`

### 4. Disable Account Portal
Configure → Account Portal → **DISABLE IT**

This stops all redirects to `accounts.rvised.app`

### 5. Update Production Instance
If you have multiple instances (Development/Production), make sure to update the Production instance

### 6. Check Domains
Configure → Domains
- Remove `accounts.rvised.app` if it's there
- Only keep `rvised.app`

## After Fixing
The app should only use:
- `https://rvised.app/sign-in`
- `https://rvised.app/sign-up`
- `https://rvised.app/dashboard`

NO `accounts.rvised.app` anywhere!