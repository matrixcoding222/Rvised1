import React from 'react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
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

export default async function LibraryPage() {
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
                <nav className="flex space-x-8">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Dashboard</Link>
                  <Link href="/library" className="text-blue-600 font-medium text-sm">Library</Link>
                  <Link href="/projects" className="text-gray-600 hover:text-gray-900 text-sm">Projects</Link>
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
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600" href="/library">
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
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Library</h1>
              <p className="text-gray-600">All your saved YouTube summaries in one place</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Saved Summaries</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{items.length} total</span>
                </div>
                <div className="flex items-center gap-3">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>All Projects</option>
                    <option>My Library</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>Newest First</option>
                    <option>Oldest First</option>
                    <option>A-Z</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {items.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📚</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your library is empty</h3>
                    <p className="text-gray-600 mb-4">Start summarizing YouTube videos with our extension</p>
                    <a href="/extension.zip" download className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Download Extension
                    </a>
                  </div>
                )}
                {items.map((it: any) => (
                  <div key={it.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition">
                    <div className="w-20 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">▶</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={`https://www.youtube.com/watch?v=${it.videoId}`} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                        <h3 className="font-medium text-gray-900 truncate">{it.title}</h3>
                      </a>
                      <p className="text-sm text-gray-600 mt-1">{it.channel || 'YouTube'} • {it.duration || 'Video'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Link href={`/projects/${encodeURIComponent(it.projectName || 'My Library')}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200">
                          📁 {it.projectName || 'My Library'}
                        </Link>
                        <span className="text-xs text-gray-500">Saved {new Date(it.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


