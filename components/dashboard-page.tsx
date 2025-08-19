"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
} from "lucide-react"

export function DashboardPage() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showAddUrl, setShowAddUrl] = useState(false)

  // Mock user data
  const user = {
    name: "Alex",
    totalSummaries: 234,
    summariesThisWeek: 12,
    timeSaved: 47,
    weeklyAverage: 6,
    streak: 7,
    knowledgeScore: "Expert",
    percentile: 10,
    videosThisMonth: 156,
  }

  // Mock recent activity
  const recentSummaries = [
    {
      id: 1,
      title: "The Science of Learning",
      channel: "Huberman Lab",
      thumbnail: "/placeholder.svg?height=120&width=200",
      timeAgo: "2 hours ago",
      duration: "2h 15m",
    },
    {
      id: 2,
      title: "React Server Components",
      channel: "Vercel",
      thumbnail: "/placeholder.svg?height=120&width=200",
      timeAgo: "1 day ago",
      duration: "45m",
    },
    {
      id: 3,
      title: "Design Systems at Scale",
      channel: "Figma",
      thumbnail: "/placeholder.svg?height=120&width=200",
      timeAgo: "2 days ago",
      duration: "1h 30m",
    },
    {
      id: 4,
      title: "AI in Healthcare",
      channel: "MIT",
      thumbnail: "/placeholder.svg?height=120&width=200",
      timeAgo: "3 days ago",
      duration: "1h 10m",
    },
  ]

  // Mock projects
  const activeProjects = [
    {
      id: 1,
      name: "Machine Learning",
      emoji: "🤖",
      progress: 75,
      summariesThisWeek: 3,
      thumbnails: ["/placeholder.svg?height=40&width=40", "/placeholder.svg?height=40&width=40"],
    },
    {
      id: 2,
      name: "React Mastery",
      emoji: "⚛️",
      progress: 45,
      summariesThisWeek: 2,
      thumbnails: ["/placeholder.svg?height=40&width=40", "/placeholder.svg?height=40&width=40"],
    },
    {
      id: 3,
      name: "Design Systems",
      emoji: "🎨",
      progress: 90,
      summariesThisWeek: 1,
      thumbnails: ["/placeholder.svg?height=40&width=40", "/placeholder.svg?height=40&width=40"],
    },
    {
      id: 4,
      name: "Startup Insights",
      emoji: "🚀",
      progress: 30,
      summariesThisWeek: 4,
      thumbnails: ["/placeholder.svg?height=40&width=40", "/placeholder.svg?height=40&width=40"],
    },
  ]

  // Mock learning heatmap data (last 4 weeks)
  const heatmapData = Array.from({ length: 28 }, (_, i) => ({
    day: i,
    count: Math.floor(Math.random() * 5),
  }))

  // Mock top topics
  const topTopics = [
    { name: "Machine Learning", percentage: 35, color: "bg-blue-500" },
    { name: "Web Development", percentage: 25, color: "bg-green-500" },
    { name: "Design", percentage: 20, color: "bg-purple-500" },
    { name: "Business", percentage: 15, color: "bg-orange-500" },
    { name: "Other", percentage: 5, color: "bg-gray-400" },
  ]

  const getMotivationalMessage = () => {
    if (user.streak >= 7) {
      return {
        icon: "🔥",
        message: `Amazing! You're on a ${user.streak}-day streak. Keep the momentum going!`,
        action: "Summarize a video today",
      }
    }
    return {
      icon: "🎯",
      message: "Just 2 more videos to reach your weekly goal!",
      action: "Add a video now",
    }
  }

  const motivational = getMotivationalMessage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Welcome back, {user.name} 👋</h1>
              <p className="text-gray-600 mt-1">You've learned from {user.videosThisMonth} videos this month</p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={showAddUrl} onOpenChange={setShowAddUrl}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add URL
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add YouTube Video</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-url">YouTube URL</Label>
                      <Input id="video-url" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Add to Project (Optional)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.emoji} {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Summary
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                <Link href="https://youtube.com" target="_blank">
                  <Youtube className="h-4 w-4" />
                  Go to YouTube
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.totalSummaries}</p>
                      <p className="text-sm text-gray-600">Total Summaries</p>
                      <p className="text-xs text-green-600 font-medium">+{user.summariesThisWeek} this week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.timeSaved} hours</p>
                      <p className="text-sm text-gray-600">Time Saved</p>
                      <p className="text-xs text-green-600 font-medium">~{user.weeklyAverage} hrs/week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Flame className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.streak} days</p>
                      <p className="text-sm text-gray-600">Learning Streak</p>
                      <p className="text-xs text-orange-600 font-medium">Keep it up!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.knowledgeScore}</p>
                      <p className="text-sm text-gray-600">Knowledge Score</p>
                      <p className="text-xs text-purple-600 font-medium">Top {user.percentile}% of users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Motivational Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{motivational.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{motivational.message}</p>
                      <p className="text-sm text-gray-600 mt-1">Stay consistent to maximize your learning</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {motivational.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {recentSummaries.map((summary) => (
                  <Card
                    key={summary.id}
                    className="flex-shrink-0 w-64 group hover:shadow-md transition-all cursor-pointer"
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={summary.thumbnail || "/placeholder.svg"}
                          alt={summary.title}
                          className="w-full h-36 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 text-gray-900 hover:bg-white"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                          {summary.duration}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
                          {summary.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">{summary.channel}</p>
                        <p className="text-xs text-gray-500 mt-2">{summary.timeAgo}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Learning Insights */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Learning Patterns</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Heatmap */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 gap-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                          <div key={day} className="text-xs text-gray-500 text-center font-medium">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {heatmapData.map((data) => (
                          <div
                            key={data.day}
                            className={`aspect-square rounded-sm ${
                              data.count === 0
                                ? "bg-gray-100"
                                : data.count === 1
                                  ? "bg-blue-200"
                                  : data.count === 2
                                    ? "bg-blue-300"
                                    : data.count === 3
                                      ? "bg-blue-400"
                                      : "bg-blue-500"
                            }`}
                            title={`${data.count} videos`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Less</span>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                          <div className="w-3 h-3 bg-blue-200 rounded-sm" />
                          <div className="w-3 h-3 bg-blue-300 rounded-sm" />
                          <div className="w-3 h-3 bg-blue-400 rounded-sm" />
                          <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                        </div>
                        <span>More</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Topics */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Learning Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topTopics.map((topic) => (
                        <div key={topic.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-900">{topic.name}</span>
                            <span className="text-gray-600">{topic.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${topic.color}`}
                              style={{ width: `${topic.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Projects Overview */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  See All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <Card key={project.id} className="group hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{project.emoji}</span>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{project.summariesThisWeek} summaries this week</span>
                          <div className="flex -space-x-1">
                            {project.thumbnails.map((thumb, idx) => (
                              <img
                                key={idx}
                                src={thumb || "/placeholder.svg"}
                                alt=""
                                className="w-6 h-6 rounded-full border-2 border-white object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="group hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-blue-600 rounded-full w-fit mx-auto mb-3">
                      <Youtube className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Summarize from URL</h3>
                    <p className="text-sm text-gray-600">Add any YouTube video</p>
                  </CardContent>
                </Card>

                <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                  <DialogTrigger asChild>
                    <Card className="group hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6 text-center">
                        <div className="p-3 bg-green-600 rounded-full w-fit mx-auto mb-3">
                          <FolderOpen className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Create New Project</h3>
                        <p className="text-sm text-gray-600">Organize your learning</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="e.g., Machine Learning Basics" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea id="project-description" placeholder="Brief description of your learning goal..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Emoji</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="🎯" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="🎯">🎯 Target</SelectItem>
                              <SelectItem value="🚀">🚀 Rocket</SelectItem>
                              <SelectItem value="💡">💡 Idea</SelectItem>
                              <SelectItem value="📚">📚 Books</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Blue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="w-full">Create Project</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Card className="group hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-purple-600 rounded-full w-fit mx-auto mb-3">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Search Library</h3>
                    <p className="text-sm text-gray-600">Find past summaries</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-orange-600 rounded-full w-fit mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">View Full Stats</h3>
                    <p className="text-sm text-gray-600">Detailed analytics</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>

            {/* Recommended Videos */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recommended for You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Advanced React Patterns", channel: "Kent C. Dodds", views: "2.1M" },
                  { title: "System Design Interview", channel: "Exponent", views: "890K" },
                  { title: "CSS Grid Mastery", channel: "Kevin Powell", views: "1.5M" },
                ].map((video, idx) => (
                  <div key={idx} className="flex gap-3 group cursor-pointer">
                    <img
                      src={`/placeholder.svg?height=60&width=80&query=${video.title}`}
                      alt={video.title}
                      className="w-20 h-15 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{video.channel}</p>
                      <p className="text-xs text-gray-500">{video.views} views</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips Widget */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">💡 Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Review your summaries within 24 hours to improve retention by up to 60%!
                </p>
                <Button size="sm" variant="outline" className="mt-3 w-full bg-transparent">
                  Show me how
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
