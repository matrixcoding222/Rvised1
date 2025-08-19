"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, BookOpen, Clock, Chrome, Target, Lightbulb, Timer, FolderOpen, ArrowRight } from "lucide-react"
import { SignUpModal } from "@/components/sign-up-modal"
import { EmailCollectionFlow } from "@/components/email-collection-flow"

export function HeroSection() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showEmailFlow, setShowEmailFlow] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  const handleEmailSignUp = () => {
    setShowEmailFlow(true)
  }

  const handleEmailSubmitted = (email: string) => {
    console.log("Email submitted:", email)
  }

  const handleBackToModal = () => {
    setShowEmailFlow(false)
    setShowSignUpModal(true)
  }

  if (showEmailFlow) {
    return <EmailCollectionFlow onBack={handleBackToModal} onEmailSubmitted={handleEmailSubmitted} />
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="mb-8 flex">
                <div className="rounded-full bg-primary/10 p-4">
                  <img src="/glasses.svg" alt="Rvised" className="h-10 w-10" />
                </div>
              </div>

              <h1 className="mb-8 text-5xl font-bold tracking-tight lg:text-7xl font-mono leading-tight">
                Stop watching. <br />
                Start <span className="text-primary">learning</span>.
              </h1>

              <p className="mb-10 text-xl text-muted-foreground leading-relaxed max-w-xl">
                Turn any YouTube video into structured learning with AI-powered summaries, quizzes, and knowledge
                tracking. Learn 5x faster, remember 80% more.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="h-16 px-10 bg-primary hover:bg-primary/90 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <Chrome className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                  Get Rvised Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">100% Free</span> • Works instantly • No signup required •
                50,000+ students learning smarter
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Demo Video</p>
                <p className="text-sm">See Rvised in action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className="w-full bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Watch it work in real-time</h2>
            <p className="text-xl text-muted-foreground">
              See how Rvised transforms a 2-hour Huberman Lab episode into actionable insights
            </p>
          </div>

          {/* Browser Window Mockup */}
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
                    youtube.com/watch?v=SwQhKFMxmDY
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex">
                {/* Left Side - YouTube Video */}
                <div className="flex-1 p-6">
                  <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
                    <img
                      src="/placeholder.svg?height=400&width=600"
                      alt="Huberman Lab Episode"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-4 py-2 rounded">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    The Science of Learning & Memory | Huberman Lab Podcast
                  </h3>
                  <p className="text-sm text-gray-600">Andrew Huberman • 2.1M views • 3 weeks ago</p>
                </div>

                {/* Right Side - Rvised Panel */}
                <div className="w-96 border-l bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <img src="/glasses.svg" alt="Rvised" className="h-6 w-6" />
                      <span className="font-semibold text-primary">Rvised</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b mb-4">
                      <button
                        onClick={() => setActiveTab("summary")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === "summary"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => setActiveTab("quiz")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === "quiz"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Quiz
                      </button>
                      <button
                        onClick={() => setActiveTab("saved")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === "saved"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Saved
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4 text-sm">
                      {activeTab === "summary" && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="font-semibold">Main Takeaway</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              The brain learns best through active recall and spaced repetition, not passive watching.
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              <span className="font-semibold">Key Points</span>
                            </div>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Active recall beats passive review by 50%</li>
                              <li>• Test yourself immediately after learning</li>
                              <li>• Space out practice sessions</li>
                              <li>• Focus on one concept at a time</li>
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="h-4 w-4 text-primary" />
                              <span className="font-semibold">Jump to Section</span>
                            </div>
                            <div className="space-y-1">
                              <button className="block text-left text-primary hover:underline transition-colors">
                                [0:00] Why we forget
                              </button>
                              <button className="block text-left text-primary hover:underline transition-colors">
                                [3:45] The science of active recall
                              </button>
                              <button className="block text-left text-primary hover:underline transition-colors">
                                [7:20] Implementing spaced repetition
                              </button>
                              <button className="block text-left text-primary hover:underline transition-colors">
                                [12:00] Common mistakes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "quiz" && (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Test your understanding</h4>
                          <div className="space-y-3">
                            <p className="font-medium">Q: What's the most effective learning method?</p>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                                <input type="radio" name="quiz" className="text-primary" />
                                <span>Re-reading</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                                <input type="radio" name="quiz" className="text-primary" />
                                <span>Highlighting</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer bg-primary/10 p-1 rounded">
                                <input type="radio" name="quiz" className="text-primary" checked readOnly />
                                <span className="font-medium">Active recall</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                                <input type="radio" name="quiz" className="text-primary" />
                                <span>Summarizing</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "saved" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <FolderOpen className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Added to project</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                              <span className="font-medium">Neuroscience</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">3 videos saved</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Captions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
              <div>
                <h4 className="font-semibold text-lg mb-2">Instant AI summaries</h4>
                <p className="text-gray-600">Get key insights in under 30 seconds</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Active recall testing</h4>
                <p className="text-gray-600">Boost retention with smart quizzes</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Personal knowledge vault</h4>
                <p className="text-gray-600">Build your learning library over time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Learn smarter, not harder</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who've transformed their learning with Rvised
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Save 5+ hours weekly</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Extract key insights from 2-hour videos in just 5 minutes
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Remember 3x more</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Active learning techniques proven by cognitive science
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Chrome className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Works everywhere</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                One click on any YouTube video - no setup required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-5xl font-bold mb-8 font-mono">Start learning effectively today</h2>

            <div className="mb-6">
              <Button
                size="lg"
                className="h-16 px-12 bg-primary hover:bg-primary/90 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <Chrome className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                Add to Chrome - It's Free
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-primary">5 free summaries daily</span> • No credit card required •
              Join 50,000+ learners
            </p>
          </div>
        </div>
      </section>

      <SignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} onEmailSignUp={handleEmailSignUp} />
    </>
  )
}
