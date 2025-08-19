@echo off
echo Adding environment variables to Vercel...

vercel env add OPENAI_API_KEY production
vercel env add OPENAI_MODEL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRICE_ID_MONTHLY production
vercel env add STRIPE_PRICE_ID_ANNUAL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY production
vercel env add NEXT_PUBLIC_FREE_MAX_VIDEO_MINUTES production
vercel env add NEXT_PUBLIC_APP_URL production

echo Done! Now redeploy with: vercel --prod