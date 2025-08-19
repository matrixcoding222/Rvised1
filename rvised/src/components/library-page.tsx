"use client"

import { useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Search, Grid3X3, List, Plus, FolderOpen, Play, Edit3, Trash2, Chrome, PlayCircle, ArrowLeft, CheckSquare, Square, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface SavedSummaryItem {
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
  timestampedSections?: { time: string; description: string }[]
  quiz?: { question: string; answer: string }[]
  createdAt: string
}

// Fetch saved summaries from backend
async function fetchSavedSummaries(userEmail: string, project?: string): Promise<SavedSummaryItem[]> {
  const url = project ? `/api/projects?project=${encodeURIComponent(project)}` : '/api/projects'
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: {
      'x-user-email': userEmail
    }
  })
  if (!res.ok) return []
  const j = await res.json().catch(() => ({ items: [] }))
  return Array.isArray(j.items) ? j.items : []
}

export function LibraryPage() {
  const { user } = useUser()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedSort, setSelectedSort] = useState("Recent")
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  const [items, setItems] = useState<SavedSummaryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    
    const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
    let mounted = true
    setLoading(true)
    fetchSavedSummaries(userEmail, projectFilter)
      .then((list) => { if (mounted) setItems(list) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [projectFilter, user])

  const projects = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => { if (i.projectName) set.add(i.projectName) })
    return Array.from(set)
  }, [items])

  const filtered = useMemo(() => {
    let list = items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(i => (i.title || '').toLowerCase().includes(q) || (i.summary || '').toLowerCase().includes(q))
    }
    if (selectedSort === 'Recent') {
      list = [...list].sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
    } else if (selectedSort === 'Alphabetical') {
      list = [...list].sort((a,b)=> (a.title||'').localeCompare(b.title||''))
    }
    return list
  }, [items, searchQuery, selectedSort])

  const isEmpty = !loading && filtered.length === 0

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} summaries?`)) {
      return
    }
    
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress || 'developer@rvised.app'
      
      // Delete each selected item
      for (const summaryId of selectedItems) {
        await fetch('/api/projects', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail
          },
          body: JSON.stringify({ summaryId })
        })
      }
      
      // Refresh data
      const updatedItems = items.filter(item => !selectedItems.has(item.id))
      setItems(updatedItems)
      setSelectedItems(new Set())
      setIsSelecting(false)
    } catch (error) {
      console.error('Error deleting summaries:', error)
      alert('Failed to delete some summaries')
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === filtered.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filtered.map(item => item.id)))
    }
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const calculateExpiry = (createdAt: string, projectName?: string) => {
    if (projectName) return null // No expiry for items in projects
    
    const created = new Date(createdAt)
    const expiry = new Date(created)
    expiry.setDate(expiry.getDate() + 14) // 14 day expiry
    const today = new Date()
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysLeft > 0 ? daysLeft : 0
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button & Breadcrumb */}
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <span className="text-sm text-gray-500">/ Library</span>
          </div>

          {/* Title Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Knowledge Library</h1>
              <p className="mt-1 text-gray-600">
                {items.length} summaries from{" "}
                {items.reduce((acc, s) => acc + Number.parseInt(s.duration || "0"), 0)} hours of content
              </p>
            </div>

              <div className="flex items-center gap-3">
                {isSelecting ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedItems.size === filtered.length ? (
                        <><CheckSquare className="h-4 w-4 mr-2" /> Deselect All</>
                      ) : (
                        <><Square className="h-4 w-4 mr-2" /> Select All</>
                      )}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={selectedItems.size === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedItems.size})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsSelecting(false)
                        setSelectedItems(new Set())
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsSelecting(true)}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <a href="/extension" rel="noreferrer">Install Extension</a>
                    </Button>
                  </>
                )}

              <div className="flex rounded-lg border border-gray-200 p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filters */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search summaries, notes, or videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {["All", "This Week", "This Month"].map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className={selectedFilter === filter ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {filter}
                    </Button>
                  ))}

                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Projects
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                       <DropdownMenuItem onClick={() => setProjectFilter(undefined)}>All</DropdownMenuItem>
                       {projects.map((name) => (
                         <DropdownMenuItem key={name} onClick={() => setProjectFilter(name)}>{name}</DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort: {selectedSort}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedSort("Recent")}>Recent</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedSort("Most Viewed")}>Most Viewed</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedSort("Alphabetical")}>Alphabetical</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Content Grid/List */}
            {loading ? (
              <div className="py-16 text-center text-gray-500">Loading…</div>
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}
              >
                {filtered.map((summary) => {
                  const daysLeft = calculateExpiry(summary.createdAt, summary.projectName)
                  return (
                    <div key={summary.id} className="relative">
                      {isSelecting && (
                        <div className="absolute top-2 left-2 z-10">
                          <button
                            onClick={() => toggleSelectItem(summary.id)}
                            className="p-1 bg-white rounded-md shadow-md border border-gray-200 hover:bg-gray-50"
                          >
                            {selectedItems.has(summary.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}
                      {daysLeft !== null && daysLeft <= 7 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-semibold shadow-sm">
                            <AlertCircle className="h-3 w-3" />
                            {daysLeft === 0 ? 'Expires today' : `${daysLeft} days left`}
                          </div>
                        </div>
                      )}
                      <SummaryCard summary={summary} viewMode={viewMode} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <div className="space-y-6">
              {/* Expiry Notice */}
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 text-sm mb-1">Storage Policy</h4>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Unsaved summaries expire after <span className="font-semibold">14 days</span>. 
                        Add summaries to projects to keep them permanently.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total summaries</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours saved</span>
                      <span className="font-medium">{Math.round(items.reduce((acc, s) => acc + Number.parseInt(s.duration || "0"), 0) / 60)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">In projects</span>
                      <span className="font-medium">{items.filter(i => i.projectName).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiring soon</span>
                      <span className="font-medium text-amber-600">
                        {items.filter(i => {
                          if (i.projectName) return false
                          const created = new Date(i.createdAt)
                          const expiry = new Date(created)
                          expiry.setDate(expiry.getDate() + 14) // 14 day expiry
                          const today = new Date()
                          const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                          return daysLeft <= 7 && daysLeft > 0 // Show warning in last 7 days
                        }).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">Recent Projects</h3>
                  <div className="space-y-3">
                    {projects.slice(0, 4).map((project) => {
                      const count = items.filter(i => i.projectName === project).length
                      return (
                        <div key={project} className="flex items-center justify-between">
                          <span className="text-gray-600">{project}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      )
                    })}
                    {projects.length === 0 && (
                      <p className="text-sm text-gray-400">No projects yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ summary, viewMode }: { summary: SavedSummaryItem; viewMode: "grid" | "list" }) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  
  const handleDownload = () => {
    const content = `${summary.title || 'Video Summary'}
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
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(summary.title || 'summary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
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
        body: JSON.stringify({ summaryId: summary.id })
      })
      
      if (response.ok) {
        // Refresh the page
        window.location.reload()
      } else {
        alert('Failed to delete summary')
      }
    } catch (error) {
      console.error('Error deleting summary:', error)
      alert('Error deleting summary')
    }
  }

  if (viewMode === "list") {
    return (
      <Card
        className="transition-all duration-200 hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded">
              {summary.videoId ? (
            <Image src={`https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg`} alt={summary.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <PlayCircle className="h-8 w-8 text-gray-400" />
            </div>
          )}
            </div>
            <div className="flex-1">
           <h3 className="font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
           <p className="mt-1 text-sm text-gray-500">{summary.channel || ''}</p>
              {summary.keyInsights?.[0] && (
                <p className="mt-2 text-sm italic text-gray-600 line-clamp-1">{summary.keyInsights[0]}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                {summary.projectName && (
                  <Badge variant="outline" className="text-xs">
                    {summary.projectName}
                  </Badge>
                )}
              </div>
            </div>
            {isHovered && (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => window.open(summary.videoUrl || `https://youtube.com/watch?v=${summary.videoId}`, '_blank')}
                  title="Watch Video"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleDownload}
                  title="Download Summary"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleDelete}
                  title="Delete Summary"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="group transition-all duration-200 hover:scale-105 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {summary.videoId ? (
            <Image src={`https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg`} alt={summary.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
              <Button 
                size="sm" 
                className="bg-white/90 text-black hover:bg-white"
                onClick={() => window.open(summary.videoUrl || `https://youtube.com/watch?v=${summary.videoId}`, '_blank')}
                title="Watch Video"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-white/90 text-black hover:bg-white"
                onClick={handleDownload}
                title="Download Summary"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-red-500/90 text-white hover:bg-red-600"
                onClick={handleDelete}
                title="Delete Summary"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{summary.channel}</p>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
            {summary.projectName && (
              <Badge variant="outline" className="text-xs">
                {summary.projectName}
              </Badge>
            )}
          </div>

          {summary.keyInsights?.[0] && (
            <p className="mt-3 text-sm italic text-gray-600 line-clamp-1">{summary.keyInsights[0]}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">📚</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">Your library is empty</h3>
      <p className="mb-6 text-gray-600">Install the Chrome extension to start building your knowledge base</p>
      <div className="flex gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Chrome className="mr-2 h-4 w-4" />
          Install Extension
        </Button>
        <Button variant="outline">
          <PlayCircle className="mr-2 h-4 w-4" />
          Watch Tutorial
        </Button>
      </div>
    </div>
  )
}
