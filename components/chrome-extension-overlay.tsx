"use client"

import { useState } from "react"
import { Clock, Play, Sparkles, Brain, FileText, BookOpen, Settings, Copy, Download, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface ExtensionOverlayProps {
  videoTitle?: string
  channelName?: string
}

export function ChromeExtensionOverlay({
  videoTitle = "How to Build Better Learning Habits",
  channelName = "Andrew Huberman",
}: ExtensionOverlayProps) {
  const [activeMode, setActiveMode] = useState("student")
  const [readingDepth, setReadingDepth] = useState("standard")
  const [isSummarized, setIsSummarized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [showActionItems, setShowActionItems] = useState(true)
  const [generateQuiz, setGenerateQuiz] = useState(false)
  const [includeTranscript, setIncludeTranscript] = useState(false)

  const summaryContent = [
    {
      time: "00:00",
      title: "Introduction to Learning Habits",
      content:
        "Overview of why habits matter for learning retention and long-term knowledge acquisition through consistent practice",
      keywords: ["habits", "learning retention", "knowledge acquisition"],
    },
    {
      time: "02:15",
      title: "The Science of Habit Formation",
      content: "Neuroplasticity and how the brain adapts to repeated behaviors through synaptic strengthening",
      keywords: ["neuroplasticity", "brain adapts", "synaptic strengthening"],
    },
    {
      time: "05:30",
      title: "Implementation Strategies",
      content: "Practical steps to build sustainable learning routines with specific timing and environmental cues",
      keywords: ["sustainable learning", "environmental cues", "timing"],
    },
  ]

  const quizQuestions = [
    {
      question: "What is the most effective approach for building learning habits?",
      options: ["Long sporadic sessions", "Consistent daily practice", "Weekend marathons", "Random timing"],
      correct: 1,
    },
    {
      question: "What brain mechanism supports habit formation?",
      options: ["Memory consolidation", "Synaptic strengthening", "Neural pruning", "Cognitive load"],
      correct: 1,
    },
  ]

  const [notes, setNotes] = useState([
    { time: "02:15", note: "Key insight about neuroplasticity - practice this daily" },
    { time: "05:30", note: "Remember to set environmental cues for better habits" },
  ])

  const highlightKeywords = (text: string, keywords: string[]) => {
    let highlightedText = text
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi")
      highlightedText = highlightedText.replace(
        regex,
        '<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">$1</span>',
      )
    })
    return highlightedText
  }

  const handleSummarize = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setIsSummarized(true)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute right-0 top-0 h-full flex justify-end pointer-events-auto">
        <Card className="w-[400px] h-full rounded-none border-l-0 shadow-xl bg-white flex flex-col">
          {/* Header with logo and actions */}
          <div className="border-b border-gray-100 bg-white flex-shrink-0 py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/glasses.svg" alt="Rvised" width={20} height={20} className="h-5 w-5" />
                <span className="text-base font-semibold text-gray-900">Rvised</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded">
                  <Copy className="h-3.5 w-3.5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded">
                  <Download className="h-3.5 w-3.5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded">
                  <User className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!isSummarized && !isLoading && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {[
                    { id: "student", icon: BookOpen, active: activeMode === "student" },
                    { id: "build", icon: Settings, active: activeMode === "build" },
                    { id: "deep", icon: Brain, active: activeMode === "deep" },
                    { id: "options", icon: FileText, active: false },
                  ].map(({ id, icon: Icon, active }) => (
                    <button
                      key={id}
                      onClick={() => id !== "options" && setActiveMode(id)}
                      className={`flex items-center justify-center w-12 h-10 rounded-lg border transition-all ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Select value={activeMode} onValueChange={setActiveMode}>
                    <SelectTrigger className="flex-1 h-9 text-sm font-medium border-gray-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="build">Build</SelectItem>
                      <SelectItem value="deep">Deep</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={readingDepth} onValueChange={setReadingDepth}>
                    <SelectTrigger className="flex-1 h-9 text-sm font-medium border-gray-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="flex-1 h-9 text-sm font-medium border-gray-200 bg-white">
                      <SelectValue placeholder="Options" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-3 space-y-2">
                        {[
                          {
                            id: "timestamps",
                            label: "Timestamps",
                            checked: includeTimestamps,
                            onChange: setIncludeTimestamps,
                          },
                          {
                            id: "actionItems",
                            label: "Action items",
                            checked: showActionItems,
                            onChange: setShowActionItems,
                          },
                          { id: "quiz", label: "Quiz", checked: generateQuiz, onChange: setGenerateQuiz },
                          {
                            id: "transcript",
                            label: "Transcript",
                            checked: includeTranscript,
                            onChange: setIncludeTranscript,
                          },
                        ].map(({ id, label, checked, onChange }) => (
                          <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => onChange(e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSummarize}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Summarize video</span>
                  </div>
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Analyzing video...</p>
                </div>
              </div>
            )}

            {isSummarized && (
              <div className="h-full flex flex-col">
                <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Select value={activeMode} onValueChange={setActiveMode}>
                        
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="build">Build</SelectItem>
                          <SelectItem value="deep">Deep</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={readingDepth} onValueChange={setReadingDepth}>
                        
                        <SelectContent>
                          <SelectItem value="quick">Quick 2min</SelectItem>
                          <SelectItem value="standard">Standard 5min</SelectItem>
                          <SelectItem value="detailed">Detailed 10min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select>
                      
                      <SelectContent>
                        <div className="p-3 space-y-2.5">
                          <label className="flex items-center gap-2.5 text-xs cursor-pointer hover:text-gray-900 transition-colors">
                            <input
                              type="checkbox"
                              checked={includeTimestamps}
                              onChange={(e) => setIncludeTimestamps(e.target.checked)}
                              className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium">Timestamps</span>
                          </label>
                          <label className="flex items-center gap-2.5 text-xs cursor-pointer hover:text-gray-900 transition-colors">
                            <input
                              type="checkbox"
                              checked={showActionItems}
                              onChange={(e) => setShowActionItems(e.target.checked)}
                              className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium">Action items</span>
                          </label>
                          <label className="flex items-center gap-2.5 text-xs cursor-pointer hover:text-gray-900 transition-colors">
                            <input
                              type="checkbox"
                              checked={generateQuiz}
                              onChange={(e) => setGenerateQuiz(e.target.checked)}
                              className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium">Quiz</span>
                          </label>
                          <label className="flex items-center gap-2.5 text-xs cursor-pointer hover:text-gray-900 transition-colors">
                            <input
                              type="checkbox"
                              checked={includeTranscript}
                              onChange={(e) => setIncludeTranscript(e.target.checked)}
                              className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium">Transcript</span>
                          </label>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b border-blue-200">
                    <h4 className="font-bold text-lg text-blue-900 mb-3">Key Insight</h4>
                    <p className="text-base font-medium text-blue-800 leading-relaxed">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightKeywords(
                            "Consistent daily practice is more effective than sporadic long sessions for building lasting learning habits.",
                            ["consistent daily practice", "learning habits", "effective"],
                          ),
                        }}
                      />
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {summaryContent.map((item, index) => (
                      <div key={index} className="group cursor-pointer hover:bg-gray-50 p-5 transition-colors">
                        <div className="flex items-start gap-4">
                          {includeTimestamps && (
                            <div className="flex items-center gap-2 text-blue-600 text-xs font-mono bg-blue-50 px-2 py-1 rounded-full flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-base text-gray-900 mb-2">{item.title}</h5>
                            <p
                              className="text-sm text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: highlightKeywords(item.content, item.keywords),
                              }}
                            />
                          </div>
                          <Play className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {showActionItems && (
                    <div className="p-5 bg-amber-50 border-b border-amber-100">
                      <h4 className="font-semibold text-base text-amber-900 mb-3">Action Items</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-amber-800">Start with 15-minute daily learning sessions</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-amber-800">Set up environmental cues in your workspace</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {(generateQuiz || includeTranscript) && (
                    <div className="p-4 border-t border-gray-100 bg-white">
                      <div className="flex gap-2">
                        {generateQuiz && (
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            <Brain className="h-3 w-3 mr-1" />
                            Take Quiz
                          </Button>
                        )}
                        {includeTranscript && (
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            <FileText className="h-3 w-3 mr-1" />
                            View Transcript
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 bg-white p-4 space-y-3 flex-shrink-0">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                      Save to Project
                    </label>
                    <Select>
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Choose project..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learning-habits">Learning Habits</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="new-project">+ Create new project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-medium">
                      Save Summary
                    </Button>
                    <Button variant="outline" className="flex-1 h-9 text-sm font-medium bg-transparent">
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function ExtensionTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
    >
      <Image src="/glasses.svg" alt="Rvised" width={16} height={16} className="h-4 w-4 mr-2" />
      <span>Summarize with Rvised</span>
      <Sparkles className="h-4 w-4 ml-2" />
    </Button>
  )
}
