"use client"

import { useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, MoreHorizontal, Edit, Trash2, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const projectColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

const projectEmojis = ["🎯", "🚀", "💡", "📚", "🧠", "💻", "🎨", "🔬"]

const templateProjects = [
  { name: "Web Development Basics", emoji: "🔥", description: "HTML, CSS, JavaScript fundamentals" },
  { name: "Data Science Journey", emoji: "📊", description: "Python, pandas, machine learning" },
  { name: "UI/UX Fundamentals", emoji: "🎨", description: "Design principles and user research" },
  { name: "Business & Marketing", emoji: "💼", description: "Strategy, growth, and analytics" },
]

type SavedSummaryItem = {
  id: string
  projectName: string
  videoId: string
  title: string
  channel?: string
  createdAt: string
}

export function ProjectsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [items, setItems] = useState<SavedSummaryItem[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterBy, setFilterBy] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: projectColors[0],
    emoji: projectEmojis[0],
    goal: "",
  })

  const fetchAll = async (): Promise<SavedSummaryItem[]> => {
    const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
    const res = await fetch('/api/projects', { 
      cache: 'no-store',
      headers: {
        'x-user-email': userEmail
      }
    })
    if (!res.ok) return []
    const j = await res.json().catch(()=>({items:[]}))
    return Array.isArray(j.items) ? j.items : []
  }

  useEffect(() => {
    if (!user) return
    
    let mounted = true
    fetchAll().then((list) => {
      if (!mounted) return
      setItems(list)
    })
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    // Group by projectName
    const grouped = new Map<string, SavedSummaryItem[]>()
    items.forEach((i) => {
      const key = i.projectName || 'My Library'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(i)
    })
    const result = Array.from(grouped.entries()).map(([name, arr]) => ({
      id: name,
      name,
      emoji: '📁',
      color: '#3B82F6',
      summaryCount: arr.length,
      lastActive: arr[0]?.createdAt ? new Date(arr[0].createdAt).toDateString() : '—',
      progress: { completed: 0, total: 0 },
      description: '',
      thumbnails: arr.slice(0,3).map(i => `https://i.ytimg.com/vi/${i.videoId}/hqdefault.jpg`),
    }))
    setProjects(result)
  }, [items])

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('Please enter a project name')
      return
    }
    
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify({
          action: 'create',
          name: newProject.name,
          description: newProject.description,
          emoji: newProject.emoji
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setProjects([...projects, data.project])
        setIsCreateModalOpen(false)
        setNewProject({
          name: '',
          description: '',
          color: projectColors[0],
          emoji: projectEmojis[0],
          goal: ''
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create project' }))
        if (response.status === 409) {
          alert(errorData.error || 'A project with this name already exists')
        } else {
          alert(errorData.error || 'Failed to create project')
        }
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project')
    }
  }
  
  const handleCreateFromTemplate = (template: any) => {
    setNewProject({
      name: template.name,
      description: template.description,
      emoji: template.emoji,
      color: projectColors[Math.floor(Math.random() * projectColors.length)],
      goal: '',
    })
    setIsCreateModalOpen(true)
  }

  const handleDeleteProject = async (projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will remove all summaries in this project.`)) {
      return
    }
    
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
      const response = await fetch('/api/projects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify({
          projectName: projectName
        })
      })
      
      if (response.ok) {
        // Refresh the projects list
        const updatedProjects = projects.filter(p => p.name !== projectName)
        setProjects(updatedProjects)
        
        // Refresh all data
        const list = await fetchAll()
        setItems(list)
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="group gap-2 hover:gap-3 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  Back to Dashboard
                </Button>
                <span className="text-sm text-gray-500">/ Projects</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Projects</h1>
              <p className="text-gray-600">Organize your knowledge into focused paths</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="e.g., React Mastery"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="What will you learn in this project?"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-2 mt-2">
                      {projectColors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${newProject.color === color ? "border-gray-400" : "border-gray-200"}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewProject({ ...newProject, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {projectEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          className={`w-10 h-10 rounded-lg border-2 text-lg ${newProject.emoji === emoji ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                          onClick={() => setNewProject({ ...newProject, emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="goal">Learning Goal (optional)</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={newProject.goal}
                      onChange={(e) => setNewProject({ ...newProject, goal: e.target.value })}
                      placeholder="How many videos do you want to complete?"
                      max="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Each project can contain up to 30 videos</p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions Bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="recent">Recent</option>
            <option value="az">A-Z</option>
            <option value="active">Most Active</option>
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Main Content */}
        {filteredProjects.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create your first learning project</h3>
            <p className="text-gray-600 mb-6">Projects help you organize summaries by topic or goal</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                Create Project
              </Button>
              <Button variant="outline">Browse Templates</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                onClick={(e) => {
                  // Prevent navigation when clicking on dropdown menu
                  if (!(e.target as HTMLElement).closest('.dropdown-menu-trigger')) {
                    router.push(`/projects/${encodeURIComponent(project.name)}`)
                  }
                }}
              >
                <div className="h-1 rounded-t-lg" style={{ backgroundColor: project.color }} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{project.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{project.summaryCount} summaries</span>
                          <span>Active {project.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity dropdown-menu-trigger"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.name)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {project.description && <p className="text-sm text-gray-600 mb-4">{project.description}</p>}

                  {project.progress && project.progress.total > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {project.progress.completed} of {project.progress.total} videos completed
                        </span>
                        <span>{Math.round((project.progress.completed / project.progress.total) * 100)}%</span>
                      </div>
                      <Progress value={(project.progress.completed / project.progress.total) * 100} className="h-2" />
                    </div>
                  )}

                  {project.thumbnails.length > 0 && (
                    <div className="flex gap-2">
                      {project.thumbnails.map((thumb, idx) => (
                        <img
                          key={idx}
                          src={thumb || "/placeholder.svg"}
                          alt=""
                          className="w-12 h-8 rounded object-cover border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Templates Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Start with a template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templateProjects.map((template, idx) => (
              <Card 
                key={idx} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{template.emoji}</div>
                  <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
