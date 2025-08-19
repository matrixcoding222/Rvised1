// Rvised Pricing Configuration
export const PRICING = {
  tiers: {
    free: {
      name: 'Free',
      price: 0,
      limits: {
        summariesPerDay: 3,
        maxVideoMinutes: 20,
        exportFormats: [],
        apiAccess: false,
        priorityProcessing: false
      },
      features: [
        '3 summaries/day',
        '20-minute video cap',
        'All core features',
        'Projects & notes',
        'Interactive quizzes'
      ]
    },
    pro: {
      name: 'Pro',
      prices: {
        monthly: {
          amount: 899, // $8.99 in cents
          interval: 'month',
          display: '$8.99/month'
        },
        annual: {
          amount: 4999, // $49.99 in cents (~$4.17/month)
          interval: 'year',
          display: '$4.17/month',
          savings: 54 // 54% savings vs monthly
        },
        lifetime: {
          amount: 9900, // $99 in cents
          interval: null,
          display: '$99 once',
          limited: true,
          maxUsers: 100
        }
      },
      limits: {
        summariesPerDay: -1, // Unlimited
        maxVideoMinutes: -1, // Unlimited
        exportFormats: ['pdf', 'markdown', 'docx'],
        apiAccess: true,
        priorityProcessing: true
      },
      features: [
        'Unlimited summaries',
        'Any video length',
        'Priority processing',
        'Export to PDF/Markdown',
        'API access (coming soon)',
        'Early access to features',
        'Priority support'
      ]
    }
  },
  
  // Upgrade trigger messages
  triggers: {
    dailyLimit: {
      title: '🎯 Daily limit reached',
      message: 'You\'ve used all 3 free summaries today',
      cta: 'Get unlimited summaries with Pro!',
      discount: 'Save 54% with annual'
    },
    videoLength: {
      title: '📺 Video too long',
      message: 'This video is {duration} minutes long',
      subtitle: 'Free tier supports videos up to 20 minutes',
      cta: 'Upgrade to Pro for videos of any length!',
      discount: 'Only $4.17/mo with annual billing'
    },
    export: {
      title: '📥 Export feature',
      message: 'Export summaries to PDF, Markdown, or Word',
      cta: 'Unlock with Pro',
      discount: 'Start at $4.17/month'
    }
  },
  
  // Growth strategy milestones
  growth: {
    month1: { summariesPerDay: 3, maxVideoMinutes: 20 },
    month2: { summariesPerDay: 4, maxVideoMinutes: 25 },
    month3: { summariesPerDay: 5, maxVideoMinutes: 30 },
    month6: { summariesPerDay: 10, maxVideoMinutes: 45 }
  },
  
  // Target metrics
  metrics: {
    targetConversionRate: 0.10, // 10%
    breakEvenConversionRate: 0.05, // 5%
    averageDailyUsage: 2.1,
    targetLTV: 80 // $80 per paid user
  }
}

// Helper functions
export function isWithinFreeLimit(userStats: { summariesToday: number, tier: string }) {
  if (userStats.tier === 'pro') return true
  return userStats.summariesToday < PRICING.tiers.free.limits.summariesPerDay
}

export function canProcessVideo(duration: number, tier: string) {
  if (tier === 'pro') return true
  const maxMinutes = PRICING.tiers.free.limits.maxVideoMinutes
  return duration <= maxMinutes * 60 // duration in seconds
}

export function getUpgradeMessage(type: 'dailyLimit' | 'videoLength' | 'export', data?: any) {
  const trigger = PRICING.triggers[type]
  let message = trigger.message
  
  if (type === 'videoLength' && data?.duration) {
    message = message.replace('{duration}', Math.ceil(data.duration / 60))
  }
  
  return {
    ...trigger,
    message
  }
}

export function calculateSavings(billingInterval: 'monthly' | 'annual') {
  if (billingInterval === 'annual') {
    const monthlyTotal = PRICING.tiers.pro.prices.monthly.amount * 12
    const annualTotal = PRICING.tiers.pro.prices.annual.amount
    return {
      amount: monthlyTotal - annualTotal,
      percentage: Math.round((1 - annualTotal / monthlyTotal) * 100)
    }
  }
  return { amount: 0, percentage: 0 }
}