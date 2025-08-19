"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronRight,
  Edit3,
  Plus,
  Grid3X3,
  List,
  TimerIcon as Timeline,
  Search,
  Play,
  Trash2,
  Move,
  Eye,
  ExternalLink,
  Clock,
  Target,
  Flame,
  BookOpen,
  Brain,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SavedSummaryItem {
  id: string
  projectName: string
  videoId: string
  title: string
  channel?: string
  duration?: string
  createdAt: string
  keyInsights?: string[]
}

interface ProjectDetailPageProps {
  projectName: string
}

export function ProjectDetailPage({ projectName }: ProjectDetailPageProps) {
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("summaries")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("list")
  const [editingName, setEditingName] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [projectTitle, setProjectTitle] = useState(projectName)
  const [projectDescription, setProjectDescription] = useState(
    "Building a comprehensive understanding of machine learning fundamentals and applications",
  )

  const [items, setItems] = useState<SavedSummaryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [projectData, setProjectData] = useState({ emoji: '📁' })

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This will remove all summaries in this project.`)) {
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
        router.push('/projects')
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project')
    }
  }

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetch(`/api/projects?project=${encodeURIComponent(projectName)}`, { cache:'no-store' })
      .then(r=> r.json())
      .then(j=> { if (mounted) setItems(Array.isArray(j.items) ? j.items : []) })
      .finally(()=> { if (mounted) setLoading(false) })
    return ()=> { mounted = false }
  }, [projectName])

  // Use items as summaries
  const summaries = items.map(item => ({
    ...item,
    completed: false,
    thumbnail: item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : '/placeholder.svg',
    keyInsight: item.keyInsights?.[0] || '',
    dateAdded: new Date(item.createdAt).toLocaleDateString()
  }))


  const renderSummariesList = () => (
    <div className="space-y-3">
      {summaries.map((summary: any) => (
        <Card key={summary.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Checkbox checked={summary.completed} className="mt-1" />
              <Image
                src={summary.thumbnail || "/placeholder.svg"}
                alt={summary.title}
                width={80}
                height={60}
                className="rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate">{summary.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {summary.duration}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{summary.channel}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{summary.keyInsight}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{summary.dateAdded}</span>
                  {summary.reviewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {summary.reviewCount} reviews
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Move className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTimelineView = () => (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
      <div className="space-y-6">
        {summaries.map((summary: any, index: number) => (
          <div key={summary.id} className="relative flex items-start gap-6">
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-border">
              <Image
                src={summary.thumbnail || "/placeholder.svg"}
                alt={summary.title}
                width={40}
                height={30}
                className="rounded object-cover"
              />
            </div>
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{summary.title}</h3>
                  <span className="text-xs text-muted-foreground">{summary.dateAdded}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{summary.keyInsight}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={summary.completed ? "default" : "secondary"}>
                    {summary.completed ? "Completed" : "In Progress"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{summary.channel}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{projectTitle}</span>
          </div>

          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{projectData.emoji}</div>
              <div>
                {editingName ? (
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                    className="text-2xl font-bold mb-2"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-2xl font-bold mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => setEditingName(true)}
                  >
                    {projectTitle}
                  </h1>
                )}

                {editingDescription ? (
                  <Input
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    onBlur={() => setEditingDescription(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingDescription(false)}
                    className="text-gray-600"
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => setEditingDescription(true)}
                  >
                    {projectDescription}
                  </p>
                )}

                 <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                   <span>{items.length} summaries</span>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Videos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingName(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"></div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summaries">Summaries</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="summaries" className="mt-6">
                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "timeline" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("timeline")}
                    >
                      <Timeline className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search summaries..." className="pl-9 w-64" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                 {loading ? <div className="py-8 text-center text-muted-foreground">Loading…</div> : null}
                 {viewMode === "list" && !loading && (
                   <div className="space-y-4">
                     {items.map((summary) => (
                       <Card key={summary.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-white overflow-hidden">
                         <CardContent className="p-0">
                           <div className="flex">
                             {/* Thumbnail Section */}
                             <div className="relative w-48 h-32 flex-shrink-0">
                               <Image
                                 src={`https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg`}
                                 alt={summary.title}
                                 fill
                                 className="object-cover"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                               <Badge className="absolute bottom-2 left-2 bg-black/70 text-white border-0">
                                 {summary.duration || 'Video'}
                               </Badge>
                             </div>
                             
                             {/* Content Section */}
                             <div className="flex-1 p-5">
                               <div className="flex items-start justify-between">
                                 <div className="flex-1">
                                   <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                                     {summary.title}
                                   </h3>
                                   <div className="flex items-center gap-2 mb-3">
                                     <p className="text-sm text-gray-500">{summary.channel || 'YouTube'}</p>
                                     <span className="text-gray-300">•</span>
                                     <p className="text-sm text-gray-500">
                                       {new Date(summary.createdAt).toLocaleDateString('en-US', { 
                                         month: 'short', 
                                         day: 'numeric', 
                                         year: 'numeric' 
                                       })}
                                     </p>
                                   </div>
                                   
                                   {/* Main Takeaway */}
                                   {summary.mainTakeaway && (
                                     <div className="bg-blue-50 border-l-3 border-blue-500 pl-3 py-2 mb-2 rounded-r">
                                       <p className="text-sm text-gray-700 font-medium">
                                         {summary.mainTakeaway}
                                       </p>
                                     </div>
                                   )}
                                   
                                   {/* Key Insights Preview */}
                                   {summary.keyInsights && summary.keyInsights.length > 0 && (
                                     <div className="flex flex-wrap gap-2 mt-3">
                                       {summary.keyInsights.slice(0, 2).map((insight, idx) => (
                                         <Badge key={idx} variant="secondary" className="text-xs">
                                           {insight.slice(0, 40)}...
                                         </Badge>
                                       ))}
                                       {summary.keyInsights.length > 2 && (
                                         <Badge variant="outline" className="text-xs">
                                           +{summary.keyInsights.length - 2} more
                                         </Badge>
                                       )}
                                     </div>
                                   )}
                                 </div>
                                 
                                 {/* Action Buttons */}
                                 <div className="flex gap-2 ml-4">
                                   <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                     <Eye className="h-4 w-4" />
                                   </Button>
                                   <Button variant="ghost" size="sm">
                                     <Play className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 )}
                 {viewMode === "timeline" && !loading && (
                   <div className="relative">
                     <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                     <div className="space-y-8">
                       {items.map((summary, index) => (
                         <div key={summary.id} className="relative flex items-start gap-6">
                           {/* Timeline Node */}
                           <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-blue-500 shadow-lg overflow-hidden">
                             <Image
                               src={`https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg`}
                               alt={summary.title}
                               fill
                               className="object-cover"
                             />
                           </div>
                           
                           {/* Content Card */}
                           <Card className="flex-1 border-0 shadow-md hover:shadow-xl transition-shadow">
                             <CardContent className="p-5">
                               <div className="flex items-start justify-between mb-3">
                                 <div className="flex-1">
                                   <h3 className="font-semibold text-gray-900 text-base mb-1">
                                     {summary.title}
                                   </h3>
                                   <div className="flex items-center gap-3 text-sm text-gray-500">
                                     <Badge variant="outline" className="text-xs">
                                       {summary.channel || 'YouTube'}
                                     </Badge>
                                     <span>
                                       {new Date(summary.createdAt).toLocaleDateString('en-US', {
                                         month: 'long',
                                         day: 'numeric',
                                         year: 'numeric'
                                       })}
                                     </span>
                                   </div>
                                 </div>
                                 <div className="text-2xl font-bold text-blue-500/20">
                                   #{items.length - index}
                                 </div>
                               </div>
                               
                               {summary.mainTakeaway && (
                                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3">
                                   <p className="text-sm text-gray-700 font-medium">
                                     🎯 {summary.mainTakeaway}
                                   </p>
                                 </div>
                               )}
                               
                               {summary.keyInsights && summary.keyInsights.length > 0 && (
                                 <div className="space-y-1">
                                   {summary.keyInsights.slice(0, 2).map((insight, idx) => (
                                     <p key={idx} className="text-xs text-gray-600 flex items-start">
                                       <span className="text-blue-500 mr-2">•</span>
                                       <span className="line-clamp-1">{insight}</span>
                                     </p>
                                   ))}
                                 </div>
                               )}
                               
                               <div className="flex gap-2 mt-4">
                                 <Button variant="ghost" size="sm" className="text-blue-600">
                                   <Eye className="h-3 w-3 mr-1" />
                                   View
                                 </Button>
                                 <Button variant="ghost" size="sm">
                                   <Play className="h-3 w-3 mr-1" />
                                   Watch
                                 </Button>
                               </div>
                             </CardContent>
                           </Card>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {items.map((summary) => (
                      <Card key={summary.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-white overflow-hidden group">
                        <div className="relative h-40">
                          <Image
                            src={`https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg`}
                            alt={summary.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-semibold text-white text-sm line-clamp-2">
                              {summary.title}
                            </h3>
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" className="bg-white/90">
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                            <span>{summary.channel || 'YouTube'}</span>
                            <span>•</span>
                            <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                          </div>
                          {summary.mainTakeaway && (
                            <p className="text-sm text-gray-700 font-medium line-clamp-2 mb-2">
                              {summary.mainTakeaway}
                            </p>
                          )}
                          {summary.keyInsights && summary.keyInsights[0] && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              💡 {summary.keyInsights[0]}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Insights Coming Soon</h3>
                      <p className="text-muted-foreground">
                        We're working on analyzing your summaries to provide personalized insights
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start taking notes on your summaries to build your knowledge base
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You can edit the project name and description using the Edit button above.
                      </p>
                    </CardContent>
                  </Card>


                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={handleDeleteProject}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Videos</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                {items.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Last Added</span>
                    <span className="font-medium">
                      {new Date(items[0].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="lg">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
