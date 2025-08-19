"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, MoreHorizontal, Edit, Archive, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const projectColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

const projectEmojis = ["📘", "💻", "🚀", "📊", "🎨", "💼", "🔬", "🎯", "📈", "🌟"]

const templateProjects = [
  { name: "Web Development Basics", emoji: "🔥", description: "HTML, CSS, JavaScript fundamentals" },
  { name: "Data Science Journey", emoji: "📊", description: "Python, pandas, machine learning" },
  { name: "UI/UX Fundamentals", emoji: "🎨", description: "Design principles and user research" },
  { name: "Business & Marketing", emoji: "💼", description: "Strategy, growth, and analytics" },
]

const sampleProjects = [
  {
    id: 1,
    name: "React Mastery",
    emoji: "⚛️",
    color: "#3B82F6",
    summaryCount: 24,
    lastActive: "2 days ago",
    progress: { completed: 12, total: 30 },
    description: "Deep dive into React hooks, state management, and performance optimization",
    thumbnails: [
      "/placeholder.svg?height=40&width=60",
      "/placeholder.svg?height=40&width=60",
      "/placeholder.svg?height=40&width=60",
    ],
  },
  {
    id: 2,
    name: "TypeScript Deep Dive",
    emoji: "📘",
    color: "#10B981",
    summaryCount: 18,
    lastActive: "1 week ago",
    progress: { completed: 18, total: 25 },
    description: "Advanced TypeScript patterns and best practices",
    thumbnails: [
      "/placeholder.svg?height=40&width=60",
      "/placeholder.svg?height=40&width=60",
      "/placeholder.svg?height=40&width=60",
    ],
  },
  {
    id: 3,
    name: "Machine Learning Basics",
    emoji: "🤖",
    color: "#8B5CF6",
    summaryCount: 31,
    lastActive: "3 days ago",
    progress: { completed: 20, total: 40 },
    description: "Introduction to ML algorithms and Python libraries",
    thumbnails: [
      "/placeholder.svg?height=40&width=60",
      "/placeholder.svg?height=40&width=60",
      "/placeholder.svg?height=40&width=60",
    ],
  },
]

export function ProjectsPage() {
  const [projects, setProjects] = useState(sampleProjects)
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

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateProject = () => {
    const project = {
      id: Date.now(),
      name: newProject.name,
      emoji: newProject.emoji,
      color: newProject.color,
      summaryCount: 0,
      lastActive: "Just created",
      progress: { completed: 0, total: Number.parseInt(newProject.goal) || 0 },
      description: newProject.description,
      thumbnails: [],
    }
    setProjects([project, ...projects])
    setNewProject({ name: "", description: "", color: projectColors[0], emoji: projectEmojis[0], goal: "" })
    setIsCreateModalOpen(false)
  }

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-2">Dashboard &gt; Projects</div>
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
                    />
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
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="h-1 rounded-t-lg" style={{ backgroundColor: project.color }} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{project.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {project.description && <p className="text-sm text-gray-600 mb-4">{project.description}</p>}

                  {project.progress.total > 0 && (
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
              <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
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

      {/* Stats Sidebar - Optional for larger screens */}
      <div className="hidden xl:block fixed right-6 top-1/2 transform -translate-y-1/2 w-64">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                <div className="text-sm text-gray-500">Total Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">7</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Most Active</div>
                <div className="text-sm text-gray-500">React Mastery</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">68%</div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
