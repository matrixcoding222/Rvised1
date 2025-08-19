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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, x-user-tier',
}

// In-memory storage for testing (persists during dev server session)
const testProjects = new Map<string, any[]>()
const testSummaries = new Map<string, any[]>()

// Helper to get user's test projects
function getUserTestProjects(userEmail: string) {
  if (!testProjects.has(userEmail)) {
    // Initialize with empty array - no default projects
    testProjects.set(userEmail, [])
  }
  return testProjects.get(userEmail) || []
}

// Helper to get user's test summaries
function getUserTestSummaries(userEmail: string) {
  if (!testSummaries.has(userEmail)) {
    testSummaries.set(userEmail, [])
  }
  return testSummaries.get(userEmail) || []
}

// Helper to add a test project
function addTestProject(userEmail: string, project: any) {
  const projects = getUserTestProjects(userEmail)
  // Check if project already exists
  const existing = projects.find(p => p.name === project.name)
  if (existing) {
    return existing
  }
  projects.push(project)
  testProjects.set(userEmail, projects)
  return project
}

// Helper to add a test summary
function addTestSummary(userEmail: string, summary: any) {
  const summaries = getUserTestSummaries(userEmail)
  summaries.push(summary)
  testSummaries.set(userEmail, summaries)
  return summary
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/projects - Fetch user's projects
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    console.log(`📊 GET /api/projects - User email: ${userEmail}`)
    
    // For development/testing: Return mock projects if Supabase fails
    try {
      // Try to get from Supabase
      const { user, error: userError } = await getOrCreateUser(userEmail)
      if (!userError && user) {
        const { projects, error } = await getUserProjects(user.id)
        if (!error && projects && projects.length > 0) {
          console.log(`✅ Returning ${projects.length} Supabase projects for ${userEmail}`)
          return NextResponse.json({ projects }, { headers: corsHeaders })
        }
        console.log(`📌 Supabase returned empty projects, falling back to in-memory`)
      }
    } catch (supabaseError) {
      console.log('Supabase not configured, using mock data')
    }
    
    // Fallback: Return test projects from in-memory storage
    const userProjects = getUserTestProjects(userEmail)
    const userSummaries = getUserTestSummaries(userEmail)
    console.log(`📚 Returning ${userProjects.length} in-memory projects and ${userSummaries.length} summaries for ${userEmail}`)
    
    // Also log all stored users for debugging
    console.log(`📂 All stored users: ${Array.from(testProjects.keys()).join(', ')}`)
    
    return NextResponse.json({ 
      projects: userProjects,
      items: userSummaries 
    }, { headers: corsHeaders })
    
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
      console.log(`📁 Creating project "${body.name}" for ${userEmail}`);
      
      // Check for duplicate project name
      const existingProjects = getUserTestProjects(userEmail)
      const duplicateName = existingProjects.find(p => 
        p.name.toLowerCase() === body.name.toLowerCase()
      )
      
      if (duplicateName) {
        return NextResponse.json(
          { error: `A project named "${body.name}" already exists. Please choose a different name.` },
          { status: 409, headers: corsHeaders }
        )
      }
      
      // Try to create project with Supabase
      try {
        const { project, error } = await createProject(
          user.id,
          body.name,
          body.description,
          body.emoji
        )
        
        if (error) {
          throw error;
        }
        
        console.log(`✅ Created Supabase project:`, project);
        return NextResponse.json({ project }, { headers: corsHeaders })
      } catch (error) {
        console.log('Supabase not available, using in-memory project creation');
        // Fallback: Create project in memory for testing
        const newProject = {
          id: `project-${Date.now()}`,
          name: body.name,
          description: body.description,
          emoji: body.emoji || '📁',
          created_at: new Date().toISOString(),
          user_id: userEmail,
          summary_count: 0
        };
        
        // Save to in-memory storage
        const savedProject = addTestProject(userEmail, newProject);
        console.log(`✅ Created test project "${newProject.name}" for ${userEmail}`);
        console.log(`📊 Total projects for ${userEmail}: ${getUserTestProjects(userEmail).length}`);
        
        return NextResponse.json({ project: savedProject }, { headers: corsHeaders })
      }
      
    } else if (body.action === 'save' && body.projectId) {
      // Check for duplicate video in the same project
      const existingSummaries = getUserTestSummaries(userEmail)
      const duplicate = existingSummaries.find(s => 
        s.videoId === body.videoId && 
        s.projectId === body.projectId
      )
      
      if (duplicate) {
        return NextResponse.json(
          { error: 'This video has already been saved to this project' },
          { status: 409, headers: corsHeaders }
        )
      }
      
      // Try to save summary with Supabase
      try {
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
          throw error;
        }
        
        return NextResponse.json({ 
          success: true, 
          summary 
        }, { headers: corsHeaders })
      } catch (error) {
        console.log('Supabase not available, using in-memory summary save');
        // Fallback: Save summary in memory for testing
        const mockSummary = {
          id: `summary-${Date.now()}`,
          projectId: body.projectId,
          projectName: body.projectName || 'My Library',
          videoId: body.videoId || '',
          videoUrl: body.videoUrl,
          title: body.videoTitle,
          videoTitle: body.videoTitle,
          channel: body.channelName,
          channelName: body.channelName,
          summaryData: body.summaryData,
          summary: body.summaryData?.summary || '',
          mainTakeaway: body.summaryData?.mainTakeaway || '',
          keyInsights: body.summaryData?.keyInsights || [],
          actionItems: body.summaryData?.actionItems || [],
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        // Add to summaries storage
        addTestSummary(userEmail, mockSummary);
        
        console.log(`✅ Mock saved summary "${body.videoTitle}" to project ${body.projectId} for ${userEmail}`);
        
        return NextResponse.json({ 
          success: true, 
          summary: mockSummary 
        }, { headers: corsHeaders })
      }
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

// DELETE /api/projects - Delete a project or summary
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'guest@rvised.app'
    
    // Try to get the body for summary/project deletion
    let body: any = {}
    try {
      body = await request.json()
    } catch (e) {
      // No body, check query params for backward compatibility
      const { searchParams } = new URL(request.url)
      const projectId = searchParams.get('id')
      if (projectId) {
        body = { projectId }
      }
    }
    
    // Handle summary deletion
    if (body.summaryId) {
      // For now, we'll just remove from in-memory storage
      const summaries = getUserTestSummaries(userEmail)
      const index = summaries.findIndex((s: any) => s.id === body.summaryId)
      if (index !== -1) {
        summaries.splice(index, 1)
        testSummaries.set(userEmail, summaries)
        console.log(`✅ Deleted summary ${body.summaryId} for ${userEmail}`)
      }
      
      return NextResponse.json({ success: true }, { headers: corsHeaders })
    }
    
    // Handle project deletion by name
    if (body.projectName) {
      const projects = getUserTestProjects(userEmail)
      const index = projects.findIndex((p: any) => p.name === body.projectName)
      if (index !== -1) {
        const projectToDelete = projects[index]
        projects.splice(index, 1)
        testProjects.set(userEmail, projects)
        
        // Also remove all summaries in this project
        const summaries = getUserTestSummaries(userEmail)
        const filteredSummaries = summaries.filter((s: any) => s.projectName !== body.projectName)
        testSummaries.set(userEmail, filteredSummaries)
        
        console.log(`✅ Deleted project "${body.projectName}" and its summaries for ${userEmail}`)
      }
      
      return NextResponse.json({ success: true }, { headers: corsHeaders })
    }
    
    // Handle project deletion by ID (backward compatibility)
    if (body.projectId) {
      // Get user
      const { user, error: userError } = await getOrCreateUser(userEmail)
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Failed to get user' },
          { status: 500, headers: corsHeaders }
        )
      }
      
      // Delete project
      const { error } = await deleteProject(body.projectId, user.id)
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete project' },
          { status: 500, headers: corsHeaders }
        )
      }
      
      return NextResponse.json({ success: true }, { headers: corsHeaders })
    }
    
    return NextResponse.json(
      { error: 'No deletion target specified' },
      { status: 400, headers: corsHeaders }
    )
    
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}