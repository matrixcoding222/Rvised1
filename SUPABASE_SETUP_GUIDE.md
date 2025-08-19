# 🚀 Supabase Setup Guide for Rvised

## Step 1: Create Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (it's free!)
3. Sign up with GitHub or email
4. Click "New project"
5. Fill in:
   - **Name**: `rvised` (or any name you want)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is perfect to start

## Step 2: Get Your Keys

Once your project is created (takes ~2 minutes):

1. Go to **Settings** → **API**
2. You'll find these keys:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon public key**: `eyJ...` (long string)
   - **service_role key**: `eyJ...` (different long string - KEEP SECRET!)

## Step 3: Add Keys to Your Project

Copy these values and I'll add them to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: What I'll Set Up For You

Once you provide the keys, I'll automatically:

### Database Tables:
- **users** - Store user profiles and subscription status
- **projects** - User's saved projects
- **summaries** - All generated summaries
- **usage_tracking** - Track daily usage for limits
- **subscriptions** - Stripe subscription data

### Features:
- ✅ Persistent data storage (no more losing data on refresh!)
- ✅ User authentication (optional - can use Clerk or Supabase)
- ✅ Real-time updates
- ✅ Automatic backups
- ✅ Row Level Security (users only see their own data)

## Step 5: Ready to Go!

Just provide me with:
1. Your Supabase Project URL
2. Your anon key
3. Your service role key

And I'll handle the rest!

---

**Note**: The free tier includes:
- 500MB database
- 1GB file storage  
- 50,000 monthly active users
- Unlimited API requests

This is MORE than enough for thousands of users!