import React from 'react'
import Link from 'next/link'

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
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Library</h1>
        <Link href="/dashboard" className="text-blue-600">Back to Dashboard</Link>
      </div>
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">No summaries yet.</div>
        )}
        {items.map((it: any) => (
          <a key={it.id} href={`https://www.youtube.com/watch?v=${it.videoId}`} target="_blank" rel="noreferrer" className="flex items-center space-x-4 p-4 bg-white border rounded-lg hover:bg-gray-50 transition">
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
          </a>
        ))}
      </div>
    </div>
  )
}


