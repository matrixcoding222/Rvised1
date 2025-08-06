"use client"

import { useState } from "react"
import { VideoUrlInput } from "@/components/video-url-input"
import { SummaryDisplay } from "@/components/summary-display"

interface SummaryData {
  videoTitle: string
  videoId: string
  duration: string
  videoType: "tutorial" | "lecture" | "podcast" | "other"
  mainTakeaway: string
  summary: string
  techStack?: string[]
  keyInsights: string[]
  actionItems: string[]
  timestampedSections?: { time: string; description: string }[]
  codeSnippets?: { language: string; code: string; description: string }[]
  quiz?: { question: string; answer: string }[]
  resources?: { title: string; url?: string; type: string }[]
  keyPoints: string[]
}

export default function Home() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)

  const handleVideoSubmit = (data: SummaryData) => {
    setSummaryData(data)
  }

  const handleBack = () => {
    setSummaryData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-rvised-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rvised-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-xl font-sf-pro-display font-semibold text-rvised-text">
                Rvised
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <span className="text-sm text-rvised-secondary">Sign in</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-sf-pro-display font-bold text-rvised-text mb-4 tracking-rvised">
            Transform YouTube into
            <span className="text-rvised-accent"> Actionable Knowledge</span>
          </h1>
          <p className="text-xl text-rvised-secondary max-w-2xl mx-auto leading-rvised">
            Get instant, AI-powered summaries of any YouTube video. 
            Perfect for busy developers and students who value their time.
          </p>
        </div>

        {/* Video URL Input Component or Summary Display */}
        <div className="flex justify-center mb-16">
          {summaryData ? (
            <SummaryDisplay data={summaryData} onBack={handleBack} />
          ) : (
            <VideoUrlInput onSubmit={handleVideoSubmit} />
          )}
        </div>

        {/* Features Preview - Only show when not viewing summary */}
        {!summaryData && (
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rvised-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h3 className="font-sf-pro-display font-semibold text-rvised-text mb-2">
                Lightning Fast
              </h3>
              <p className="text-rvised-secondary text-sm">
                Get comprehensive summaries in under 5 seconds
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rvised-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="font-sf-pro-display font-semibold text-rvised-text mb-2">
                Key Insights
              </h3>
              <p className="text-rvised-secondary text-sm">
                Extract actionable takeaways and important timestamps
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rvised-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">📁</span>
              </div>
              <h3 className="font-sf-pro-display font-semibold text-rvised-text mb-2">
                Organize & Save
              </h3>
              <p className="text-rvised-secondary text-sm">
                Create project folders to organize your learning
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}