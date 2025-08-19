"use client"

import { useState } from "react"
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
  Share2,
  Plus,
  Grid3X3,
  List,
  TimerIcon as Timeline,
  Search,
  Play,
  Trash2,
  Move,
  Eye,
  Download,
  Archive,
  ExternalLink,
  Clock,
  Target,
  Flame,
  BookOpen,
  Brain,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Summary {
  id: string
  title: string
  channel: string
  thumbnail: string
  keyInsight: string
  dateAdded: string
  completed: boolean
  reviewCount: number
  duration: string
}

interface ProjectDetailPageProps {
  projectName: string
}

export function ProjectDetailPage({ projectName }: ProjectDetailPageProps) {
  const [activeTab, setActiveTab] = useState("summaries")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("list")
  const [editingName, setEditingName] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [projectTitle, setProjectTitle] = useState(projectName)
  const [projectDescription, setProjectDescription] = useState(
    "Building a comprehensive understanding of machine learning fundamentals and applications",
  )

  // Mock data
  const projectData = {
    emoji: "🤖",
    color: "#3B82F6",
    totalSummaries: 24,
    goalSummaries: 30,
    hoursLearned: 12,
    createdDate: "2 months ago",
    streak: 5,
    nextMilestone: 6,
  }

  const summaries: Summary[] = [
    {
      id: "1",
      title: "The Complete Guide to Machine Learning",
      channel: "Tech Explained",
      thumbnail: "/placeholder.svg?height=60&width=80",
      keyInsight: "Supervised learning requires labeled data to train models effectively...",
      dateAdded: "2 days ago",
      completed: true,
      reviewCount: 2,
      duration: "15:30",
    },
    {
      id: "2",
      title: "Neural Networks Explained Simply",
      channel: "AI Academy",
      thumbnail: "/placeholder.svg?height=60&width=80",
      keyInsight: "Neural networks mimic brain neurons to process complex patterns...",
      dateAdded: "5 days ago",
      completed: false,
      reviewCount: 0,
      duration: "22:15",
    },
    {
      id: "3",
      title: "Deep Learning vs Machine Learning",
      channel: "Data Science Pro",
      thumbnail: "/placeholder.svg?height=60&width=80",
      keyInsight: "Deep learning is a subset of ML using multi-layered neural networks...",
      dateAdded: "1 week ago",
      completed: true,
      reviewCount: 1,
      duration: "18:45",
    },
  ]

  const progressPercentage = (projectData.totalSummaries / projectData.goalSummaries) * 100

  const renderSummariesList = () => (
    <div className="space-y-3">
      {summaries.map((summary) => (
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
        {summaries.map((summary, index) => (
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
            <span>Projects</span>
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
                  <span>{projectData.totalSummaries} summaries</span>
                  <span>•</span>
                  <span>{projectData.hoursLearned} hours saved</span>
                  <span>•</span>
                  <span>Created {projectData.createdDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Videos
              </Button>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <Progress value={progressPercentage} className="w-full" />
                  </div>
                  <p className="text-sm font-medium">
                    {projectData.totalSummaries} of {projectData.goalSummaries}
                  </p>
                  <p className="text-xs text-muted-foreground">Videos Goal</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <span className="text-lg font-bold ml-1">{projectData.streak}</span>
                  </div>
                  <p className="text-sm font-medium">Day Streak</p>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-blue-500" />
                    <span className="text-lg font-bold ml-1">{projectData.nextMilestone}</span>
                  </div>
                  <p className="text-sm font-medium">To Goal</p>
                  <p className="text-xs text-muted-foreground">Videos left</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-bold ml-1">{projectData.hoursLearned}h</span>
                  </div>
                  <p className="text-sm font-medium">Time Saved</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

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
                {viewMode === "list" && renderSummariesList()}
                {viewMode === "timeline" && renderTimelineView()}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summaries.map((summary) => (
                      <Card key={summary.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox checked={summary.completed} />
                            <div className="flex-1">
                              <h3 className="font-medium text-sm mb-1">{summary.title}</h3>
                              <p className="text-xs text-muted-foreground mb-2">{summary.channel}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{summary.keyInsight}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Key Themes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Neural Networks</span>
                          <Badge>8 videos</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Supervised Learning</span>
                          <Badge>6 videos</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Deep Learning</span>
                          <Badge>4 videos</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recommended Next
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="font-medium">Computer Vision Basics</p>
                          <p className="text-muted-foreground">Builds on neural networks</p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Natural Language Processing</p>
                          <p className="text-muted-foreground">Next logical step</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                      <div>
                        <label className="text-sm font-medium">Learning Goal</label>
                        <Input value="30 videos" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Privacy</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option>Private</option>
                          <option>Shared</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Export Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download as PDF
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Export to Notion
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Project
                      </Button>
                      <Button variant="destructive" className="w-full justify-start">
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
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. Watch Time</span>
                  <span className="font-medium">18 min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most Active Day</span>
                  <span className="font-medium">Tuesday</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Completed "Neural Networks"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Added 3 new videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Reviewed "ML Basics"</span>
                  </div>
                </div>
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
