import { createClient } from './client'
import { createAdminClient } from './server'
import type { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type Summary = Database['public']['Tables']['summaries']['Row']
type UsageTracking = Database['public']['Tables']['usage_tracking']['Row']

// User functions
export async function getOrCreateUser(email: string, fullName?: string) {
  const supabase = createAdminClient()
  
  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (existingUser) {
    return { user: existingUser, error: null }
  }
  
  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      email,
      full_name: fullName,
      tier: 'free'
    })
    .select()
    .single()
  
  return { user: newUser, error: createError }
}

export async function updateUserTier(email: string, tier: 'free' | 'pro') {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('users')
    .update({ tier })
    .eq('email', email)
    .select()
    .single()
  
  return { data, error }
}

// Project functions
export async function getUserProjects(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  return { projects: data || [], error }
}

export async function createProject(userId: string, name: string, description?: string, emoji?: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name,
      description,
      emoji
    })
    .select()
    .single()
  
  return { project: data, error }
}

export async function deleteProject(projectId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)
  
  return { error }
}

// Summary functions
export async function saveSummary(
  userId: string,
  videoUrl: string,
  videoTitle: string,
  summaryData: any,
  learningMode: string,
  summaryDepth: string,
  projectId?: string,
  channelName?: string,
  videoLength?: number
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('summaries')
    .insert({
      user_id: userId,
      project_id: projectId,
      video_url: videoUrl,
      video_title: videoTitle,
      channel_name: channelName,
      video_length: videoLength,
      summary_data: summaryData,
      learning_mode: learningMode,
      summary_depth: summaryDepth
    })
    .select()
    .single()
  
  // Update project summary count if project is specified
  if (projectId && !error) {
    await supabase
      .from('projects')
      .update({ 
        summary_count: supabase.raw('summary_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
  }
  
  return { summary: data, error }
}

export async function getUserSummaries(userId: string, limit = 20) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('summaries')
    .select('*, projects(name, emoji)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { summaries: data || [], error }
}

// Usage tracking functions
export async function trackUsage(userId: string) {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Try to increment existing record
  const { data: existing, error: fetchError } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  
  if (existing) {
    const { data, error } = await supabase
      .from('usage_tracking')
      .update({ 
        summaries_count: existing.summaries_count + 1 
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    return { usage: data, error }
  }
  
  // Create new record for today
  const { data, error } = await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      date: today,
      summaries_count: 1
    })
    .select()
    .single()
  
  return { usage: data, error }
}

export async function checkUsageLimits(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Get user tier
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('tier')
    .eq('id', userId)
    .single()
  
  if (userError || !user) {
    return { canSummarize: true, summariesToday: 0, limit: 3, tier: 'free' }
  }
  
  // Pro users have unlimited
  if (user.tier === 'pro') {
    return { canSummarize: true, summariesToday: -1, limit: -1, tier: 'pro' }
  }
  
  // Check today's usage for free users
  const { data: usage, error: usageError } = await supabase
    .from('usage_tracking')
    .select('summaries_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  
  const summariesToday = usage?.summaries_count || 0
  const dailyLimit = parseInt(process.env.NEXT_PUBLIC_FREE_SUMMARIES_PER_DAY || '3')
  
  return {
    canSummarize: summariesToday < dailyLimit,
    summariesToday,
    limit: dailyLimit,
    tier: 'free'
  }
}

// Subscription functions
export async function createOrUpdateSubscription(
  userId: string,
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  status: string,
  priceId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
) {
  const supabase = createAdminClient()
  
  // Check if subscription exists
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()
  
  if (existing) {
    // Update existing subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status,
        price_id: priceId,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    return { subscription: data, error }
  }
  
  // Create new subscription
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      status,
      price_id: priceId,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString()
    })
    .select()
    .single()
  
  // Update user tier
  if (!error && status === 'active') {
    await updateUserTier(userId, 'pro')
  }
  
  return { subscription: data, error }
}