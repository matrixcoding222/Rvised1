import React from 'react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'

export default async function LearningPathsPage() {
  const user = await currentUser()
  
  const suggestedPaths = [
    { id: 1, title: 'Web Development Fundamentals', progress: 65, videos: 12, completed: 8, color: 'from-blue-400 to-blue-600' },
    { id: 2, title: 'Machine Learning Basics', progress: 30, videos: 15, completed: 5, color: 'from-purple-400 to-purple-600' },
    { id: 3, title: 'Digital Marketing', progress: 45, videos: 10, completed: 4, color: 'from-green-400 to-green-600' },
    { id: 4, title: 'UI/UX Design Principles', progress: 0, videos: 8, completed: 0, color: 'from-pink-400 to-pink-600' }
  ]
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-2xl">👓</span>
                <span className="text-xl font-semibold text-gray-900">Rvised</span>
              </Link>
              <div className="hidden md:flex items-center">
                <nav className="flex space-x-8">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Dashboard</Link>
                  <Link href="/library" className="text-gray-600 hover:text-gray-900 text-sm">Library</Link>
                  <Link href="/projects" className="text-gray-600 hover:text-gray-900 text-sm">Projects</Link>
                  <Link href="/learning-paths" className="text-blue-600 font-medium text-sm">Learning Paths</Link>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white h-screen sticky top-16 border-r border-gray-200 hidden md:block">
          <nav className="p-6 space-y-2">
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" href="/dashboard">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" href="/library">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>My Library</span>
            </Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" href="/projects">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Projects</span>
            </Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600" href="/learning-paths">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Learning Paths</span>
            </Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" href="/extension">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <span>Extension</span>
            </Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" href="/settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Learning Paths</h1>
              <p className="text-gray-600">Structured video courses to master new skills</p>
            </div>

            {/* Active Learning Path */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Continue Learning</h2>
                  <p className="text-blue-100">Web Development Fundamentals</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">65%</div>
                  <p className="text-blue-100 text-sm">Complete</p>
                </div>
              </div>
              <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3 mb-4">
                <div className="bg-white rounded-full h-3" style={{ width: '65%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">8 of 12 videos completed</p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  Continue Learning →
                </button>
              </div>
            </div>

            {/* Suggested Paths */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested Learning Paths</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedPaths.map(path => (
                  <div key={path.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">{path.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{path.videos} videos • {Math.round(path.videos * 15)} min total</p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${path.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-white text-xl">🎯</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{path.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${path.color}`} style={{ width: `${path.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{path.completed} videos completed</span>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {path.progress > 0 ? 'Continue' : 'Start'} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Custom Path */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Own Path</h3>
              <p className="text-gray-600 mb-4">Build a custom learning journey from your saved summaries</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Create Custom Path
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


