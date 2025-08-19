import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'

const execFileAsync = promisify(execFile)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

function extractVideoIdOrUrl(input: string): string | null {
  if (!input) return null
  // If it's already a full URL or a short id, pass through.
  if (/^https?:\/\//i.test(input)) return input
  return `https://www.youtube.com/watch?v=${input}`
}

async function runYtx(urlOrId: string) {
  const target = extractVideoIdOrUrl(urlOrId)
  if (!target) throw new Error('Missing videoUrl/videoId')
  const id = crypto.randomUUID()
  const tmpFile = path.join(os.tmpdir(), `ytx-${id}.json`)
  const tmpSegs = path.join(os.tmpdir(), `ytx-${id}.segments.jsonl`)
  const args = [
    target,
    '--prefer-ytdlp',
    '--clean',
    '--extract-chapters',
    '--with-metadata',
    '--estimate-tokens',
    '-f', 'json',
    '-o', tmpFile,
    '--segments-out', tmpSegs
  ]
  const ytxBin = process.env.YTX_PATH || 'ytx'
  try {
    await execFileAsync(ytxBin, args, {
      timeout: 180000,
      maxBuffer: 20 * 1024 * 1024
    })
    const raw = await fs.readFile(tmpFile, 'utf8')
    const json = JSON.parse(raw)
    // Attach segments if jsonl exists and json.segments missing
    try {
      if (!Array.isArray((json as any).segments) && await fs.stat(tmpSegs).then(()=>true).catch(()=>false)) {
        const segRaw = await fs.readFile(tmpSegs, 'utf8')
        const segs = segRaw.split(/\r?\n/).filter(Boolean).map(line=>{ try { return JSON.parse(line) } catch { return null } }).filter(Boolean)
        ;(json as any).segments = segs
      }
    } catch {}
    return json
  } finally {
    try { await fs.unlink(tmpFile) } catch { /* ignore */ }
    try { await fs.unlink(tmpSegs) } catch { /* ignore */ }
  }
}

function coerceTranscript(json: any): { transcript: string, segments?: any[], metadata?: any } {
  if (!json || typeof json !== 'object') throw new Error('ytx returned empty result')
  let transcript = ''
  if (typeof json.transcript === 'string') transcript = json.transcript
  else if (typeof json.text === 'string') transcript = json.text
  else if (Array.isArray(json.segments)) transcript = json.segments.map((s:any)=> s.text || s.caption || s.utf8 || '').join(' ').trim()
  else if (Array.isArray(json.captions)) transcript = json.captions.map((c:any)=> c.text || c.caption || '').join(' ').trim()
  if (!transcript || transcript.trim().length < 20) throw new Error('Transcript too short')
  return { transcript: transcript.trim(), segments: json.segments, metadata: json.metadata || json.info }
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
    const input = explicitVideoId || videoUrl
    if (!input) {
      return NextResponse.json({ success: false, error: 'Missing videoId/videoUrl' }, { status: 400, headers: corsHeaders })
    }

    const data = await runYtx(input)
    const { transcript, segments, metadata } = coerceTranscript(data)
    return NextResponse.json({ success: true, transcript, segments, metadata }, { headers: corsHeaders })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: corsHeaders })
  }
}

