(function() {
  try {
    // Expose caption tracks quickly if available
    try {
      const pr = window.ytInitialPlayerResponse;
      const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (Array.isArray(tracks) && tracks.length) {
        window.postMessage({ type: 'RVISED_CAPTION_TRACKS', payload: { tracks } }, '*');
      }
    } catch (_) {}

    // Patch fetch
    const originalFetch = window.fetch;
    window.fetch = async function() {
      const resp = await originalFetch.apply(this, arguments);
      try {
        const req = arguments[0];
        const url = (req && req.url) || req;
        if (typeof url === 'string' && url.includes('/api/timedtext') && (url.includes('fmt=json3') || url.includes('fmt=3'))) {
          resp.clone().text().then((text) => {
            try {
              const json = JSON.parse(text);
              window.postMessage({ type: 'RVISED_TIMEDTEXT', payload: { url, json } }, '*');
            } catch (_) {
              window.postMessage({ type: 'RVISED_TIMEDTEXT_TEXT', payload: { url, text } }, '*');
            }
          }).catch(() => {});
        }
      } catch (_) {}
      return resp;
    };

    // Patch XHR
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__rvised_url = url;
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      this.addEventListener('load', function() {
        try {
          const url = this.__rvised_url || '';
          if (typeof url === 'string' && url.includes('/api/timedtext')) {
            const text = this.responseText || '';
            try {
              const json = JSON.parse(text);
              window.postMessage({ type: 'RVISED_TIMEDTEXT', payload: { url, json } }, '*');
            } catch (_) {
              window.postMessage({ type: 'RVISED_TIMEDTEXT_TEXT', payload: { url, text } }, '*');
            }
          }
        } catch (_) {}
      });
      return origSend.apply(this, arguments);
    };
  } catch (_) {}
})();


