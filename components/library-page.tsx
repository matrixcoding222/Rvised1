"use client"

import { useState } from "react"
import { Search, Grid3X3, List, Plus, FolderOpen, Play, Edit3, Trash2, Chrome, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface Summary {
  id: string
  title: string
  channel: string
  thumbnail: string
  dateSummarized: string
  project?: string
  keyInsight: string
  duration: string
  viewCount: number
}

// Mock data for demonstration
const mockSummaries: Summary[] = [
  {
    id: "1",
    title: "The Science of Learning: How to Study More Effectively",
    channel: "Huberman Lab",
    thumbnail: "/placeholder.svg?height=180&width=320",
    dateSummarized: "2024-01-15",
    project: "Neuroscience",
    keyInsight: "Spacing repetition increases retention by 40% compared to massed practice",
    duration: "2h 15m",
    viewCount: 12,
  },
  {
    id: "2",
    title: "Building Better Habits: The Psychology of Change",
    channel: "Andrew Huberman",
    thumbnail: "/placeholder.svg?height=180&width=320",
    dateSummarized: "2024-01-14",
    project: "Personal Development",
    keyInsight: "Habit stacking leverages existing neural pathways for faster adoption",
    duration: "1h 45m",
    viewCount: 8,
  },
  {
    id: "3",
    title: "The Future of AI and Machine Learning",
    channel: "Lex Fridman",
    thumbnail: "/placeholder.svg?height=180&width=320",
    dateSummarized: "2024-01-13",
    keyInsight: "Transformer architecture revolutionized natural language processing",
    duration: "3h 20m",
    viewCount: 15,
  },
]

export function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedSort, setSelectedSort] = useState("Recent")

  const isEmpty = mockSummaries.length === 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm text-gray-500">Dashboard &gt; Library</div>

          {/* Title Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Knowledge Library</h1>
              <p className="mt-1 text-gray-600">
                {mockSummaries.length} summaries from{" "}
                {mockSummaries.reduce((acc, s) => acc + Number.parseInt(s.duration), 0)} hours of content
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add URL
              </Button>

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
                      <DropdownMenuItem>Neuroscience</DropdownMenuItem>
                      <DropdownMenuItem>Personal Development</DropdownMenuItem>
                      <DropdownMenuItem>Technology</DropdownMenuItem>
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
            {isEmpty ? (
              <EmptyState />
            ) : (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}
              >
                {mockSummaries.map((summary) => (
                  <SummaryCard key={summary.id} summary={summary} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total summaries</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours saved</span>
                      <span className="font-medium">18.5h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Most active day</span>
                      <span className="font-medium">Tuesday</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current streak</span>
                      <span className="font-medium">7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">Recent Projects</h3>
                  <div className="space-y-3">
                    {["Neuroscience", "Personal Development", "Technology", "Business"].map((project) => (
                      <div key={project} className="flex items-center justify-between">
                        <span className="text-gray-600">{project}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 10) + 1}
                        </Badge>
                      </div>
                    ))}
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

function SummaryCard({ summary, viewMode }: { summary: Summary; viewMode: "grid" | "list" }) {
  const [isHovered, setIsHovered] = useState(false)

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
              <Image src={summary.thumbnail || "/placeholder.svg"} alt={summary.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{summary.channel}</p>
              <p className="mt-2 text-sm italic text-gray-600 line-clamp-1">{summary.keyInsight}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>{summary.dateSummarized}</span>
                {summary.project && (
                  <Badge variant="outline" className="text-xs">
                    {summary.project}
                  </Badge>
                )}
              </div>
            </div>
            {isHovered && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Play className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
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
          <Image src={summary.thumbnail || "/placeholder.svg"} alt={summary.title} fill className="object-cover" />
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
              <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                <Play className="h-4 w-4" />
              </Button>
              <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{summary.channel}</p>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{summary.dateSummarized}</span>
            {summary.project && (
              <Badge variant="outline" className="text-xs">
                {summary.project}
              </Badge>
            )}
          </div>

          <p className="mt-3 text-sm italic text-gray-600 line-clamp-1">{summary.keyInsight}</p>
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
