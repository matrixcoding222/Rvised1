"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Home, ArrowLeft, BookOpen, FolderOpen, Puzzle, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock recent summaries data
  const recentSummaries = [
    { id: 1, title: "How to Learn Anything Faster", channel: "Huberman Lab", duration: "12 min read" },
    { id: 2, title: "The Science of Memory", channel: "Veritasium", duration: "8 min read" },
    { id: 3, title: "Productivity Hacks That Work", channel: "Ali Abdaal", duration: "15 min read" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to dashboard with search query
      window.location.href = `/dashboard?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Header with Icon */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-5xl">🔍</div>
        </div>

        {/* Main Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            Looks like this page doesn't exist or may have been moved.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="text-left max-w-md mx-auto">
          <h3 className="font-medium text-gray-900 mb-4">Here are some helpful links:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Home className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Dashboard</div>
                <div className="text-xs text-gray-500">View your summaries</div>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Library</div>
                <div className="text-xs text-gray-500">Browse all content</div>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Projects</div>
                <div className="text-xs text-gray-500">Organize your learning</div>
              </div>
            </Link>
            <Link
              href="/extension"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Puzzle className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Install Extension</div>
                <div className="text-xs text-gray-500">Get started</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <h3 className="font-medium text-gray-900 mb-3 text-left">Search your summaries:</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for topics, channels, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Recent Summaries */}
        <div className="max-w-md mx-auto">
          <h3 className="font-medium text-gray-900 mb-4 text-left">Your recent summaries:</h3>
          <div className="space-y-2">
            {recentSummaries.map((summary) => (
              <Link
                key={summary.id}
                href={`/dashboard`}
                className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-medium text-sm text-gray-900">{summary.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.channel} • {summary.duration}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          Need help finding something specific?{" "}
          <Link
            href="mailto:support@rvised.com"
            className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
