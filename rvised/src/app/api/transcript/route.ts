import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getSubtitles } = require('youtube-captions-scraper')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function tryFetchJson(url: string): Promise<any | null> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const resp = await fetch(url, { headers, cache: 'no-store' } as any)
      if (resp.status === 429 && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
      if (!resp.ok) return null
      return await resp.json().catch(() => null)
    } catch {
      if (attempt === maxRetries - 1) return null
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
    }
  }
  return null
}

async function tryFetchText(url: string): Promise<string | null> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const resp = await fetch(url, { headers, cache: 'no-store' } as any)
      if (resp.status === 429 && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
      if (!resp.ok) return null
      return await resp.text()
    } catch {
      if (attempt === maxRetries - 1) return null
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
    }
  }
  return null
}

function parseXmlToLines(xmlText: string): string[] {
  try {
    const texts = Array.from(xmlText.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map(m => m[1])
    if (!texts.length) return []
    return texts
      .map(t => t
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ')
        .trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function parseVttToLines(vtt: string): string[] {
  try {
    return vtt
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('WEBVTT') && !/^\d+$/.test(l) && !/^\d{2}:\d{2}:\d{2}\.\d{3}/.test(l))
  } catch {
    return []
  }
}

async function fetchTranscriptDirect(videoId: string): Promise<string[]> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en`
    const html = await tryFetchText(watchUrl)
    if (!html) return []
    const match = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/)
    if (!match) return []
    const captionTracksRaw = match[1]
    const captionTracks = JSON.parse(captionTracksRaw)
    const englishTrack = captionTracks.find((track: any) => track.languageCode && track.languageCode.startsWith('en')) || captionTracks[0]
    if (!englishTrack || !englishTrack.baseUrl) return []
    let trackUrl: string = englishTrack.baseUrl
    trackUrl = trackUrl.replace(/\\u0026/g, '&')
    // Try JSON3
    {
      const jsonUrl = trackUrl.includes('fmt=') ? trackUrl : `${trackUrl}&fmt=json3`
      const json = await tryFetchJson(jsonUrl)
      if (json?.events?.length) {
        return json.events
          .filter((e:any)=>Array.isArray(e.segs))
          .flatMap((e:any)=> e.segs.map((s:any)=> (s.utf8||'').trim()))
          .filter((t:string)=> t.length)
      }
    }
    // Try XML
    {
      const xml = await tryFetchText(trackUrl)
      if (xml) {
        const lines = parseXmlToLines(xml)
        if (lines.length) return lines
      }
    }
    // Try VTT
    {
      const vtt = await tryFetchText(`${trackUrl}&fmt=vtt`)
      if (vtt) {
        const lines = parseVttToLines(vtt)
        if (lines.length) return lines
      }
    }
    return []
  } catch {
    return []
  }
}

async function fetchTranscriptTimedText(videoId: string, languageCodes: string[]): Promise<string[]> {
  const buildFromEvents = (events: any[]): string[] => {
    return events
      .filter((e: any) => Array.isArray(e.segs))
      .flatMap((e: any) => e.segs.map((s: any) => (s.utf8 || '').trim()))
      .filter((t: string) => t.length)
  }

  const tryJsonUrl = async (url: string): Promise<string[]> => {
    try {
      const j = await fetch(url).then(r => r.ok ? r.json() : null)
      if (j?.events?.length) return buildFromEvents(j.events)
    } catch {}
    return []
  }

  const buildAndReturn = (j: any): string[] => {
    if (j?.events?.length) return buildFromEvents(j.events)
    return []
  }

  const googleBase = (lang?: string) => `https://video.google.com/timedtext?v=${encodeURIComponent(videoId)}${lang ? `&lang=${encodeURIComponent(lang)}` : ''}`
  const youtubeBase = (lang?: string) => `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}${lang ? `&lang=${encodeURIComponent(lang)}` : ''}`

  // Try explicit languages first on both endpoints
  for (const lang of languageCodes) {
    const candidates = [
      `${googleBase(lang)}&fmt=json3`,
      `${googleBase(lang)}&fmt=json3&kind=asr`,
      `${youtubeBase(lang)}&fmt=json3`,
      `${youtubeBase(lang)}&fmt=json3&kind=asr`
    ]
    for (const url of candidates) {
      const j = await tryFetchJson(url)
      const lines = buildAndReturn(j)
      if (lines.length) return lines
    }
  }

  // Last resort: language-agnostic ASR
  {
    const candidates = [
      `${googleBase()}&fmt=json3&kind=asr&caps=asr`,
      `${youtubeBase()}&fmt=json3&kind=asr&caps=asr`
    ]
    for (const url of candidates) {
      const j = await tryFetchJson(url)
      const lines = buildAndReturn(j)
      if (lines.length) return lines
    }
  }

  return []
}

async function fetchAllAvailableLanguages(videoId: string): Promise<string[]> {
  try {
    const xml = await fetch(`https://video.google.com/timedtext?type=list&v=${videoId}`).then(r => r.ok ? r.text() : '')
    const langs = Array.from(xml.matchAll(/lang_code=\"([^\"]+)\"/g)).map(m => m[1])
    // Prioritize English variants first
    const preferred = langs.filter(l => l.toLowerCase().startsWith('en'))
    const others = langs.filter(l => !l.toLowerCase().startsWith('en'))
    return [...preferred, ...others]
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: any
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const rawText = await request.text()
      body = JSON.parse(rawText || '{}')
    }
    const videoUrl: string = body.videoUrl || ''
    const explicitVideoId: string = body.videoId || ''
    const videoId = explicitVideoId || extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ success: false, error: 'Missing videoId/videoUrl' }, { status: 400, headers: corsHeaders })
    }

    // 0) Prefer external provider first if configured (Playwright or custom)
    try {
      const externalUrl = process.env.EXTERNAL_TRANSCRIPT_ENDPOINT
      if (externalUrl) {
        const resp = await fetch(externalUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.EXTERNAL_TRANSCRIPT_TOKEN ? `Bearer ${process.env.EXTERNAL_TRANSCRIPT_TOKEN}` : ''
          },
          body: JSON.stringify({ videoId })
        })
        if (resp.ok) {
          const j = await resp.json()
          const t: string | string[] | undefined = (j && (j.transcript || j.data?.transcript || j.text))
          if (Array.isArray(t) && t.length > 0) {
            return NextResponse.json({ success: true, transcript: t.join(' ') }, { headers: corsHeaders })
          }
          if (typeof t === 'string' && t.trim().length > 20) {
            return NextResponse.json({ success: true, transcript: t.trim() }, { headers: corsHeaders })
          }
        }
      }
    } catch { /* continue with internal strategies */ }

    // 1) Try library
    try {
      const lib = await YoutubeTranscript.fetchTranscript(videoId)
      if (Array.isArray(lib) && lib.length) {
        const text = lib.map(i => i.text).filter(Boolean).join(' ').trim()
        if (text.length > 20) return NextResponse.json({ success: true, transcript: text }, { headers: corsHeaders })
      }
    } catch {}

    // 1.5) Try youtube-captions-scraper (server-side HTML scrape of caption tracks)
    try {
      // Try a few English variants
      const langCandidates = ['en', 'en-US', 'en-GB']
      for (const lang of langCandidates) {
        try {
          const caps = await getSubtitles({ videoID: videoId, lang })
          if (Array.isArray(caps) && caps.length) {
            const text = caps.map((c: any) => (c.text || '').trim()).filter(Boolean).join(' ').trim()
            if (text.length > 20) {
              return NextResponse.json({ success: true, transcript: text }, { headers: corsHeaders })
            }
          }
        } catch { /* try next lang */ }
      }
    } catch { /* continue */ }

    // 2) Try captionTracks direct
    const direct = await fetchTranscriptDirect(videoId)
    if (direct.length > 20) {
      return NextResponse.json({ success: true, transcript: direct.join(' ') }, { headers: corsHeaders })
    }

    // 3) Try timedtext JSON3 across all available language codes (preferring English)
    let langs = ['en', 'en-GB', 'en-US', 'en-AU']
    const allLangs = await fetchAllAvailableLanguages(videoId)
    if (allLangs.length) langs = Array.from(new Set([...langs, ...allLangs]))
    const timed = await fetchTranscriptTimedText(videoId, langs)
    if (timed.length > 20) {
      return NextResponse.json({ success: true, transcript: timed.join(' ') }, { headers: corsHeaders })
    }

    // 4) Optional external provider fallback (configurable) — second attempt
    // Supports two modes:
    // A) Generic external endpoint expecting POST { videoId } → { transcript }
    //    Configure via EXTERNAL_TRANSCRIPT_ENDPOINT and optional EXTERNAL_TRANSCRIPT_TOKEN
    // B) RapidAPI-style endpoint configured via RAPIDAPI_YT_TRANSCRIPT_URL and RAPIDAPI_KEY/RAPIDAPI_HOST
    try {
      const externalUrl = process.env.EXTERNAL_TRANSCRIPT_ENDPOINT
      if (externalUrl) {
        const resp = await fetch(externalUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.EXTERNAL_TRANSCRIPT_TOKEN ? `Bearer ${process.env.EXTERNAL_TRANSCRIPT_TOKEN}` : ''
          },
          body: JSON.stringify({ videoId })
        })
        if (resp.ok) {
          const j = await resp.json()
          const t: string | string[] | undefined = (j && (j.transcript || j.data?.transcript || j.text))
          if (Array.isArray(t) && t.length > 0) {
            return NextResponse.json({ success: true, transcript: t.join(' ') }, { headers: corsHeaders })
          }
          if (typeof t === 'string' && t.trim().length > 20) {
            return NextResponse.json({ success: true, transcript: t.trim() }, { headers: corsHeaders })
          }
        }
      }
    } catch { /* ignore and continue */ }

    try {
      const rapidUrl = process.env.RAPIDAPI_YT_TRANSCRIPT_URL
      const rapidKey = process.env.RAPIDAPI_KEY
      const rapidHost = process.env.RAPIDAPI_HOST
      if (rapidUrl && rapidKey && rapidHost) {
        const url = rapidUrl.includes('{videoId}') ? rapidUrl.replace('{videoId}', videoId) : `${rapidUrl}${rapidUrl.includes('?') ? '&' : '?'}videoId=${encodeURIComponent(videoId)}`
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidKey,
            'X-RapidAPI-Host': rapidHost
          }
        })
        if (resp.ok) {
          const j = await resp.json()
          // Try common shapes
          const arr: any[] | undefined = j?.transcript || j?.data?.transcript || j?.segments || j?.results
          const str: string | undefined = j?.text || j?.full || j?.transcriptText
          if (Array.isArray(arr) && arr.length) {
            const joined = arr.map((i: any) => (i.text || i.caption || i.utf8 || '')).filter(Boolean).join(' ').trim()
            if (joined.length > 20) return NextResponse.json({ success: true, transcript: joined }, { headers: corsHeaders })
          }
          if (typeof str === 'string' && str.trim().length > 20) {
            return NextResponse.json({ success: true, transcript: str.trim() }, { headers: corsHeaders })
          }
        }
      }
    } catch { /* ignore */ }

    return NextResponse.json({ success: false, error: 'Transcript unavailable' }, { status: 404, headers: corsHeaders })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Failed' }, { status: 500, headers: corsHeaders })
  }
}


