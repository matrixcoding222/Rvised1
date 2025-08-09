/*
  Dashboard page: Renders the provided HTML with minimal React/Tailwind adjustments.
  Fetches saved summaries from /api/projects and displays basic Recent Summaries.
*/
import React from 'react'
import Link from 'next/link'

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-semibold text-gray-900">Rvised</div>
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
              <Link href="/" className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">S</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white h-screen sticky top-16 border-r border-gray-200 hidden md:block">
          <nav className="p-6 space-y-2">
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600" href="/dashboard">Dashboard</Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900" href="/library">My Library</Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900" href="/projects">Projects</Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900" href="/learning-paths">Learning Paths</Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900" href="/extension">Extension</Link>
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900" href="/settings">Settings</Link>
          </nav>
          <div className="p-6 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">🧩</div>
              <h3 className="font-medium text-gray-900 mb-2">Get the Extension</h3>
              <p className="text-sm text-gray-600 mb-3">Summarize YouTube videos instantly while you watch</p>
              <Link href="/extension" className="w-full inline-block text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">Install Extension</Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Good morning!</h1>
            <p className="text-gray-600">Your saved summaries are below</p>
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


