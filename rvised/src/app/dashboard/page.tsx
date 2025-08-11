/*
  Dashboard page: Renders the provided HTML with minimal React/Tailwind adjustments.
  Fetches saved summaries from /api/projects and displays basic Recent Summaries.
*/
import React from 'react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'

async function fetchSummaries() {
  try {
    const res = await fetch(`/api/projects`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.items) ? json.items : []
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const items = await fetchSummaries()
  const user = await currentUser()

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
                <div className="relative">
                  <input type="text" placeholder="Search summaries..." className="pl-3 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 text-sm font-medium">
                <span>Create summaries on YouTube with our extension</span>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white h-screen sticky top-16 border-r border-gray-200 hidden md:block">
          <nav className="p-6 space-y-2">
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600" href="/dashboard">
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
          <div className="p-6 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-lg">👓</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Get the Extension</h3>
              <p className="text-sm text-gray-600 mb-3">Summarize YouTube videos instantly while you watch</p>
              <Link href="/extension" className="w-full inline-block text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">Install Extension</Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
            <p className="text-gray-600">Your saved summaries and projects</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Summaries</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{items.length} total</span>
                <Link href="/library" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Library</Link>
              </div>
            </div>
            <div className="space-y-4">
              {items.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">No summaries yet. Use the Chrome extension and click Save to Project.</p>
                </div>
              )}
              {items.map((it: any) => (
                <a key={it.id} href={`https://www.youtube.com/watch?v=${it.videoId}`} target="_blank" rel="noreferrer" className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="w-16 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">▶</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{it.title}</h3>
                    <p className="text-sm text-gray-600">{it.channel || 'YouTube'} • {it.duration || ''}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Link href={`/projects/${encodeURIComponent(it.projectName || 'My Library')}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{it.projectName}</Link>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
              <Link href="/projects" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2">+ New Project</Link>
            </div>
            {/* Simple preview: derive top 3 projects by count */}
            {/* This section intentionally minimal; full grid on /projects */}
            <ProjectPreview />
          </div>

        </main>
      </div>
    </div>
  )
}

async function fetchAllSummaries() {
  try {
    const res = await fetch(`/api/projects`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.items) ? json.items : []
  } catch {
    return []
  }
}

async function ProjectPreview() {
  const items = await fetchAllSummaries()
  const counts = new Map<string, number>()
  for (const it of items) {
    const key = (it.projectName || 'My Library') as string
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  const top = Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,3)
  if (top.length === 0) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {top.map(([name, count]) => (
        <Link key={name} href={`/projects/${encodeURIComponent(name)}`} className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📁</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{name}</h3>
              <p className="text-sm text-gray-600">{count} summaries</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="h-2 rounded-full" style={{ width: '60%', background: 'linear-gradient(90deg, #007AFF 0%, #34C759 100%)' }} />
          </div>
          <p className="text-sm text-gray-600">In progress</p>
        </Link>
      ))}
    </div>
  )
}


