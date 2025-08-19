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
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  const [includeTimestamps, setIncludeTimestamps] = useState(true)
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

  const handleCreateProject = () => {
    console.log("[v0] Creating project:", newProjectName, newProjectDescription)
    setShowCreateProject(false)
    setNewProjectName("")
    setNewProjectDescription("")
  }

  const TopMenuBar = () => (
    <div className="bg-white px-4 py-1 flex-shrink-0">
      <div className="space-y-1">
        {/* Top row - 3 practical buttons */}
        <div className="flex gap-1 justify-start items-center">
          {[
            { id: "summary", icon: FileText, label: "Summary", active: activeTab === "summary" },
            { id: "transcript", icon: BookOpen, label: "Transcript", active: activeTab === "transcript" },
            { id: "dashboard", icon: User, label: "Dashboard", active: activeTab === "dashboard" },
          ].map(({ id, icon: Icon, label, active }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-center gap-1 px-3 h-7 rounded-lg border transition-all ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Bottom row - 3 dropdown menus with emojis */}
        <div className="flex items-center gap-1">
          <Select value={activeMode} onValueChange={setActiveMode}>
            <SelectTrigger className="flex-1 h-6 text-xs font-medium border-gray-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">🎓 Student</SelectItem>
              <SelectItem value="build">🔨 Build</SelectItem>
              <SelectItem value="deep">🧠 Deep</SelectItem>
            </SelectContent>
          </Select>

          <Select value={readingDepth} onValueChange={setReadingDepth}>
            <SelectTrigger className="flex-1 h-6 text-xs font-medium border-gray-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">⚡ Quick</SelectItem>
              <SelectItem value="standard">📖 Standard</SelectItem>
              <SelectItem value="detailed">🔍 Detailed</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="flex-1 h-6 text-xs font-medium border-gray-200 bg-white">
              <SelectValue placeholder="⚙️ Options" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 space-y-1.5">
                {[
                  {
                    id: "timestamps",
                    label: "⏰ Timestamps",
                    checked: includeTimestamps,
                    onChange: setIncludeTimestamps,
                  },
                  { id: "quiz", label: "🧩 Quiz", checked: generateQuiz, onChange: setGenerateQuiz },
                  {
                    id: "transcript",
                    label: "📝 Transcript",
                    checked: includeTranscript,
                    onChange: setIncludeTranscript,
                  },
                ].map(({ id, label, checked, onChange }) => (
                  <label key={id} className="flex items-center gap-2 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onChange(e.target.checked)}
                      className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const SettingsScreen = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-8 w-8 p-0">
            ×
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Learning Modes */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Learning Mode</h4>
          <div className="space-y-2">
            {[
              { id: "student", label: "Student Mode", desc: "Focus on key concepts and understanding" },
              { id: "build", label: "Build Mode", desc: "Practical implementation and action items" },
              { id: "deep", label: "Deep Mode", desc: "Comprehensive analysis and connections" },
            ].map(({ id, label, desc }) => (
              <label key={id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="mode"
                  value={id}
                  checked={activeMode === id}
                  onChange={(e) => setActiveMode(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reading Depth */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reading Depth</h4>
          <div className="space-y-2">
            {[
              { id: "quick", label: "Quick (2 min)", desc: "Essential points only" },
              { id: "standard", label: "Standard (5 min)", desc: "Balanced overview" },
              { id: "detailed", label: "Detailed (10 min)", desc: "Comprehensive breakdown" },
            ].map(({ id, label, desc }) => (
              <label key={id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="depth"
                  value={id}
                  checked={readingDepth === id}
                  onChange={(e) => setReadingDepth(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Content Options */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Content Options</h4>
          <div className="space-y-3">
            {[
              {
                id: "timestamps",
                label: "Include Timestamps",
                checked: includeTimestamps,
                onChange: setIncludeTimestamps,
              },
              { id: "quiz", label: "Generate Quiz", checked: generateQuiz, onChange: setGenerateQuiz },
              {
                id: "transcript",
                label: "Include Transcript",
                checked: includeTranscript,
                onChange: setIncludeTranscript,
              },
            ].map(({ id, label, checked, onChange }) => (
              <label
                key={id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <Button onClick={() => setShowSettings(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Apply Settings
        </Button>
      </div>
    </div>
  )

  const CreateProjectScreen = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Create Project</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateProject(false)} className="h-8 w-8 p-0">
            ×
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter project name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
            placeholder="Describe your project..."
          />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <Button
          onClick={handleCreateProject}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!newProjectName.trim()}
        >
          Create Project
        </Button>
        <Button variant="outline" onClick={() => setShowCreateProject(false)} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute right-0 top-0 h-full flex justify-end pointer-events-auto">
        <Card className="w-[400px] h-full rounded-none border-l-0 shadow-xl bg-white flex flex-col">
          {/* Header with logo and actions */}
          <div className="border-b border-gray-100 bg-white flex-shrink-0 py-1.5 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/images/glasses-icon.png" alt="Rvised" width={20} height={20} className="h-5 w-5" />
                <span className="text-base font-semibold text-gray-900">Rvised</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded">
                  <Copy className="h-3.5 w-3.5 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
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

          {showSettings ? (
            <SettingsScreen />
          ) : showCreateProject ? (
            <CreateProjectScreen />
          ) : (
            <>
              <TopMenuBar />

              <div className="flex-1 overflow-y-auto">
                {!isSummarized && !isLoading && (
                  <div className="p-4">
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

                      {activeTab === "summary" && (
                        <>
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

                          <div className="p-4 border-t border-gray-100">
                            <Button
                              onClick={() => setShowQuiz(!showQuiz)}
                              variant="outline"
                              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              {showQuiz ? "Hide Quiz" : "Create Quiz"}
                            </Button>
                          </div>

                          {showQuiz && (
                            <div className="border-t border-gray-200 bg-gray-50">
                              <div className="p-4">
                                <h4 className="font-semibold text-base text-gray-900 mb-4">Quiz Questions</h4>
                                <div className="space-y-4">
                                  {quizQuestions.map((question, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border">
                                      <h5 className="font-medium text-sm text-gray-900 mb-3">
                                        {index + 1}. {question.question}
                                      </h5>
                                      <div className="space-y-2">
                                        {question.options.map((option, optionIndex) => (
                                          <label
                                            key={optionIndex}
                                            className="flex items-center gap-2 text-sm cursor-pointer"
                                          >
                                            <input
                                              type="radio"
                                              name={`question-${index}`}
                                              className="h-4 w-4 text-blue-600"
                                            />
                                            <span>{option}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === "transcript" && (
                        <div className="p-5 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-semibold text-base text-gray-900 mb-3">Transcript</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">Transcript content goes here.</p>
                        </div>
                      )}

                      {activeTab === "dashboard" && (
                        <div className="p-5 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-semibold text-base text-gray-900 mb-3">Dashboard</h4>
                          <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-sm font-medium text-gray-900 mb-1">Learning Progress</div>
                              <div className="text-xs text-gray-600">5 videos summarized this week</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-sm font-medium text-gray-900 mb-1">Active Projects</div>
                              <div className="text-xs text-gray-600">3 projects in progress</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Select>
                            <SelectTrigger className="flex-1 h-9 text-sm">
                              <SelectValue placeholder="Choose project..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="learning-habits">Learning Habits</SelectItem>
                              <SelectItem value="productivity">Productivity Tips</SelectItem>
                              <SelectItem value="health">Health & Wellness</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => setShowCreateProject(true)}
                            variant="outline"
                            size="sm"
                            className="px-3 h-9 text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            + Create
                          </Button>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9">Save Summary</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export function ExtensionTriggerButton() {
  return (
    <div className="absolute top-4 right-4 z-50">
      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" size="sm">
        <Image src="/images/glasses-icon.png" alt="Rvised" width={16} height={16} className="h-4 w-4 mr-2" />
        Summarize
      </Button>
    </div>
  )
}
