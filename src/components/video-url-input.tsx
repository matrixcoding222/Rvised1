"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Loader2, Youtube, Sparkles } from "lucide-react"

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
  summary: string
  keyPoints: string[]
  duration: string
  videoId: string
}

interface VideoUrlInputProps {
  onSubmit?: (data: SummaryData) => void
  isLoading?: boolean
  disabled?: boolean
}

export function VideoUrlInput({ onSubmit, isLoading = false, disabled = false }: VideoUrlInputProps) {
  const [isValidating, setIsValidating] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
    },
  })

  const handleSubmit = async (data: FormData) => {
    setIsValidating(true)
    try {
      // Call real summarization API
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: data.videoUrl }),
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-rvised-border shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Youtube className="h-6 w-6 text-rvised-accent" />
          <h2 className="text-2xl font-sf-pro-display font-semibold text-rvised-text tracking-rvised">
            Summarize YouTube Video
          </h2>
          <Sparkles className="h-5 w-5 text-rvised-accent" />
        </div>
        <p className="text-rvised-secondary text-sm">
          Transform any YouTube video into actionable insights in seconds
        </p>
      </div>

      {/* Form */}
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

      {/* Trust indicators */}
      <div className="mt-4 text-center">
        <p className="text-xs text-rvised-secondary">
          ✨ Free tier: 5 summaries/day • ⚡ Premium: Unlimited • 🔒 Secure & Private
        </p>
      </div>
    </div>
  )
}