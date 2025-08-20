"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  Play,
  BookOpen,
  Clock,
  Flame,
  Settings,
  ArrowRight,
  FolderOpen,
  BarChart3,
  Youtube,
  Zap,
  Award,
  ChevronRight,
  FileText,
  Sparkles,
  Glasses,
  Video,
  Copy,
  Download,
  Trash2,
} from "lucide-react"
import Image from "next/image"

const projectColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]
const projectEmojis = ["🎯", "📚", "🚀", "💡", "🔥", "⭐", "🎨", "🏆", "💪", "🧠", "📈", "🎓"]

export function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [recentSummaries, setRecentSummaries] = useState<any[]>([])
  const [activeProjects, setActiveProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSummary, setSelectedSummary] = useState<any>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [hasExtension, setHasExtension] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    emoji: '🎯',
    color: '#3B82F6',
    goal: ''
  })
  const [userStats, setUserStats] = useState({
    name: "User",
    totalSummaries: 0,
    summariesThisWeek: 0,
    timeSaved: 0,
    weeklyAverage: 0,
    streak: 0,
    percentile: 100,
    videosThisMonth: 0,
  })

  useEffect(() => {
    // Check if extension is installed
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage('idbbobpnmajkmgkpimbbccfbmlnpgnoj', { action: 'ping' }, (response) => {
          if (chrome.runtime.lastError) {
            setHasExtension(false)
          } else {
            setHasExtension(true)
          }
        })
      } catch (e) {
        setHasExtension(false)
      }
    }
    
    // Update user stats with actual user name
    if (user) {
      setUserStats(prev => ({
        ...prev,
        name: user.fullName || user.firstName || "User"
      }))
    }
    
    // Load real data from API
    loadDashboardData()
    
    // Check if opened from extension and communicate auth status
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('extension') === 'true' || urlParams.get('already_auth') === 'true') {
      // Try to communicate with the extension
      try {
        // Save actual user auth info and notify extension
        const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
        const testAuth = {
          userEmail: userEmail,
          authToken: 'auth-token-' + Date.now(),
          userTier: 'free', // You might want to get this from user metadata
          onboardingComplete: true
        }
        
        // Save to localStorage for the extension to read
        Object.keys(testAuth).forEach(key => {
          localStorage.setItem(`rvised_${key}`, testAuth[key as keyof typeof testAuth].toString())
        })
        
        console.log('✅ Extension auth info saved to localStorage')
        
        // Send message to extension (if available)
        if (window.chrome && window.chrome.runtime) {
          try {
            window.chrome.runtime.sendMessage(
              'idbbobpnmajkmgkpimbbccfbmlnpgnoj', // Your extension ID
              {
                action: 'authComplete',
                data: testAuth
              },
              (response) => {
                console.log('Extension response:', response)
              }
            )
          } catch (e) {
            console.log('Could not send to extension:', e)
          }
        }
        
        // Show success message and close
        const container = document.createElement('div')
        container.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          text-align: center;
          z-index: 99999;
        `
        container.innerHTML = `
          <h2 style="font-size: 24px; margin-bottom: 16px;">✅ Authentication Successful!</h2>
          <p style="color: #666; margin-bottom: 20px;">You can now close this tab and return to YouTube.</p>
          <button onclick="window.close()" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          ">Close Tab</button>
        `
        document.body.appendChild(container)
        
        // Auto close after 3 seconds
        if (urlParams.get('autoclose') === 'true') {
          setTimeout(() => {
            window.close()
          }, 3000)
        }
      } catch (error) {
        console.error('Error communicating with extension:', error)
      }
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      // Fetch real data from API
      const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
      const response = await fetch('/api/projects', {
        headers: {
          'x-user-email': userEmail
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.projects && data.projects.length > 0) {
          setActiveProjects(data.projects.slice(0, 4))
        }
        if (data.items && data.items.length > 0) {
          setRecentSummaries(data.items.slice(0, 5))
          
          // Calculate stats from actual data
          const totalSummaries = data.items.length
          
          // Calculate time saved from actual video lengths
          let totalMinutesSaved = 0
          data.items.forEach((item: any) => {
            // Get video length from summaryData if available
            const videoLength = item.summaryData?.videoLength || item.videoLength || 10 // Default 10 min if not available
            totalMinutesSaved += videoLength
          })
          const timeSaved = Math.round(totalMinutesSaved / 60) // Convert to hours
          
          // Calculate streak (days with summaries in a row)
          const today = new Date()
          const dates = data.items.map((item: any) => new Date(item.createdAt).toDateString())
          const uniqueDates = [...new Set(dates)]
          let streak = 0
          const currentDate = new Date()
          for (let i = 0; i < 30; i++) {
            const dateStr = currentDate.toDateString()
            if (uniqueDates.includes(dateStr)) {
              streak++
              currentDate.setDate(currentDate.getDate() - 1)
            } else {
              break
            }
          }
          
          setUserStats(prev => ({
            ...prev,
            totalSummaries,
            timeSaved,
            streak
          }))
        }
      }
      // Fetch user stats from actual data
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMotivationalMessage = () => {
    if (userStats.streak >= 7) {
      return {
        icon: "🔥",
        message: `Amazing! You're on a ${userStats.streak}-day streak. Keep the momentum going!`,
        action: "Summarize a video today",
      }
    }
    if (userStats.summariesThisWeek > 0) {
      return {
        icon: "🎯",
        message: `Great start! You've summarized ${userStats.summariesThisWeek} videos this week.`,
        action: "Keep learning",
      }
    }
    return {
      icon: "🚀",
      message: "Ready to start learning? Add your first video to get personalized summaries.",
      action: "Add your first video",
    }
  }

  const motivational = getMotivationalMessage()

  const handleDownloadSummary = (summary: any) => {
    // Create formatted text content
    const content = `${summary.title || summary.videoTitle || 'Video Summary'}
${summary.channel ? `Channel: ${summary.channel}` : ''}
Date: ${new Date(summary.createdAt).toLocaleDateString()}
${summary.videoId ? `Video URL: https://youtube.com/watch?v=${summary.videoId}` : ''}

===========================================
MAIN TAKEAWAY
===========================================
${summary.mainTakeaway || 'No main takeaway available'}

${summary.keyInsights && summary.keyInsights.length > 0 ? `
===========================================
KEY INSIGHTS
===========================================
${summary.keyInsights.map((insight: string, i: number) => `${i + 1}. ${insight}`).join('\n')}
` : ''}

===========================================
FULL SUMMARY
===========================================
${summary.summary || 'No summary available'}

${summary.actionItems && summary.actionItems.length > 0 ? `
===========================================
ACTION ITEMS
===========================================
${summary.actionItems.map((item: string, i: number) => `☐ ${item}`).join('\n')}
` : ''}

---
Generated by Rvised - Your YouTube Learning Companion
https://rvised.app
`
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(summary.title || summary.videoTitle || 'summary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteSummary = async (summaryId: string) => {
    if (!confirm('Are you sure you want to delete this summary?')) {
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
          summaryId: summaryId
        })
      })
      
      if (response.ok) {
        // Remove from recent summaries
        setRecentSummaries(prev => prev.filter(s => s.id !== summaryId))
        setShowSummaryModal(false)
        // Reload data
        loadDashboardData()
      } else {
        alert('Failed to delete summary')
      }
    } catch (error) {
      console.error('Error deleting summary:', error)
      alert('Error deleting summary')
    }
  }

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
        setActiveProjects([...activeProjects, data.project])
        setShowCreateProject(false)
        setNewProject({
          name: '',
          description: '',
          emoji: '🎯',
          color: '#3B82F6',
          goal: ''
        })
        // Reload dashboard data to refresh projects
        loadDashboardData()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/glasses.svg" alt="Rvised" width={32} height={32} />
            <span className="text-xl font-semibold">Rvised</span>
          </div>
          
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <Link href="/library" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <Video className="h-5 w-5" />
              <span>Library</span>
            </Link>
            <Link href="/projects" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <FolderOpen className="h-5 w-5" />
              <span>Projects</span>
            </Link>
            <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Unlock unlimited summaries and advanced features</p>
                <Link href="/dashboard/upgrade">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    if (hasExtension) {
                      window.open('https://youtube.com', '_blank')
                    } else {
                      window.open('https://chrome.google.com/webstore/detail/rvised/idbbobpnmajkmgkpimbbccfbmlnpgnoj', '_blank')
                    }
                  }}
                >
                  <Youtube className="h-4 w-4" />
                  {hasExtension ? 'Open YouTube' : 'Install Extension'}
                </Button>
                <Button 
                  size="sm" 
                  className="gap-2 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    if (hasExtension) {
                      window.open('https://youtube.com', '_blank')
                    } else {
                      alert('Please install the Rvised Chrome extension first to create summaries')
                      window.open('https://chrome.google.com/webstore/detail/rvised/idbbobpnmajkmgkpimbbccfbmlnpgnoj', '_blank')
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Summary
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-8 py-6">
          {/* Quick Stats Bar */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Streak</p>
                    <p className="text-lg font-semibold">{userStats.streak} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Videos</p>
                    <p className="text-lg font-semibold">{userStats.totalSummaries}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Time Saved</p>
                    <p className="text-lg font-semibold">{userStats.timeSaved}h</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{motivational.message}</p>
                <p className="text-xs text-gray-600 mt-1">Keep up the great work!</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Summaries - Main Column */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                    <Link href="/library">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                        View all
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentSummaries.length > 0 ? (
                    <div className="space-y-3">
                      {recentSummaries.map((summary) => (
                        <div key={summary.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 cursor-pointer"
                             onClick={() => {
                               setSelectedSummary(summary)
                               setShowSummaryModal(true)
                             }}>
                          <img
                            src={summary.videoId ? `https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg` : '/placeholder.svg'}
                            alt={summary.title || summary.videoTitle}
                            className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {summary.title || summary.videoTitle || 'Untitled Video'}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">{summary.channel || summary.channelName || 'YouTube'}</p>
                            {summary.mainTakeaway && (
                              <p className="text-xs text-gray-700 mt-2 line-clamp-2">
                                {summary.mainTakeaway}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            {summary.createdAt ? new Date(summary.createdAt).toLocaleDateString() : 'Today'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-600 mb-4">No summaries yet</p>
                      <p className="text-sm text-gray-500">
                        Install the Chrome extension and visit any YouTube video to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Active Projects */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                    <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input 
                              id="project-name" 
                              placeholder="e.g., Machine Learning Basics" 
                              value={newProject.name}
                              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-description">Description (optional)</Label>
                            <Textarea 
                              id="project-description" 
                              placeholder="Brief description of your learning goal..." 
                              value={newProject.description}
                              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
                                  className={`w-10 h-10 rounded-lg border-2 text-lg ${newProject.emoji === emoji ? "border-gray-400 bg-gray-50" : "border-gray-200"}`}
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
                            <p className="text-xs text-gray-600 mt-1">Each project can contain up to 30 videos</p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowCreateProject(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button onClick={handleCreateProject} className="flex-1 bg-primary hover:bg-primary/90">
                              Create
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {activeProjects.length > 0 ? (
                    <div className="space-y-2">
                      {activeProjects.map((project) => (
                        <Link key={project.id} href={`/projects/${encodeURIComponent(project.name)}`}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="text-xl">{project.emoji || '📁'}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">{project.name}</h4>
                              <p className="text-xs text-gray-600">{project.summaryCount || 0} videos</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-600 mb-3">No projects yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowCreateProject(true)}
                        className="w-full"
                      >
                        Create Your First Project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
            </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSummary?.title || selectedSummary?.videoTitle || 'Video Summary'}</DialogTitle>
            <DialogDescription>{selectedSummary?.channel || 'YouTube Channel'}</DialogDescription>
          </DialogHeader>
          {selectedSummary && (
            <div className="space-y-4 mt-4">
              {selectedSummary.videoId && (
                <div className="relative aspect-video">
                  <img
                    src={`https://i.ytimg.com/vi/${selectedSummary.videoId}/hqdefault.jpg`}
                    alt={selectedSummary.title}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              
              {selectedSummary.mainTakeaway && (
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                  <h3 className="font-semibold text-sm mb-1">Main Takeaway</h3>
                  <p className="text-sm text-gray-800">{selectedSummary.mainTakeaway}</p>
                </div>
              )}
              
              {selectedSummary.keyInsights && selectedSummary.keyInsights.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Key Insights</h3>
                  <ul className="space-y-2">
                    {selectedSummary.keyInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="text-gray-500 mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedSummary.summary && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Summary</h3>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{selectedSummary.summary}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                {selectedSummary.videoId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://youtube.com/watch?v=${selectedSummary.videoId}`, '_blank')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSummary.summary || selectedSummary.mainTakeaway || '')
                    alert('Copied to clipboard!')
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSummary(selectedSummary)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteSummary(selectedSummary.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}