import React from 'react'
import Link from 'next/link'

export default function ExtensionPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Install the Rvised Extension</h1>
      <p className="text-gray-700">Use our Chrome extension to summarize YouTube videos and save them to your dashboard.</p>
      <ol className="list-decimal pl-5 space-y-2 text-gray-700">
        <li>Clone or download the repo and open Chrome: chrome://extensions</li>
        <li>Enable Developer Mode</li>
        <li>Click "Load unpacked" and select the folder: <code>extensions/rvised-extension</code></li>
        <li>Navigate to a YouTube video and use the popup or page overlay to summarize</li>
      </ol>
      <div className="flex gap-4 pt-2">
        <Link href="/dashboard" className="text-blue-600">Back to Dashboard</Link>
        <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-blue-600">View Source</a>
      </div>
    </div>
  )
}


