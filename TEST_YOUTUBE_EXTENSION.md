# 🎥 YOUTUBE EXTENSION TEST GUIDE

## ✅ Step 1: Load the Extension

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **"Load unpacked"**
5. Select folder: `C:\Users\User\RVISED3\extensions\rvised-extension`
6. You should see "Rvised - YouTube Video Summarizer" in your extensions

## ✅ Step 2: Test on YouTube

### Test Video URLs:
- **Short video (19 sec):** https://www.youtube.com/watch?v=jNQXAC9IVRw
- **Medium video:** https://www.youtube.com/watch?v=dQw4w9WgXcQ
- **Tech tutorial:** https://www.youtube.com/watch?v=pTB0EiLXUC8

### What to Look For:

1. **Summarize Button**: 
   - Blue button next to Like/Dislike buttons
   - Says "Summarize" initially
   - Changes to "Summarizing..." when clicked
   - Changes to "View Summary" when done

2. **Extension Card**:
   - Appears on right side of video
   - Shows loading animation during processing
   - Displays summary when complete

## ✅ Step 3: Test All Features

### 🎯 Main Features:
- [ ] **Summarize**: Click button, wait for summary
- [ ] **Copy**: Copy summary to clipboard
- [ ] **Download**: Download as markdown file
- [ ] **Dashboard**: Opens main app dashboard
- [ ] **Settings**: Customize options

### ⚙️ Settings Panel:
- [ ] **Learning Mode**: Student / Build / Understand
- [ ] **Summary Depth**: Quick / Standard / Deep
- [ ] **Include Timestamps**: Toggle on/off
- [ ] **Generate Quiz**: Toggle on/off
- [ ] **Include Transcript**: Toggle on/off

### 👤 Profile Features:
- [ ] **Profile Button**: Shows user icon
- [ ] **Profile Dropdown**: Shows email & membership
- [ ] **Sign Out**: Clears user session

## ✅ Step 4: Test Connection to Main App

1. **Dashboard Button**: Should open http://localhost:3000/dashboard
2. **Save to Project**: Should save summary to your projects
3. **Settings Link**: Should open settings page

## 🔧 Troubleshooting

### If Extension Doesn't Appear:
```bash
1. Refresh extension in chrome://extensions/
2. Reload YouTube page (F5)
3. Check console for errors (F12)
```

### If Summarization Fails:
```bash
1. Check server is running: http://localhost:3000
2. Check API health: http://localhost:3000/api/health
3. Try a different video (needs captions)
```

### If "Extension context invalidated":
```bash
1. Go to chrome://extensions/
2. Click refresh icon on Rvised extension
3. Reload YouTube page
```

## 📊 Quick Test Checklist

```
✅ Extension loads on YouTube
✅ Summarize button visible
✅ Click generates summary
✅ Summary displays correctly
✅ Copy button works
✅ Download button works
✅ Dashboard link works
✅ Settings save properly
✅ All modes work (student/build/understand)
✅ All depths work (quick/standard/deep)
✅ Timestamps toggle works
✅ Quiz generation works
```

## 🚀 API Configuration

The extension is configured with:
- **API Key**: ✅ Configured in .env.local
- **Model**: gpt-4o-mini
- **Endpoints**: 
  - Summarize: `/api/summarize`
  - Transcript: `/api/transcript`
  - Projects: `/api/projects`
  - Health: `/api/health`

## 💡 Tips

1. **Best Testing Video**: Use https://www.youtube.com/watch?v=jNQXAC9IVRw (19 seconds, has captions)
2. **Check Console**: Press F12 on YouTube to see debug messages
3. **Test All Modes**: Try each learning mode to see different summary styles
4. **Test All Depths**: Quick = 600 chars, Standard = 1200 chars, Deep = 2400 chars

---

**Server Status**: Running on http://localhost:3000
**Extension Status**: Ready to test
**API Key Status**: ✅ Configured