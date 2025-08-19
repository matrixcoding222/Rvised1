// Extension Configuration
// IMPORTANT: Set TEST_MODE to false before uploading to Chrome Web Store!

const CONFIG = {
  // ⚠️ CHANGE THIS TO false BEFORE PRODUCTION
  TEST_MODE: false,
  
  // Developer settings (only used when TEST_MODE is true)
  DEV: {
    // Skip onboarding requirement
    SKIP_ONBOARDING: true,
    
    // Auto-authenticate for testing
    AUTO_AUTH: {
      enabled: true,
      email: 'developer@rvised.app',
      tier: 'free'
    },
    
    // API endpoint (will auto-detect, but this is fallback)
    API_BASE: 'http://localhost:3003',
    
    // Show debug logs
    DEBUG_LOGS: true
  },
  
  // Production settings (used when TEST_MODE is false)
  PROD: {
    // Require onboarding
    SKIP_ONBOARDING: false,
    
    // No auto-auth
    AUTO_AUTH: {
      enabled: false
    },
    
    // Production API - Your custom domain!
    API_BASE: 'https://rvised.app',
    
    // Hide debug logs
    DEBUG_LOGS: false
  }
};

// Export the active configuration
const ACTIVE_CONFIG = CONFIG.TEST_MODE ? CONFIG.DEV : CONFIG.PROD;

// Helper function for logging
function debugLog(...args) {
  if (ACTIVE_CONFIG.DEBUG_LOGS) {
    console.log('[RVISED]', ...args);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.RVISED_CONFIG = ACTIVE_CONFIG;
  window.RVISED_TEST_MODE = CONFIG.TEST_MODE;
  window.debugLog = debugLog;
}