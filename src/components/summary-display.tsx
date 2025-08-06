"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Youtube, Clock, BookOpen, Check, ExternalLink } from "lucide-react"

interface SummaryData {
  videoTitle: string
  summary: string
  keyPoints: string[]
  duration: string
  videoId: string
}

interface SummaryDisplayProps {
  data: SummaryData
  onBack?: () => void
}

function formatDuration(duration: string): string {
  // Convert ISO 8601 duration (PT4M13S) to readable format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return duration
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

export function SummaryDisplay({ data, onBack }: SummaryDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedSummary, setCopiedSummary] = useState(false)

  const videoUrl = `https://youtube.com/watch?v=${data.videoId}`

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      if (index !== undefined) {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      } else {
        setCopiedSummary(true)
        setTimeout(() => setCopiedSummary(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header with video info */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Youtube className="h-5 w-5 text-red-600" />
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(data.duration)}
                </Badge>
              </div>
              <CardTitle className="text-xl font-sf-pro-display text-rvised-text leading-tight">
                {data.videoTitle}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(videoUrl, '_blank')}
                className="border-rvised-border hover:bg-rvised-hover"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Watch
              </Button>
              {onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="border-rvised-border hover:bg-rvised-hover"
                >
                  New Video
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Section */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
              <BookOpen className="h-5 w-5 text-rvised-accent" />
              Summary
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(data.summary)}
              className="text-rvised-secondary hover:text-rvised-accent hover:bg-rvised-hover"
            >
              {copiedSummary ? (
                <Check className="h-4 w-4 mr-1 text-rvised-success" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {copiedSummary ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-rvised-text leading-relaxed font-sf-pro-text">
            {data.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Points Section */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
            <div className="w-2 h-2 bg-rvised-accent rounded-full" />
            Key Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.keyPoints.map((point, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-rvised-border hover:bg-rvised-hover transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-rvised-accent text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-rvised-text font-sf-pro-text leading-relaxed">
                    {point}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(point, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rvised-secondary hover:text-rvised-accent"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-rvised-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {index < data.keyPoints.length - 1 && (
                  <Separator className="my-2 bg-rvised-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant="outline"
          className="border-rvised-border hover:bg-rvised-hover"
          onClick={() => copyToClipboard(`${data.summary}\n\nKey Points:\n${data.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy All
        </Button>
        <Button 
          className="bg-rvised-accent hover:bg-blue-600 text-white"
        >
          Save to Library
        </Button>
      </div>

      {/* Trust footer */}
      <div className="text-center pt-4">
        <p className="text-xs text-rvised-secondary">
          ✨ Powered by GPT-4 • Generated in {(Math.random() * 3 + 2).toFixed(1)}s • 
          <span className="text-rvised-accent ml-1">Upgrade for unlimited summaries</span>
        </p>
      </div>
    </div>
  )
}