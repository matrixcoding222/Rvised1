# Chrome Web Store - Test Credentials for Review

When submitting your extension to the Chrome Web Store, you need to provide test credentials so reviewers can test the full functionality. Here are the credentials and instructions:

## Test Account Credentials

### Free Tier Test Account
```
Email: chrome.reviewer@rvised.app
Password: ChromeTest2025!
```

### Pro Tier Test Account (Optional)
```
Email: chrome.reviewer.pro@rvised.app
Password: ChromeTestPro2025!
```

## Instructions for Chrome Reviewers

### Testing the Extension:

1. **Installation & Setup**
   - Install the extension from Chrome Web Store
   - Navigate to any YouTube video
   - The Rvised button should appear below the video

2. **Test Free Features (Use Free Account)**
   - Click the Rvised button
   - Sign in with the free test account
   - Generate a summary (Brief mode)
   - Test the quiz feature
   - Save to a project
   - Note: Free tier limited to 3 summaries/day and 20-minute videos

3. **Test Pro Features (Use Pro Account)**
   - Sign in with Pro test account
   - Test on a video longer than 20 minutes
   - Try all summary modes (Brief, Detailed, Study, Creative)
   - Test export features (PDF/Markdown)
   - Verify unlimited summaries work

4. **Test Payment Flow (Optional)**
   - From free account, click "Upgrade to Pro"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - This will NOT charge real money

## Notes for Reviewers

### What This Extension Does:
- Summarizes YouTube videos using AI
- Provides learning tools (quizzes, notes)
- Saves summaries to user projects
- Works only on YouTube.com

### Privacy & Permissions:
- Only accesses YouTube when user clicks summarize
- No background tracking or data collection
- Requires sign-in for summary saving
- All user data is encrypted and private

### Common Test Scenarios:
1. **Basic Summary**: Any TED Talk or educational video under 20 minutes
2. **Long Video**: Test with a 1+ hour tutorial or lecture (Pro only)
3. **Quiz Generation**: Works best with educational content
4. **Project Organization**: Create and manage summary collections

### Test Videos to Try:
- Short (5 min): "How to tie a tie" tutorials
- Medium (15 min): TED Talks
- Long (1+ hour): Programming tutorials or lectures

## Support During Review

If reviewers encounter any issues:
- Email: support@rvised.app
- Response time: Within 2-4 hours during business hours
- Website: https://rvised.app

## Setting Up Test Accounts (For Developer)

### In Clerk Dashboard:
1. Create these user accounts manually
2. For Pro account, manually set subscription status to "pro"
3. Or use Stripe test mode to simulate Pro subscription

### Alternative: Auto-Approve Reviewers
Add this to your backend (temporary during review):
```javascript
// In your API route
const REVIEWER_EMAILS = [
  'chrome.reviewer@rvised.app',
  'chrome.reviewer.pro@rvised.app'
];

if (REVIEWER_EMAILS.includes(userEmail)) {
  // Grant temporary Pro access
  return { tier: 'pro', limits: null };
}
```

## Submission Notes

When submitting to Chrome Web Store, in the "Notes for Reviewers" field, add:

```
Test Credentials Available:

Free Account:
Email: chrome.reviewer@rvised.app
Password: ChromeTest2025!

Pro Account (full features):
Email: chrome.reviewer.pro@rvised.app  
Password: ChromeTestPro2025!

For payment testing, use Stripe test card: 4242 4242 4242 4242

The extension requires a YouTube video to be open to function. Please test on any YouTube video. Educational content works best for meaningful summaries.

Contact support@rvised.app if you need assistance during review.
```

## Important Reminders

1. **Create these accounts in Clerk** before submitting
2. **Test the accounts yourself** to ensure they work
3. **Monitor these accounts** during review period
4. **Remove or change passwords** after approval
5. **Ensure Pro account has active subscription** in your database

## After Approval

Once approved, remember to:
- Change passwords on test accounts
- Remove any special reviewer privileges
- Update your backend to remove auto-approval code
- Consider keeping accounts for future updates/reviews