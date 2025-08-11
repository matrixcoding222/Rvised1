import React from 'react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'

export default async function SettingsPage() {
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
                  <Link href="/library" className="text-gray-600 hover:text-gray-900 text-sm">Library</Link>
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
            <Link className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600" href="/settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="text-gray-900 font-mono text-sm">{user?.id}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-gray-900 font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Manage your Clerk account settings</p>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "w-full"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action label="Manage Account" />
                  <UserButton.Action label="Sign Out" />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-gray-900 font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates about new features</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-gray-900 font-medium">Summary Format</p>
                  <p className="text-sm text-gray-600">Default format for AI summaries</p>
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Bullet Points</option>
                  <option>Paragraphs</option>
                  <option>Key Quotes</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-gray-900 font-medium">Auto-save Summaries</p>
                  <p className="text-sm text-gray-600">Automatically save summaries to library</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Extension Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Extension Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-gray-900 font-medium">Extension Status</p>
                  <p className="text-sm text-green-600">Installed and Active</p>
                </div>
                <a href="/extension.zip" download className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                  Re-download
                </a>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-gray-900 font-medium">Show Summary Button</p>
                  <p className="text-sm text-gray-600">Display button on YouTube videos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-gray-900 font-medium">Delete Account</p>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


