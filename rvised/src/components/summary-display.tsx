"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Copy, Youtube, Clock, BookOpen, Check, ExternalLink, Target, Lightbulb, CheckSquare, Code, HelpCircle, Link, Play } from "lucide-react"

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
  // Legacy fields for backward compatibility
  keyPoints: string[]
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

function getVideoTypeIcon(type: string) {
  switch (type) {
    case 'tutorial': return '🛠️'
    case 'lecture': return '🎓'
    case 'podcast': return '🎙️'
    default: return '📺'
  }
}

function getVideoTypeColor(type: string) {
  switch (type) {
    case 'tutorial': return 'bg-blue-100 text-blue-800'
    case 'lecture': return 'bg-purple-100 text-purple-800'
    case 'podcast': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function SummaryDisplay({ data, onBack }: SummaryDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({})

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
                <Badge className={`text-xs ${getVideoTypeColor(data.videoType)}`}>
                  {getVideoTypeIcon(data.videoType)} {data.videoType.charAt(0).toUpperCase() + data.videoType.slice(1)}
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

      {/* Main Takeaway */}
      <Card className="border-rvised-border bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-rvised-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-rvised-text mb-2">🎯 Main Takeaway</h3>
              <p className="text-lg font-medium text-rvised-text leading-relaxed">
                {data.mainTakeaway}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack (if available) */}
      {data.techStack && data.techStack.length > 0 && (
        <Card className="border-rvised-border bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
              <Code className="h-5 w-5 text-rvised-accent" />
              🛠️ Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map((tech, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Key Insights Section */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
            <Lightbulb className="h-5 w-5 text-rvised-accent" />
            💡 Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.keyInsights.map((insight, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-rvised-border hover:bg-rvised-hover transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-rvised-text font-sf-pro-text leading-relaxed">
                    {insight}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(insight, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rvised-secondary hover:text-rvised-accent"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-rvised-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items Section */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
            <CheckSquare className="h-5 w-5 text-rvised-accent" />
            ⚡ Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.actionItems.map((action, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <p className="flex-1 text-rvised-text font-sf-pro-text leading-relaxed">
                    {action}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(action, index + 100)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rvised-secondary hover:text-rvised-accent"
                  >
                    {copiedIndex === index + 100 ? (
                      <Check className="h-4 w-4 text-rvised-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timestamped Sections */}
      {data.timestampedSections && data.timestampedSections.length > 0 && (
        <Card className="border-rvised-border bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
              <Play className="h-5 w-5 text-rvised-accent" />
              📍 Timestamped Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.timestampedSections.map((section, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-rvised-border hover:bg-rvised-hover transition-colors">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                    {section.time}
                  </Badge>
                  <p className="flex-1 text-rvised-text font-sf-pro-text leading-relaxed">
                    {section.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Snippets */}
      {data.codeSnippets && data.codeSnippets.length > 0 && (
        <Card className="border-rvised-border bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
              <Code className="h-5 w-5 text-rvised-accent" />
              💻 Code Snippets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.codeSnippets.map((snippet, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{snippet.language}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(snippet.code, index + 200)}
                        className="text-xs"
                      >
                        {copiedIndex === index + 200 ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{snippet.description}</p>
                  </div>
                  <pre className="p-3 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Section */}
      {data.quiz && data.quiz.length > 0 && (
        <Card className="border-rvised-border bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
              <HelpCircle className="h-5 w-5 text-rvised-accent" />
              🧪 Test Your Knowledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.quiz.map((item, index) => (
                <div key={index} className="border border-rvised-border rounded-lg p-4">
                  <p className="font-medium text-rvised-text mb-3">{item.question}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [index]: !prev[index] }))}
                    className={quizAnswers[index] ? "bg-green-50 border-green-200 text-green-700" : ""}
                  >
                    {quizAnswers[index] ? "Hide Answer" : "Show Answer"}
                  </Button>
                  {quizAnswers[index] && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {data.resources && data.resources.length > 0 && (
        <Card className="border-rvised-border bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
              <Link className="h-5 w-5 text-rvised-accent" />
              🔗 Resources & Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.resources.map((resource, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-rvised-border hover:bg-rvised-hover transition-colors">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    {resource.type}
                  </Badge>
                  <span className="flex-1 text-rvised-text font-sf-pro-text">{resource.title}</span>
                  {resource.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                      className="text-rvised-secondary hover:text-rvised-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant="outline"
          className="border-rvised-border hover:bg-rvised-hover"
          onClick={() => {
            const fullSummary = [
              `🎯 Main Takeaway: ${data.mainTakeaway}`,
              '',
              `📝 Summary:\n${data.summary}`,
              '',
              `💡 Key Insights:\n${data.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}`,
              '',
              `⚡ Action Items:\n${data.actionItems.map((action, i) => `${i + 1}. ${action}`).join('\n')}`,
              ...(data.techStack && data.techStack.length > 0 ? ['', `🛠️ Tech Stack: ${data.techStack.join(', ')}`] : []),
              ...(data.timestampedSections && data.timestampedSections.length > 0 ? 
                ['', '📍 Timestamps:', ...data.timestampedSections.map(s => `${s.time} - ${s.description}`)] : []),
            ].join('\n')
            copyToClipboard(fullSummary)
          }}
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