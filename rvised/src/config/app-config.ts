// App Configuration - Easy toggle between waitlist and live mode

export const APP_CONFIG = {
  // CHANGE THIS TO 'live' WHEN YOUR EXTENSION IS APPROVED
  mode: 'waitlist' as 'waitlist' | 'live',
  
  // ADD YOUR CHROME EXTENSION URL HERE WHEN APPROVED
  chromeExtensionUrl: '', // e.g., 'https://chrome.google.com/webstore/detail/rvised/YOUR_EXTENSION_ID'
  
  // Waitlist settings
  waitlist: {
    expectedLaunchDays: '2-5 days',
    currentCount: 500, // Base number to show momentum
  },
  
  // Email notification settings (optional - for sending emails to waitlist)
  emailService: {
    sendWelcomeEmail: true,
    sendLaunchNotification: true,
  }
}

// Helper function to check if in waitlist mode
export const isWaitlistMode = () => APP_CONFIG.mode === 'waitlist'

// Helper function to get extension URL
export const getExtensionUrl = () => {
  return APP_CONFIG.chromeExtensionUrl || '#'
}