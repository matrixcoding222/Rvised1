"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Home, Mail, Copy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const copyErrorDetails = () => {
    const errorDetails = `
Error: ${error.message}
Timestamp: ${new Date().toISOString()}
Digest: ${error.digest || "N/A"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim()

    navigator.clipboard.writeText(errorDetails)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Image src="/glasses.svg" alt="Rvised" width={32} height={32} className="h-8 w-8 opacity-60" />
          <div className="text-5xl">😕</div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Don't worry, your summaries are safe. This is just a temporary hiccup.
          </p>
        </div>

        <Card className="p-4 bg-gray-50 border-gray-200 text-left">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">Error details for tech support:</p>
            <div className="space-y-1 text-sm text-gray-600 font-mono">
              <div>Error: {error.message}</div>
              <div>Time: {new Date().toLocaleString()}</div>
              {error.digest && <div>ID: {error.digest}</div>}
            </div>
            <Button variant="outline" size="sm" onClick={copyErrorDetails} className="text-xs bg-transparent">
              <Copy className="h-3 w-3 mr-1" />
              Copy Error Details
            </Button>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="mailto:support@rvised.com">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>

        <div className="text-left max-w-md mx-auto">
          <h3 className="font-medium text-gray-900 mb-3">Things you can try:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Refresh the page
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Check your internet connection
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Clear your browser cache
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Try again in a few minutes
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
