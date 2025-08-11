'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

async function fetchSummaries() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/projects`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.items) ? json.items : []
  } catch {
    return []
  }
}

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const router = useRouter()

  React.useEffect(() => {
    fetchSummaries().then(setItems)
  }, [])
  const groups = new Map<string, number>()
  for (const it of items) {
    const key = (it.projectName || 'My Library') as string
    groups.set(key, (groups.get(key) || 0) + 1)
  }
  const projects = Array.from(groups.entries()).sort((a,b)=>b[1]-a[1])

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      // Redirect to YouTube with project name in mind
      window.open('https://www.youtube.com', '_blank')
      setShowNewProject(false)
      setNewProjectName('')
    }
  }

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
                  <Link href="/projects" className="text-blue-600 font-medium text-sm">Projects</Link>
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
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600" href="/projects">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Projects</span>
            </Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" href="/learning-paths">
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-2">Organize your summaries into projects</p>
              </div>
              <button 
                onClick={() => setShowNewProject(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>
            {/* New Project Modal */}
            {showNewProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Project</h2>
                  <p className="text-gray-600 mb-4">Name your project, then we'll take you to YouTube to start collecting summaries.</p>
                  <input
                    type="text"
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateProject}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Create & Go to YouTube
                    </button>
                    <button
                      onClick={() => {
                        setShowNewProject(false)
                        setNewProjectName('')
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 col-span-full text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📁</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Create your first project to organize your YouTube summaries</p>
                  <button 
                    onClick={() => setShowNewProject(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Project
                  </button>
                </div>
              )}
              {projects.map(([name, count]) => (
                <Link key={name} href={`/projects/${encodeURIComponent(name)}`} className="bg-white p-5 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📁</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-600">{count} {count === 1 ? 'summary' : 'summaries'}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${Math.min(count * 10, 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">In progress</p>
                    <span className="text-gray-400">›</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


