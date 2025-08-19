import { NextRequest, NextResponse } from 'next/server'

// Enhanced project and summary storage
export interface Project {
  id: string
  name: string
  description?: string
  emoji?: string
  createdAt: string
  updatedAt: string
  summaryCount: number
}

export interface SavedSummary {
  id: string
  projectId: string
  projectName: string
  videoId: string
  videoUrl: string
  videoTitle: string
  channelName?: string
  duration?: string
  summary: any // Full summary data from extension
  settings: {
    mode: string
    depth: string
    includeTimestamps: boolean
    generateQuiz: boolean
    includeTranscript: boolean
  }
  savedAt: string
  userEmail?: string
  userTier?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, x-user-tier',
  'Access-Control-Max-Age': '86400'
}

// In-memory storage (replace with database in production)
let projects: Project[] = [
  {
    id: 'default',
    name: 'My Library',
    description: 'Default project for all summaries',
    emoji: '📚',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summaryCount: 0
  }
]

let savedSummaries: SavedSummary[] = []

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const projectId = searchParams.get('projectId')
  const userEmail = request.headers.get('x-user-email')

  try {
    // Return projects list
    if (type === 'projects') {
      return NextResponse.json({ 
        success: true, 
        projects: projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      }, { headers: corsHeaders })
    }

    // Return summaries for a specific project
    if (projectId) {
      const projectSummaries = savedSummaries.filter(s => s.projectId === projectId)
      return NextResponse.json({ 
        success: true, 
        summaries: projectSummaries.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
      }, { headers: corsHeaders })
    }

    // Return all summaries for user
    let userSummaries = savedSummaries
    if (userEmail && userEmail !== 'guest') {
      userSummaries = savedSummaries.filter(s => s.userEmail === userEmail)
    }

    // Group summaries by project
    const summariesByProject = projects.map(project => ({
      ...project,
      summaries: userSummaries.filter(s => s.projectId === project.id),
      summaryCount: userSummaries.filter(s => s.projectId === project.id).length
    }))

    return NextResponse.json({ 
      success: true, 
      projects: summariesByProject,
      totalSummaries: userSummaries.length,
      recentSummaries: userSummaries.slice(0, 5).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    }, { headers: corsHeaders })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userEmail = request.headers.get('x-user-email') || 'guest'
    const userTier = request.headers.get('x-user-tier') || 'free'

    // Handle project creation
    if (body.action === 'create-project' || (body.name && !body.videoId)) {
      const newProject: Project = {
        id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: body.name,
        description: body.description || '',
        emoji: body.emoji || '📁',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summaryCount: 0
      }

      projects.push(newProject)

      return NextResponse.json({ 
        success: true, 
        project: newProject,
        message: 'Project created successfully'
      }, { headers: corsHeaders })
    }

    // Handle saving summary to project
    if (body.videoId && body.summary) {
      // Ensure project exists
      let projectId = body.projectId || 'default'
      let project = projects.find(p => p.id === projectId)
      
      if (!project) {
        // Create project if it doesn't exist
        project = projects.find(p => p.id === 'default')!
        projectId = 'default'
      }

      const newSummary: SavedSummary = {
        id: `summary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId,
        projectName: project.name,
        videoId: body.videoId,
        videoUrl: body.videoUrl || `https://www.youtube.com/watch?v=${body.videoId}`,
        videoTitle: body.videoTitle || 'Untitled Video',
        channelName: body.channelName,
        duration: body.duration,
        summary: body.summary,
        settings: body.settings || {
          mode: 'student',
          depth: 'standard',
          includeTimestamps: true,
          generateQuiz: false,
          includeTranscript: false
        },
        savedAt: body.savedAt || new Date().toISOString(),
        userEmail,
        userTier
      }

      savedSummaries.push(newSummary)

      // Update project summary count and updatedAt
      project.summaryCount++
      project.updatedAt = new Date().toISOString()

      return NextResponse.json({ 
        success: true, 
        summary: newSummary,
        message: `Summary saved to ${project.name}`
      }, { headers: corsHeaders })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400, headers: corsHeaders }
    )

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const summaryId = searchParams.get('summaryId')

    if (summaryId) {
      // Delete a specific summary
      savedSummaries = savedSummaries.filter(s => s.id !== summaryId)
      return NextResponse.json({ 
        success: true, 
        message: 'Summary deleted successfully'
      }, { headers: corsHeaders })
    }

    if (projectId && projectId !== 'default') {
      // Delete project and all its summaries
      projects = projects.filter(p => p.id !== projectId)
      savedSummaries = savedSummaries.filter(s => s.projectId !== projectId)
      return NextResponse.json({ 
        success: true, 
        message: 'Project deleted successfully'
      }, { headers: corsHeaders })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid delete request' },
      { status: 400, headers: corsHeaders }
    )

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete' },
      { status: 500, headers: corsHeaders }
    )
  }
}