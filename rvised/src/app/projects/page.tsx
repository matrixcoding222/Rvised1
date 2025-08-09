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

export default async function ProjectsPage() {
  const items = await fetchSummaries()
  const groups = new Map<string, number>()
  for (const it of items) {
    const key = (it.projectName || 'My Library') as string
    groups.set(key, (groups.get(key) || 0) + 1)
  }
  const projects = Array.from(groups.entries()).sort((a,b)=>b[1]-a[1])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/dashboard" className="text-blue-600">Back to Dashboard</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg col-span-full">No projects yet. Save a summary to create one.</div>
        )}
        {projects.map(([name, count]) => (
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
    </div>
  )
}


