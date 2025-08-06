"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Youtube, Sparkles, Settings, BookOpen, Wrench, Brain, ChevronDown, ChevronUp } from "lucide-react"

// YouTube URL validation schema
const formSchema = z.object({
  videoUrl: z
    .string()
    .min(1, "Please enter a YouTube URL")
    .refine(
      (url) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        return youtubeRegex.test(url)
      },
      "Please enter a valid YouTube URL"
    ),
})

type FormData = z.infer<typeof formSchema>

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

interface SummarySettings {
  learningMode: "student" | "build" | "understand"
  summaryDepth: "quick" | "standard" | "deep"
  includeEmojis: boolean
  includeCode: boolean
  generateQuiz: boolean
  includeTimestamps: boolean
}

interface VideoUrlInputProps {
  onSubmit?: (data: SummaryData) => void
  isLoading?: boolean
  disabled?: boolean
}

export function VideoUrlInput({ onSubmit, isLoading = false, disabled = false }: VideoUrlInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<SummarySettings>({
    learningMode: "student",
    summaryDepth: "standard",
    includeEmojis: true,
    includeCode: true,
    generateQuiz: true,
    includeTimestamps: true,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
    },
  })

  const handleSubmit = async (data: FormData) => {
    setIsValidating(true)
    try {
      // Call real summarization API with settings
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoUrl: data.videoUrl,
          settings: settings
        }),
      })

      const result = await response.json()
      
      if (!result.success) {
        form.setError('videoUrl', { 
          type: 'manual', 
          message: result.error || 'Failed to process video' 
        })
        return
      }

      // Pass real data to parent component
      onSubmit?.(result.data)
    } catch (error) {
      console.error("API call failed:", error)
      form.setError('videoUrl', { 
        type: 'manual', 
        message: 'Network error. Please try again.' 
      })
    } finally {
      setIsValidating(false)
    }
  }

  const isProcessing = isLoading || isValidating

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Input Card */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Youtube className="h-6 w-6 text-rvised-accent" />
            <CardTitle className="text-2xl font-sf-pro-display font-semibold text-rvised-text tracking-rvised">
              Summarize YouTube Video
            </CardTitle>
            <Sparkles className="h-5 w-5 text-rvised-accent" />
          </div>
          <p className="text-rvised-secondary text-sm">
            Transform any YouTube video into actionable insights in seconds
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                          disabled={disabled || isProcessing}
                          className="h-14 px-4 text-base border-2 border-rvised-border focus:border-rvised-accent focus:ring-0 rounded-xl bg-white placeholder:text-rvised-secondary transition-all duration-200"
                        />
                        {field.value && !form.formState.errors.videoUrl && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-2 w-2 bg-rvised-success rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-rvised-error text-sm mt-2" />
                  </FormItem>
                )}
              />

              {/* Learning Mode Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-rvised-text">Learning Mode</h3>
                <div className="flex gap-2">
                  {[
                    { id: "student", label: "Student", icon: BookOpen, desc: "Focus on understanding concepts" },
                    { id: "build", label: "Build", icon: Wrench, desc: "Actionable implementation steps" },
                    { id: "understand", label: "Understand", icon: Brain, desc: "Deep theoretical insights" }
                  ].map((mode) => (
                    <Button
                      key={mode.id}
                      type="button"
                      variant={settings.learningMode === mode.id ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, learningMode: mode.id as any }))}
                      className={`flex-1 h-auto p-3 flex flex-col items-center gap-1 ${
                        settings.learningMode === mode.id 
                          ? "bg-rvised-accent text-white" 
                          : "border-rvised-border hover:bg-rvised-hover"
                      }`}
                    >
                      <mode.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{mode.label}</span>
                      <span className="text-xs opacity-80">{mode.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={disabled || isProcessing || !form.formState.isValid}
                className="w-full h-14 bg-rvised-accent hover:bg-blue-600 text-white font-sf-pro-text font-medium text-base rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isValidating ? "Validating..." : "Generating Summary..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Summarize Video
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Advanced Settings Card */}
      <Card className="border-rvised-border bg-white shadow-lg">
        <CardHeader className="pb-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-rvised-accent" />
              <CardTitle className="text-lg font-sf-pro-display text-rvised-text">
                Advanced Settings
              </CardTitle>
            </div>
            {showSettings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-6">
            {/* Summary Depth */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-rvised-text">Summary Depth</h3>
              <div className="flex gap-2">
                {[
                  { id: "quick", label: "Quick", desc: "2-3 min read" },
                  { id: "standard", label: "Standard", desc: "5-7 min read" },
                  { id: "deep", label: "Deep", desc: "10+ min read" }
                ].map((depth) => (
                  <Button
                    key={depth.id}
                    type="button"
                    variant={settings.summaryDepth === depth.id ? "default" : "outline"}
                    onClick={() => setSettings(prev => ({ ...prev, summaryDepth: depth.id as any }))}
                    className={`flex-1 flex flex-col items-center gap-1 h-auto p-3 ${
                      settings.summaryDepth === depth.id 
                        ? "bg-rvised-accent text-white" 
                        : "border-rvised-border hover:bg-rvised-hover"
                    }`}
                  >
                    <span className="text-sm font-medium">{depth.label}</span>
                    <span className="text-xs opacity-80">{depth.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-rvised-border" />

            {/* Feature Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-rvised-text">Include Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "includeEmojis", label: "Emojis & Icons", desc: "Visual indicators" },
                  { key: "includeCode", label: "Code Snippets", desc: "Extract code examples" },
                  { key: "generateQuiz", label: "Quiz Questions", desc: "Test knowledge" },
                  { key: "includeTimestamps", label: "Timestamps", desc: "Video sections" }
                ].map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    variant={settings[option.key as keyof SummarySettings] ? "default" : "outline"}
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      [option.key]: !prev[option.key as keyof SummarySettings] 
                    }))}
                    className={`h-auto p-3 flex flex-col items-start text-left ${
                      settings[option.key as keyof SummarySettings]
                        ? "bg-rvised-accent text-white" 
                        : "border-rvised-border hover:bg-rvised-hover"
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs opacity-80">{option.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="bg-rvised-hover p-3 rounded-lg">
              <h4 className="text-sm font-medium text-rvised-text mb-2">Current Configuration</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {settings.learningMode.charAt(0).toUpperCase() + settings.learningMode.slice(1)} Mode
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {settings.summaryDepth.charAt(0).toUpperCase() + settings.summaryDepth.slice(1)} Depth
                </Badge>
                {settings.includeEmojis && <Badge variant="outline">🎨 Emojis</Badge>}
                {settings.includeCode && <Badge variant="outline">💻 Code</Badge>}
                {settings.generateQuiz && <Badge variant="outline">🧪 Quiz</Badge>}
                {settings.includeTimestamps && <Badge variant="outline">⏰ Timestamps</Badge>}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Trust indicators */}
      <div className="text-center">
        <p className="text-xs text-rvised-secondary">
          ✨ Free tier: 5 summaries/day • ⚡ Premium: Unlimited • 🔒 Secure & Private
        </p>
      </div>
    </div>
  )
}