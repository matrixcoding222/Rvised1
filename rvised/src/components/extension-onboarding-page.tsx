"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle,
  Chrome,
  Play,
  ChevronDown,
  ExternalLink,
  Copy,
  ArrowRight,
  Puzzle,
  FileText,
  FolderOpen,
  Brain,
} from "lucide-react"
import Link from "next/link"

export function ExtensionOnboardingPage() {
  const [extensionInstalled, setExtensionInstalled] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false)

  // Check if extension is installed
  useEffect(() => {
    // Simulate extension detection - in real app, this would check for extension
    const checkExtension = () => {
      // @ts-ignore - Extension detection would be implemented here
      if (typeof window !== "undefined" && window.rvisedExtension) {
        setExtensionInstalled(true)
      }
    }

    checkExtension()
    const interval = setInterval(checkExtension, 2000)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      number: 1,
      title: "Install",
      description: "Click 'Add to Chrome' and confirm",
      completed: extensionInstalled,
    },
    {
      number: 2,
      title: "Pin Extension",
      description: "Pin Rvised for easy access",
      completed: extensionInstalled && currentStep >= 2,
    },
    {
      number: 3,
      title: "Try It",
      description: "Go to any YouTube video and click 'Summarize'",
      completed: extensionInstalled && currentStep >= 3,
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Banner */}
      {extensionInstalled && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">✅ Rvised is installed and ready!</span>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" asChild>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                    Go to YouTube
                  </a>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard">View Your Library</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-4xl">🤓</div>
            <Chrome className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Install Rvised for Chrome</h1>
          <p className="text-xl text-gray-600 mb-8">Start building your YouTube knowledge library in 30 seconds</p>

          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg mb-3">
            <Chrome className="h-5 w-5 mr-2" />
            Add to Chrome - It's Free
          </Button>
          <p className="text-sm text-gray-500">Works with Chrome, Edge, and Brave</p>
        </div>

        {/* Step-by-Step Guide */}
        {!extensionInstalled && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Get Started in 3 Easy Steps</h2>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>

                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex gap-6">
                      {/* Step Number */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            step.completed
                              ? "bg-green-500"
                              : currentStep === step.number
                                ? "bg-blue-600"
                                : "bg-gray-300"
                          }`}
                        >
                          {step.completed ? <CheckCircle className="h-6 w-6" /> : step.number}
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <Card className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                              <p className="text-gray-600">{step.description}</p>
                            </div>
                            {step.completed && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ✓ Completed
                              </Badge>
                            )}
                          </div>

                          {/* Step-specific content */}
                          {step.number === 1 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="aspect-video bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                                <div className="text-center">
                                  <Chrome className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">Chrome Web Store Screenshot</p>
                                </div>
                              </div>
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Chrome className="h-4 w-4 mr-2" />
                                Add to Chrome
                              </Button>
                            </div>
                          )}

                          {step.number === 2 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="aspect-video bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                                <div className="text-center">
                                  <Puzzle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">Extension Pinning GIF</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ArrowRight className="h-4 w-4" />
                                <span>Click the puzzle piece icon, then pin Rvised</span>
                              </div>
                            </div>
                          )}

                          {step.number === 3 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="aspect-video bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                                <div className="text-center">
                                  <Play className="h-12 w-12 text-red-600 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">YouTube + Rvised Button</p>
                                </div>
                              </div>
                              <Button variant="outline" className="w-full bg-transparent">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Try with Example Video
                              </Button>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What you can do with Rvised</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">📝 One-click summaries</h3>
              <p className="text-sm text-gray-600">Get key insights from any YouTube video instantly</p>
            </Card>

            <Card className="text-center p-6">
              <FolderOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">📁 Save to projects</h3>
              <p className="text-sm text-gray-600">Organize summaries into learning topics</p>
            </Card>

            <Card className="text-center p-6">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">🧠 Test your knowledge</h3>
              <p className="text-sm text-gray-600">Quiz yourself on what you've learned</p>
            </Card>
          </div>
        </div>

        {/* Quick Start Video */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">60-Second Tutorial</h2>

          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Quick start video: Install to first summary</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Pro Tips (shows after install) */}
        {extensionInstalled && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Pro tips for power users</h2>

            <div className="max-w-2xl mx-auto space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">⌨️</Badge>
                  <span>
                    Use keyboard shortcut: <code className="bg-gray-100 px-2 py-1 rounded">Alt+S</code>
                  </span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">📚</Badge>
                  <span>Batch summarize playlists for comprehensive learning</span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">📁</Badge>
                  <span>Create projects before summarizing to stay organized</span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">🔄</Badge>
                  <span>Review summaries weekly to reinforce learning</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        <div className="mb-16">
          <Collapsible open={troubleshootingOpen} onOpenChange={setTroubleshootingOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Troubleshooting & Common Issues</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${troubleshootingOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">I don't see the Rvised button</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Make sure the extension is pinned and you're on a YouTube video page.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard("chrome://extensions/")}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Extension URL
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Extension isn't working</h4>
                  <p className="text-sm text-gray-600 mb-3">Try refreshing the page or restarting your browser.</p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Can't save summaries</h4>
                  <p className="text-sm text-gray-600 mb-3">Make sure you're logged into your Rvised account.</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard">Check Account</Link>
                  </Button>
                </Card>

                <Card className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">Still having issues?</p>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Contact Support
                  </Button>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform how you learn?</h2>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open YouTube
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">
                <FolderOpen className="h-4 w-4 mr-2" />
                See Your Library
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
