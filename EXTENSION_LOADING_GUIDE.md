# Chrome Extension Loading Guide

## Step 1: Load the Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right corner)
4. Click **"Load unpacked"** button
5. Navigate to and select the folder: `C:\Users\User\RVISED3\extensions\rvised-extension`
6. The extension should now appear in your extensions list

## Step 2: Verify Extension is Loaded

After loading, you should see:
- Extension name: "Rvised - YouTube Video Summarizer"
- Version: 1.0.0
- The extension should be enabled (toggle should be ON)
- No errors should be displayed

If you see errors, click "Details" → "Errors" to view them.

## Step 3: Ensure Backend is Running

The extension needs the Next.js backend to be running:

```bash
# If not already running, start the backend:
cd C:\Users\User\RVISED3
start-all-services.bat
```

Or manually:
```bash
cd rvised
npm run dev
```

The backend should be running at http://localhost:3000

## Step 4: Test on YouTube

1. Open a YouTube video: https://www.youtube.com/watch?v=jNQXAC9IVRw
2. Wait for the page to fully load
3. Look for the **"Summarize"** button next to the Like/Dislike buttons
4. Click the "Summarize" button to generate a summary

## Step 5: Troubleshooting

### If the Summarize button doesn't appear:

1. **Refresh the extension:**
   - Go to `chrome://extensions/`
   - Find "Rvised - YouTube Video Summarizer"
   - Click the refresh icon (🔄)

2. **Reload the YouTube page:**
   - Press F5 or Ctrl+R on the YouTube video page

3. **Check console for errors:**
   - On YouTube page, press F12 to open DevTools
   - Go to Console tab
   - Look for any red error messages

### If "Chrome extension API not available" error:

This error appears on non-extension pages. The test page (`test-complete-flow.html`) won't have Chrome API access unless you:
1. Open it through the extension itself, OR
2. Test directly on YouTube pages (recommended)

### If summarization fails:

1. **Check backend is running:**
   - Open http://localhost:3000 in a new tab
   - Should see the Rvised homepage

2. **Check API health:**
   - Open http://localhost:3000/api/health
   - Should return OK

3. **Try a different video:**
   - Some videos may not have captions available

## Step 6: Quick Test Videos

Try these videos for testing:
- Short test: https://www.youtube.com/watch?v=jNQXAC9IVRw (19 seconds)
- Medium test: https://www.youtube.com/watch?v=ofS9C_E_PlA
- Popular test: https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Extension not visible in toolbar | Click puzzle icon in Chrome toolbar, pin Rvised extension |
| "Failed to fetch" error | Ensure backend is running (`start-all-services.bat`) |
| No Summarize button on YouTube | Refresh extension and reload YouTube page |
| Summary not appearing | Check if video has captions/subtitles available |
| Extension disappeared | Re-load from `chrome://extensions/` |

## Development Tips

- After making changes to extension files, always refresh the extension in `chrome://extensions/`
- Use F12 Console on YouTube pages to see debug messages
- The extension only works on YouTube video pages (URLs with `/watch?v=`)