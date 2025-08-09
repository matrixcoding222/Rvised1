import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const PORT = process.env.PORT || 8787;

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: '*', maxAge: 86400 }));

let browser;
async function getBrowser() {
  if (!browser) browser = await chromium.launch({ headless: true });
  return browser;
}

function extractVideoId(input) {
  if (!input) return null;
  if (/^[\w-]{8,15}$/.test(input)) return input;
  const m = input.match(/(?:watch\?v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

app.get('/health', (_, res) => res.status(200).json({ ok: true }));

app.post('/transcript', async (req, res) => {
  try {
    const { videoId: rawId, videoUrl } = req.body || {};
    const videoId = extractVideoId(rawId || videoUrl);
    if (!videoId) return res.status(400).json({ success: false, error: 'Missing videoId/videoUrl' });

    const br = await getBrowser();
    const context = await br.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    await page.goto(`https://www.youtube.com/watch?v=${videoId}&hl=en`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);

    const text = await page.evaluate(async (vid) => {
      function buildFromEvents(events) {
        let out = '', t = 0;
        (events || []).forEach(ev => {
          if (typeof ev?.tStartMs === 'number') t = Math.floor(ev.tStartMs / 1000);
          if (Array.isArray(ev?.segs)) {
            const m = String(Math.floor(t / 60)).padStart(2, '0');
            const s = String(t % 60).padStart(2, '0');
            const txt = ev.segs.map(x => x.utf8).join('').trim();
            if (txt) out += `[${m}:${s}] ${txt} `;
          }
        });
        return out.trim();
      }

      async function tryJson3(url) {
        const u = url.includes('fmt=') ? url : `${url}&fmt=json3`;
        const r = await fetch(u, { credentials: 'include' });
        if (!r.ok) return null;
        const j = await r.json().catch(() => null);
        if (j?.events?.length) return buildFromEvents(j.events);
        return null;
      }

      async function tryXml(url) {
        const r = await fetch(url, { credentials: 'include' });
        if (!r.ok) return null;
        const xml = await r.text();
        const dom = new DOMParser().parseFromString(xml, 'text/xml');
        const items = Array.from(dom.getElementsByTagName('text'));
        if (!items.length) return null;
        let out = '';
        for (const n of items) {
          const start = parseFloat(n.getAttribute('start') || '0');
          const m = String(Math.floor(start / 60)).padStart(2, '0');
          const s = String(Math.floor(start % 60)).padStart(2, '0');
          const txt = (n.textContent || '')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n/g, ' ').trim();
          if (txt) out += `[${m}:${s}] ${txt} `;
        }
        return out.trim();
      }

      function pickTrack(tracks) {
        if (!Array.isArray(tracks) || !tracks.length) return null;
        return tracks.find(t => t.languageCode?.startsWith('en')) || tracks[0];
      }

      const pr = window.ytInitialPlayerResponse || (document.getElementById('movie_player')?.getPlayerResponse?.() || null);
      const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      const track = pickTrack(tracks);
      let baseUrl = track?.baseUrl;
      if (!baseUrl) return null;
      baseUrl = baseUrl.replace(/\u0026/g, '&');

      const j = await tryJson3(baseUrl);
      if (j && j.length > 20) return j;
      const x = await tryXml(baseUrl);
      if (x && x.length > 20) return x;

      try {
        const list = await fetch(`https://video.google.com/timedtext?type=list&v=${encodeURIComponent(vid)}`).then(r => r.text());
        const langs = Array.from(list.matchAll(/lang_code=\"([^\"]+)\"/g)).map(m => m[1]);
        const pick = langs.find(l => l.startsWith('en')) || langs[0];
        if (pick) {
          const j2 = await fetch(`https://video.google.com/timedtext?v=${encodeURIComponent(vid)}&lang=${pick}&fmt=json3`).then(r => r.json());
          if (Array.isArray(j2?.events) && j2.events.length) return buildFromEvents(j2.events);
        }
      } catch (_) {}
      return null;
    }, videoId);

    await context.close();

    if (text && text.length > 20) return res.json({ success: true, transcript: text });
    return res.status(404).json({ success: false, error: 'Transcript unavailable' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.listen(PORT, () => console.log(`Transcript service listening on ${PORT}`));


