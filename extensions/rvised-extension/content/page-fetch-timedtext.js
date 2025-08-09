(() => {
  try {
    const params = new URLSearchParams(location.search);
    let v = params.get('v');
    if (!v) {
      // Support /embed/:id and youtu.be/:id forms inside the page context
      const pathMatch = location.pathname.match(/\/embed\/([^/?#]+)/) || location.pathname.match(/\/shorts\/([^/?#]+)/);
      if (pathMatch) v = pathMatch[1];
    }
    if (!v) return;

    function postEvents(json) {
      try {
        window.postMessage({ type: 'RVISED_TIMEDTEXT', payload: { json } }, '*');
      } catch (_) {}
    }

    function xmlToEvents(xmlText) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const texts = Array.from(xml.getElementsByTagName('text'));
      const events = [];
      for (const t of texts) {
        const start = parseFloat(t.getAttribute('start') || '0');
        const end = parseFloat(t.getAttribute('dur') || '0') + start;
        const utf8 = (t.textContent || '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\n/g, ' ')
          .trim();
        if (!utf8) continue;
        events.push({ tStartMs: Math.floor(start * 1000), dDurationMs: Math.floor((end - start) * 1000), segs: [{ utf8 }] });
      }
      return { events };
    }

    async function tryFetchFromPlayer() {
      try {
        // Try to use in-page player response for exact caption URL
        const playerEl = document.getElementById('movie_player');
        const pr = (window.ytInitialPlayerResponse || (playerEl && playerEl.getPlayerResponse && playerEl.getPlayerResponse())) || null;
        const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (Array.isArray(tracks) && tracks.length) {
          const pick = tracks.find(t => t.languageCode?.startsWith('en')) || tracks[0];
          let baseUrl = pick?.baseUrl;
          if (baseUrl) {
            baseUrl = baseUrl.replace(/\\u0026/g, '&');
            const jsonUrl = baseUrl.includes('fmt=') ? baseUrl : `${baseUrl}&fmt=json3`;
            const r = await fetch(jsonUrl, { credentials: 'include' });
            if (r.ok) {
              const j = await r.json();
              if (j && Array.isArray(j.events) && j.events.length) { postEvents(j); return true; }
            }
            const r2 = await fetch(baseUrl, { credentials: 'include' });
            if (r2.ok) {
              const txt = await r2.text();
              const j2 = xmlToEvents(txt);
              if (Array.isArray(j2.events) && j2.events.length) { postEvents(j2); return true; }
            }
          }
        }
      } catch (_) {}
      return false;
    }

    tryFetchFromPlayer().then((ok) => {
      if (ok) return;
      // Try same-origin timedtext first
      fetch(`/api/timedtext?v=${encodeURIComponent(v)}&fmt=json3&kind=asr&caps=asr`, { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (j && Array.isArray(j.events) && j.events.length) {
            postEvents(j); return;
          }
          return fetch(`https://video.google.com/timedtext?type=list&v=${encodeURIComponent(v)}`)
            .then(r => r.text())
            .then(xml => {
              const langs = Array.from(xml.matchAll(/lang_code=\"([^\"]+)\"/g)).map(m => m[1]);
              const pick = langs.find(l => l.startsWith('en')) || langs[0];
              if (!pick) return null;
              return fetch(`https://video.google.com/timedtext?v=${encodeURIComponent(v)}&lang=${encodeURIComponent(pick)}&fmt=json3`)
                .then(r => r.ok ? r.json() : null)
                .then(j2 => { if (j2 && Array.isArray(j2.events) && j2.events.length) postEvents(j2); });
            });
        })
        .catch(() => {});
    });
  } catch (_) {}
})();


