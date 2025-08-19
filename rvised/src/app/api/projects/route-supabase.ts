import { NextRequest, NextResponse } from 'next/server'
import { 
  getOrCreateUser, 
  getUserProjects, 
  createProject, 
  deleteProject,
  saveSummary 
} from '@/lib/supabase/helpers'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/projects - Fetch user's projects
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    
    // Get or create user
    const { user, error: userError } = await getOrCreateUser(userEmail)
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500, headers: corsHeaders }
      )
    }
    
    // Get user's projects
    const { projects, error } = await getUserProjects(user.id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json({ projects }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/projects - Create project or save summary to project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    
    // Get or create user
    const { user, error: userError } = await getOrCreateUser(userEmail)
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500, headers: corsHeaders }
      )
    }
    
    // Handle different actions
    if (body.action === 'create') {
      // Create new project
      const { project, error } = await createProject(
        user.id,
        body.name,
        body.description,
        body.emoji
      )
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to create project' },
          { status: 500, headers: corsHeaders }
        )
      }
      
      return NextResponse.json({ project }, { headers: corsHeaders })
      
    } else if (body.action === 'save' && body.projectId) {
      // Save summary to project
      const { summary, error } = await saveSummary(
        user.id,
        body.videoUrl || '',
        body.videoTitle || 'Untitled Video',
        body.summaryData || {},
        body.learningMode || 'student',
        body.summaryDepth || 'standard',
        body.projectId,
        body.channelName,
        body.videoLength
      )
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to save summary' },
          { status: 500, headers: corsHeaders }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        summary 
      }, { headers: corsHeaders })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400, headers: corsHeaders }
    )
    
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// DELETE /api/projects - Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Get user
    const { user, error: userError } = await getOrCreateUser(userEmail)
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500, headers: corsHeaders }
      )
    }
    
    // Delete project
    const { error } = await deleteProject(projectId, user.id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json({ success: true }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}