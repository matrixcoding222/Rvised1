"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface LoadingScreenProps {
  onComplete?: () => void
  duration?: number
}

export function LoadingScreen({ onComplete, duration = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          if (onComplete) {
            setTimeout(onComplete, 300)
          }
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={24} height={24} className="h-6 w-6" />
            <span className="font-mono text-xl font-semibold">Rvised</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="animate-pulse">
              <Image
                src="/glasses.svg"
                alt="Rvised"
                width={64}
                height={64}
                className="h-16 w-16 mx-auto opacity-60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-48 h-1 bg-muted rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">Setting up your learning experience...</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <Image src="/glasses.svg" alt="Rvised" width={20} height={20} className="h-5 w-5" />
            <span className="font-mono font-semibold">Rvised</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
