"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import demoData from "@/demo-summaries-complete.json"

export function ExtensionDemoEnhanced() {
  const [activeMode, setActiveMode] = useState('student')
  const [readingDepth, setReadingDepth] = useState('standard')
  const [learningStyle, setLearningStyle] = useState('')
  const [activeTab, setActiveTab] = useState('summary')
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})

  const userEmail = "demo@rvised.app"
  const userTier = "pro"
  const videoTitle = demoData.metadata.videoTitle
  const channelName = demoData.metadata.channel

  // Get current summary based on selections
  const getCurrentSummary = () => {
    if (learningStyle && demoData.learningStyles[learningStyle as keyof typeof demoData.learningStyles]) {
      return demoData.learningStyles[learningStyle as keyof typeof demoData.learningStyles]
    }
    
    const modeData = demoData.modes[activeMode as keyof typeof demoData.modes]
    if (modeData && modeData[readingDepth as keyof typeof modeData]) {
      return modeData[readingDepth as keyof typeof modeData]
    }
    
    // Fallback to standard
    return demoData.modes.student.standard
  }

  const currentSummary = getCurrentSummary()

  // Helper functions
  const extractKeywords = (text: string) => {
    const importantWords = ['build', 'create', 'learn', 'implement', 'design', 'develop', 'understand', 'AI', 'app', 'platform']
    const words = text.toLowerCase().split(/\s+/)
    const keywords: string[] = []
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/gi, '')
      if (importantWords.includes(cleanWord) && cleanWord.length > 2 && !keywords.includes(cleanWord)) {
        keywords.push(cleanWord)
      }
    })
    
    return keywords.slice(0, 10)
  }

  const highlightKeywords = (text: string, keywords: string[]) => {
    let highlightedText = text
    if (keywords && keywords.length > 0) {
      keywords.sort((a, b) => b.length - a.length)
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b(${keyword})\\b`, "gi")
        highlightedText = highlightedText.replace(
          regex,
          '<span style="background: rgba(59, 130, 246, 0.06); color: #2563eb; border-bottom: 1px solid rgba(59, 130, 246, 0.15); font-weight: 700; padding: 1px 4px; border-radius: 3px; margin: 0 1px;">$1</span>'
        )
      })
    }
    return highlightedText
  }

  const handleQuizAnswer = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIdx]: optionIdx })
  }

  const getStructuredSummary = () => {
    const sections = []
    const mode = activeMode
    
    const sectionTitles = {
      student: {
        insights: '📚 What You\'ll Learn',
        actions: '✏️ Practice Steps',
      },
      build: {
        insights: '🛠️ Implementation Steps',
        actions: '🚀 Action Items',
      },
      deep: {
        insights: '💡 Strategic Insights',
        actions: '📊 Strategic Decisions',
      }
    }
    
    const titles = sectionTitles[mode as keyof typeof sectionTitles] || sectionTitles.student
    
    if (currentSummary.keyInsights && currentSummary.keyInsights.length > 0) {
      sections.push({
        title: titles.insights,
        items: currentSummary.keyInsights.map((insight: string) => ({
          type: 'secondary',
          icon: 'bullet',
          color: '#60a5fa',
          content: includeEmojis ? highlightKeywords(insight, extractKeywords(insight)) : highlightKeywords(insight.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''), extractKeywords(insight))
        }))
      })
    }
    
    if (includeTimestamps && demoData.metadata.timestampedSections) {
      sections.push({
        title: '⏰ Video Timeline',
        items: demoData.metadata.timestampedSections.map(section => ({
          type: 'timestamp',
          icon: 'time',
          color: '#3b82f6',
          content: section.description,
          metadata: section.time
        })),
        isTimeline: true
      })
    }
    
    if (currentSummary.actionItems && currentSummary.actionItems.length > 0) {
      sections.push({
        title: titles.actions,
        items: currentSummary.actionItems.map((action: string) => ({
          type: 'action',
          icon: 'check',
          color: '#52c41a',
          content: includeEmojis ? action : action.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        }))
      })
    }
    
    return { sections }
  }

  const summaryStructure = getStructuredSummary()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white rounded px-3 py-1 text-sm text-gray-600">
              youtube.com/watch?v={demoData.metadata.videoId}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Left Side - YouTube Video */}
          <div className="flex-1 p-6">
            <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${demoData.metadata.videoId}`}
                title={videoTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">{videoTitle}</h3>
            <p className="text-sm text-gray-600">{channelName} • 1.2M views • 3 weeks ago</p>
          </div>

          {/* Right Side - Extension */}
          <div className="w-[400px] h-[600px] rounded-none border-l shadow-xl bg-white flex flex-col overflow-hidden relative">
            {showSettings ? (
              // Settings Screen
              <div className="h-full flex flex-col bg-white">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="w-8 h-8 text-2xl text-gray-600">×</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-6">
                    {/* Learning Mode */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Learning Mode</h4>
                      <div className="space-y-2">
                        {['student', 'build', 'deep'].map(mode => (
                          <label key={mode} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${activeMode === mode ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}>
                            <input 
                              type="radio" 
                              name="mode" 
                              checked={activeMode === mode}
                              onChange={() => {setActiveMode(mode); setLearningStyle('')}}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {mode === 'student' ? '🎓 Student Mode' : mode === 'build' ? '🔨 Build Mode' : '🧠 Deep Mode'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {mode === 'student' ? 'Focus on key concepts and understanding' : 
                                 mode === 'build' ? 'Practical implementation and action items' : 
                                 'Comprehensive analysis and connections'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Reading Depth */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Reading Depth</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'brief', label: '⚡ Brief', desc: 'Quick 2-minute overview' },
                          { value: 'standard', label: '📖 Standard', desc: 'Balanced 5-minute summary' },
                          { value: 'detailed', label: '🔍 Detailed', desc: 'Thorough 10-minute analysis' },
                          { value: 'comprehensive', label: '📚 Comprehensive', desc: 'Complete 15-minute deep dive' }
                        ].map(depth => (
                          <label key={depth.value} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${readingDepth === depth.value && !learningStyle ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}>
                            <input 
                              type="radio" 
                              name="depth" 
                              checked={readingDepth === depth.value && !learningStyle}
                              onChange={() => {setReadingDepth(depth.value); setLearningStyle('')}}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{depth.label}</div>
                              <div className="text-xs text-gray-600 mt-1">{depth.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Learning Style */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Learning Style</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'visual', label: '👁️ Visual', desc: 'Learn through diagrams and visuals' },
                          { value: 'readingWriting', label: '📝 Reading/Writing', desc: 'Learn through text and notes' },
                          { value: 'auditory', label: '🎧 Auditory', desc: 'Learn through listening and discussion' },
                          { value: 'kinesthetic', label: '🤹 Kinesthetic', desc: 'Learn through hands-on practice' }
                        ].map(style => (
                          <label key={style.value} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${learningStyle === style.value ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}>
                            <input 
                              type="radio" 
                              name="style" 
                              checked={learningStyle === style.value}
                              onChange={() => setLearningStyle(style.value)}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{style.label}</div>
                              <div className="text-xs text-gray-600 mt-1">{style.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : showCreateProject ? (
              // Create Project Screen
              <div className="h-full flex flex-col bg-white">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Create Project</h3>
                    <button onClick={() => setShowCreateProject(false)} className="w-8 h-8 text-2xl text-gray-600">×</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter project name..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea className="w-full p-2 border border-gray-300 rounded-lg h-24 resize-none" placeholder="Describe your project..." />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 p-4">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold mb-2">Create Project</button>
                  <button onClick={() => setShowCreateProject(false)} className="w-full bg-white text-gray-700 py-2 rounded-lg border border-gray-300 font-semibold">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="border-b border-gray-100 bg-white px-4 py-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image src="/glasses.svg" alt="Rvised" width={20} height={20} />
                      <span className="text-base font-semibold text-gray-900">Rvised</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded" title="Copy Summary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => setShowSettings(!showSettings)} title="Settings">
                        <svg width="16" height="16" viewBox="0 0 512 512" fill="#6b7280">
                          <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"/>
                        </svg>
                      </button>
                      <button 
                        className="p-1.5 hover:bg-gray-100 rounded relative" 
                        title="Profile"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </button>
                      {showProfileDropdown && (
                        <div className="absolute top-10 right-4 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] z-50">
                          <div className="p-2 border-b border-gray-100">
                            <div className="text-[10px] text-gray-500 mb-1">Signed in as</div>
                            <div className="text-xs font-semibold text-gray-900">{userEmail}</div>
                            <div className="mt-1 flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${userTier === 'pro' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                              <span className={`text-[10px] font-medium ${userTier === 'pro' ? 'text-green-600' : 'text-gray-600'}`}>
                                {userTier === 'pro' ? 'Pro' : 'Free'}
                              </span>
                            </div>
                          </div>
                          <div className="p-1">
                            <button className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded">Dashboard</button>
                            {userTier === 'free' && (
                              <button className="w-full text-left px-2 py-1.5 text-xs text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded font-semibold">
                                Upgrade
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded">Sign Out</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Menu Bar */}
                <div className="bg-gradient-to-b from-gray-50 to-white px-2.5 py-2.5 border-b border-gray-100">
                  <div className="flex flex-col gap-2">
                    {/* Tab buttons */}
                    <div className="flex gap-1.5">
                      {['summary', 'quiz'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1.5 h-auto min-h-[42px] rounded-lg border-[1.5px] font-semibold text-[11px] uppercase tracking-wider transition-all ${
                            activeTab === tab 
                              ? 'bg-gradient-to-b from-blue-50 to-blue-100 border-blue-500 text-blue-700 shadow-sm' 
                              : 'bg-white border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {tab === 'summary' && (
                              <>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </>
                            )}
                            {tab === 'quiz' && (
                              <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
                            )}
                          </svg>
                          <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                        </button>
                      ))}
                      <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1.5 h-auto min-h-[42px] rounded-lg border-[1.5px] bg-white border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200 font-semibold text-[11px] uppercase tracking-wider transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                        </svg>
                        <span>Dashboard</span>
                      </button>
                    </div>

                    {/* Dropdown selects */}
                    <div className="flex gap-1">
                      <select 
                        className="flex-1 h-6 text-xs border border-gray-200 rounded-md px-2 bg-white"
                        value={learningStyle || activeMode}
                        onChange={(e) => {
                          if (['visual', 'readingWriting', 'auditory', 'kinesthetic'].includes(e.target.value)) {
                            setLearningStyle(e.target.value)
                          } else {
                            setActiveMode(e.target.value)
                            setLearningStyle('')
                          }
                        }}
                      >
                        <optgroup label="Learning Modes">
                          <option value="student">🎓 Student</option>
                          <option value="build">🔨 Build</option>
                          <option value="deep">🧠 Deep</option>
                        </optgroup>
                        <optgroup label="Learning Styles">
                          <option value="visual">👁️ Visual</option>
                          <option value="readingWriting">📝 Reading/Writing</option>
                          <option value="auditory">🎧 Auditory</option>
                          <option value="kinesthetic">🤹 Kinesthetic</option>
                        </optgroup>
                      </select>
                      <select 
                        className="flex-1 h-6 text-xs border border-gray-200 rounded-md px-2 bg-white" 
                        value={readingDepth} 
                        onChange={(e) => {setReadingDepth(e.target.value); setLearningStyle('')}}
                        disabled={!!learningStyle}
                      >
                        <option value="brief">⚡ Brief</option>
                        <option value="standard">📖 Standard</option>
                        <option value="detailed">🔍 Detailed</option>
                        <option value="comprehensive">📚 Comprehensive</option>
                      </select>
                      <button 
                        className="flex-1 h-6 text-xs border border-gray-200 rounded-md px-2 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 relative"
                        onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                      >
                        ⚙️ Options
                      </button>
                      {showOptionsDropdown && (
                        <div className="absolute top-[135px] right-4 bg-white border border-gray-200 rounded shadow-md min-w-[120px] z-50">
                          <label className="flex items-center gap-1 px-1.5 py-1 cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" checked={includeTimestamps} onChange={(e) => setIncludeTimestamps(e.target.checked)} className="w-3 h-3" />
                            <span className="text-[10px] text-gray-700">⏰ Timestamp</span>
                          </label>
                          <label className="flex items-center gap-1 px-1.5 py-1 cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} className="w-3 h-3" />
                            <span className="text-[10px] text-gray-700">😊 Emoji Toggle</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-white" style={{ paddingBottom: '120px' }}>
                  {activeTab === 'summary' && (
                    <>
                      {/* Regenerate Button */}
                      <div className="p-2.5 bg-gray-50 border-b border-gray-200">
                        <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border-[1.5px] border-gray-300 rounded-lg text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M1 4v6h6M23 20v-6h-6"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                          </svg>
                          Regenerate Summary
                        </button>
                      </div>

                      {/* Current Settings Display */}
                      {learningStyle && (
                        <div className="m-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <strong>Learning Style Mode:</strong> {learningStyle === 'readingWriting' ? 'Reading/Writing' : learningStyle.charAt(0).toUpperCase() + learningStyle.slice(1)}
                          </p>
                        </div>
                      )}

                      {/* Core Principle Box */}
                      <div className="m-3 p-3.5 bg-white border border-gray-200 rounded-lg relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-400 rounded-md flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                              <path d="M12 2L2 19l10 3 10-3L12 2z"/>
                            </svg>
                          </div>
                          <h1 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Core Principle</h1>
                        </div>
                        <div 
                          className="text-sm font-semibold text-gray-900 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: highlightKeywords(
                            includeEmojis ? currentSummary.mainTakeaway : currentSummary.mainTakeaway.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''), 
                            extractKeywords(currentSummary.mainTakeaway)
                          ) }}
                        />
                      </div>

                      {/* Structured Content Sections */}
                      <div className="px-5 py-4">
                        {summaryStructure.sections.map((section, sectionIndex) => (
                          <section key={sectionIndex} className="mb-3.5">
                            <h2 className="text-base font-bold text-gray-900 mb-2.5">{section.title}</h2>
                            {section.isTimeline ? (
                              <div className="grid grid-cols-2 gap-2">
                                {section.items.map((item, itemIndex) => (
                                  <div 
                                    key={itemIndex}
                                    className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg cursor-pointer hover:from-blue-50 hover:to-blue-100 hover:border-blue-500 transition-all"
                                  >
                                    <div className="text-sm font-semibold text-blue-600 mb-1">{item.metadata}</div>
                                    <div className="text-xs text-gray-700 line-clamp-2">{item.content}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {section.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start gap-3 pl-2 hover:translate-x-1 transition-transform">
                                    <span className="inline-flex items-center justify-center w-5 h-5 mt-0.5 flex-shrink-0">
                                      {item.icon === 'check' ? (
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill={item.color}>
                                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                                        </svg>
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }}></span>
                                      )}
                                    </span>
                                    <div className="flex-1">
                                      <p 
                                        className="text-sm text-gray-900 leading-relaxed font-medium"
                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                      />
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'quiz' && (
                    <div className="p-5">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                          <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
                        </svg>
                        Test Your Knowledge
                      </h3>
                      <div className="space-y-5">
                        {demoData.metadata.quiz.map((q, idx) => (
                          <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Question {idx + 1}: {q.question}
                            </h4>
                            <div className="space-y-2.5">
                              {q.options.map((option, optIdx) => {
                                const isSelected = selectedAnswers[idx] === optIdx
                                const isCorrect = q.correct === optIdx
                                const showResult = selectedAnswers[idx] !== undefined
                                
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleQuizAnswer(idx, optIdx)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                                      showResult && isCorrect ? 'bg-green-50 border-green-500' :
                                      showResult && isSelected && !isCorrect ? 'bg-red-50 border-red-500' :
                                      isSelected ? 'bg-blue-50 border-blue-500' :
                                      'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      showResult && isCorrect ? 'border-green-500 bg-green-500' :
                                      showResult && isSelected && !isCorrect ? 'border-red-500 bg-red-500' :
                                      isSelected ? 'border-blue-500 bg-blue-500' :
                                      'border-gray-300 bg-white'
                                    }`}>
                                      {(showResult && isCorrect) || (isSelected && !showResult) ? (
                                        <span className="text-white text-xs">✓</span>
                                      ) : showResult && isSelected && !isCorrect ? (
                                        <span className="text-white text-xs">✗</span>
                                      ) : null}
                                    </span>
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </button>
                                )
                              })}
                            </div>
                            {selectedAnswers[idx] !== undefined && (
                              <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                                selectedAnswers[idx] === q.correct 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedAnswers[idx] === q.correct ? '✅ Correct!' : '❌ Incorrect. Try again!'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer - Fixed at bottom of extension */}
                <div className="border-t border-gray-200 bg-white px-4 py-3.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] mt-auto">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <select className="flex-1 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm">
                        <option>Choose project...</option>
                        <option>Learning Habits</option>
                        <option>Productivity Tips</option>
                      </select>
                      <button 
                        onClick={() => setShowCreateProject(true)}
                        className="px-3 h-9 border border-blue-300 text-blue-600 bg-blue-50 rounded-lg text-sm font-semibold hover:bg-blue-100"
                      >
                        + Create
                      </button>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-lg font-semibold">
                      Save Summary
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}