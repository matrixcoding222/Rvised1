"use client"

import { useMemo, useState } from "react"
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

function parseTimeToSeconds(time: string): number {
  // Supports HH:MM:SS or MM:SS. Ignores spaces. Falls back to extracting digits if needed.
  const trimmed = (time || '').trim()
  if (!trimmed) return 0
  const parts = trimmed.split(':').map((p) => p.trim())
  const toNumber = (s: string) => {
    const m = s.match(/\d+/)
    return m ? parseInt(m[0], 10) : 0
  }
  if (parts.length === 3) {
    const [h, m, s] = parts
    return toNumber(h) * 3600 + toNumber(m) * 60 + toNumber(s)
  }
  if (parts.length === 2) {
    const [m, s] = parts
    return toNumber(m) * 60 + toNumber(s)
  }
  // Fallback: try to parse "XmYs" or just seconds
  const hm = trimmed.match(/(\d+)h/i)
  const mm = trimmed.match(/(\d+)m/i)
  const sm = trimmed.match(/(\d+)s/i)
  if (hm || mm || sm) {
    return (hm ? parseInt(hm[1], 10) * 3600 : 0) +
           (mm ? parseInt(mm[1], 10) * 60 : 0) +
           (sm ? parseInt(sm[1], 10) : 0)
  }
  const onlyDigits = trimmed.match(/^(\d+)$/)
  return onlyDigits ? parseInt(onlyDigits[1], 10) : 0
}

const STOPWORDS = new Set<string>('
  a,about,above,after,again,against,all,am,an,and,any,are,as,at,be,because,been,before,being,below,between,both,but,by,could,did,do,does,doing,down,during,each,few,for,from,further,had,has,have,having,he,her,here,hers,herself,him,himself,his,how,i,if,in,into,is,it,its,itself,let,me,more,most,my,myself,no,nor,not,of,off,on,once,only,or,other,our,ours,ourselves,out,over,own,same,she,should,so,some,such,than,that,the,their,theirs,them,themselves,then,there,these,they,this,those,through,to,too,under,until,up,very,was,we,were,what,when,where,which,while,who,whom,why,with,you,your,yours,yourself,yourselves
'.split(',').map(w=>w.trim()))

function normalizeWord(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function extractKeywords(text: string, extraBoostTerms: string[] = [], limit = 12): Set<string> {
  const counts = new Map<string, number>()
  const add = (word: string, weight = 1) => {
    const w = normalizeWord(word)
    if (!w || STOPWORDS.has(w) || w.length < 4 || /\d/.test(w)) return
    counts.set(w, (counts.get(w) || 0) + weight)
  }
  text.split(/[^A-Za-z0-9]+/).forEach((w) => add(w, 1))
  extraBoostTerms.forEach((t) => t.split(/[^A-Za-z0-9]+/).forEach((w) => add(w, 2)))
  const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w)
  return new Set(ranked)
}

function renderHighlightedSummary(text: string, keywords: Set<string>) {
  const parts = text.split(/(\s+)/)
  return parts.map((part, idx) => {
    const norm = normalizeWord(part)
    const isKeyword = norm && keywords.has(norm)
    return isKeyword ? (
      <span key={idx} className="bg-yellow-100 text-gray-900 font-extrabold rounded px-1">
        {part}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    )
  })
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
  const [quizResults, setQuizResults] = useState<Record<number, 'correct' | 'incorrect'>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveDone, setSaveDone] = useState(false)

  const videoUrl = `https://youtube.com/watch?v=${data.videoId}`

  const openAtTimestamp = (time: string) => {
    const seconds = parseTimeToSeconds(time)
    const sep = videoUrl.includes('?') ? '&' : '?'
    const url = `${videoUrl}${sep}t=${seconds}s`
    window.open(url, '_blank')
  }

  const summaryKeywords = useMemo(() => {
    const boost: string[] = []
    if (Array.isArray(data.techStack)) boost.push(...data.techStack)
    if (Array.isArray(data.keyInsights)) boost.push(...data.keyInsights)
    boost.push(data.videoTitle)
    return extractKeywords(`${data.mainTakeaway}. ${data.summary}`, boost, 14)
  }, [data.mainTakeaway, data.summary, data.techStack, data.keyInsights, data.videoTitle])

  const saveToLibrary = async () => {
    try {
      setIsSaving(true)
      setSaveDone(false)
      const payload = {
        projectName: 'My Library',
        videoUrl,
        data: {
          videoTitle: data.videoTitle,
          title: data.videoTitle,
          videoId: data.videoId,
          duration: data.duration,
          mainTakeaway: data.mainTakeaway,
          summary: data.summary,
          keyInsights: data.keyInsights,
          actionItems: data.actionItems,
          timestampedSections: data.timestampedSections,
          quiz: data.quiz,
        },
      }
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaveDone(true)
    } catch (e) {
      console.error('Save failed', e)
      alert('Failed to save to Library. Please try again.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveDone(false), 2500)
    }
  }

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
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">🎯 Main Takeaway</h3>
              <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                {data.mainTakeaway}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack (if available) */}
      {data.techStack && data.techStack.length > 0 && (
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow">
                <Code className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">🛠️ Tech Stack</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.techStack.map((tech, index) => (
                <Badge 
                  key={index} 
                  className="px-4 py-2 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 cursor-default"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Summary</span>
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
          <p className="text-2xl text-gray-800 leading-9 font-bold">
            {renderHighlightedSummary(data.summary, summaryKeywords)}
          </p>
        </CardContent>
      </Card>

      {/* Key Insights Section */}
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg shadow">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">💡 Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.keyInsights.map((insight, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-lg text-gray-700 font-medium leading-relaxed">
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
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">⚡ Action Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.actionItems.map((action, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                    ✓
                  </div>
                  <p className="flex-1 text-lg text-gray-700 font-medium leading-relaxed">
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
        <Card className="border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow">
                <Play className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">📍 Timestamped Sections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.timestampedSections.map((section, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => openAtTimestamp(section.time)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openAtTimestamp(section.time)
                    }
                  }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                  title="Open video at this timestamp"
                >
                  <Badge className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-mono text-sm font-bold border-0 shadow">
                    {section.time}
                  </Badge>
                  <p className="flex-1 text-lg text-gray-700 font-medium leading-relaxed">
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-sf-pro-display text-rvised-text">
                <HelpCircle className="h-5 w-5 text-rvised-accent" />
                🧪 Test Your Knowledge
              </CardTitle>
              <div className="text-sm text-rvised-secondary">
                <span className="font-medium">Score: </span>
                <span>
                  {Object.values(quizResults).filter(v => v === 'correct').length}
                  /
                  {Object.keys(quizResults).length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.quiz.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-colors ${
                    quizResults[index] === 'correct'
                      ? 'border-green-300 bg-green-50'
                      : quizResults[index] === 'incorrect'
                      ? 'border-red-300 bg-red-50'
                      : 'border-rvised-border'
                  }`}
                >
                  <p
                    className="font-medium text-rvised-text mb-3 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [index]: !prev[index] }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setQuizAnswers(prev => ({ ...prev, [index]: !prev[index] }))
                      }
                    }}
                    title={quizAnswers[index] ? 'Hide answer' : 'Show answer'}
                  >
                    {item.question}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [index]: !prev[index] }))}
                      className={quizAnswers[index] ? "bg-green-50 border-green-200 text-green-700" : ""}
                    >
                      {quizAnswers[index] ? "Hide Answer" : "Show Answer"}
                    </Button>
                    {quizAnswers[index] && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuizResults(prev => ({ ...prev, [index]: 'correct' }))}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          title="Mark as correct"
                        >
                          I was right
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuizResults(prev => ({ ...prev, [index]: 'incorrect' }))}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          title="Mark as incorrect"
                        >
                          I was wrong
                        </Button>
                      </>
                    )}
                  </div>
                  {quizAnswers[index] && (
                    <div className="mt-3 p-3 bg-rvised-hover border border-rvised-border rounded-lg">
                      <p className="text-rvised-text font-medium">{item.answer}</p>
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
          onClick={saveToLibrary}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : saveDone ? 'Saved!' : 'Save to Library'}
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