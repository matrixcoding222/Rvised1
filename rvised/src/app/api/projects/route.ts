import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for MVP. Not persistent across deploys/restarts.
type TimestampedSection = { time: string; description: string }
type QuizItem = { question: string; answer: string }

export interface SavedSummaryItem {
  id: string
  projectName: string
  videoId: string
  title: string
  channel?: string
  duration?: string
  videoUrl?: string
  mainTakeaway: string
  summary: string
  keyInsights?: string[]
  actionItems?: string[]
  timestampedSections?: TimestampedSection[]
  quiz?: QuizItem[]
  createdAt: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

let savedSummaries: SavedSummaryItem[] = []

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  // Optional filter by projectName via ?project=
  const { searchParams } = new URL(request.url)
  const projectFilter = searchParams.get('project')?.toLowerCase()
  let items = [...savedSummaries]
  if (projectFilter) {
    items = items.filter(i => (i.projectName || '').toLowerCase() === projectFilter)
  }
  // Return newest first
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return NextResponse.json({ success: true, items }, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: any
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const rawText = await request.text()
      const params = contentType.includes('application/x-www-form-urlencoded')
        ? new URLSearchParams(rawText).get('data') || ''
        : rawText
      body = JSON.parse(params)
    }

    const {
      projectName = 'My Library',
      videoUrl,
      data
    } = body || {}

    if (!data || !data.videoId || !data.title) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: missing summary data' },
        { status: 400, headers: corsHeaders }
      )
    }

    const item: SavedSummaryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectName,
      videoId: data.videoId,
      title: data.title || data.videoTitle || 'Untitled',
      channel: data.channel,
      duration: data.duration,
      videoUrl: videoUrl,
      mainTakeaway: data.mainTakeaway || '',
      summary: data.summary || '',
      keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      timestampedSections: Array.isArray(data.timestampedSections) ? data.timestampedSections : undefined,
      quiz: Array.isArray(data.quiz) ? data.quiz : undefined,
      createdAt: new Date().toISOString()
    }

    savedSummaries.push(item)

    return NextResponse.json({ success: true, item }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save item' },
      { status: 500, headers: corsHeaders }
    )
  }
}


