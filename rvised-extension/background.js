// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    // Store the data
    chrome.storage.local.set({ lastTranscript: request.data });

    const videoUrl = request.data?.videoUrl || '';
    if (!videoUrl) {
      sendResponse({ success: false, error: 'Missing videoUrl' });
      return true;
    }

    // Try Next.js backend: localhost → https → prod
    const candidates = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://rvised.vercel.app'
    ];

    const tryNext = async () => {
      for (const base of candidates) {
        try {
          const resp = await fetch(`${base}/api/transcript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUrl })
          });
          if (!resp.ok) continue;
          const j = await resp.json();
          if (j?.success && typeof j.transcript === 'string' && j.transcript.length > 20) {
            chrome.storage.local.set({ lastTranscript: { ...request.data, transcript: j.transcript } });
            sendResponse({ success: true, summary: 'Transcript retrieved from Next.js API.' });
            return;
          }
        } catch (_) {}
      }
      sendResponse({ success: false, error: 'Transcript unavailable from backend' });
    };

    tryNext();
    return true;
  }
  return true;
});


