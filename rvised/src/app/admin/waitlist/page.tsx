"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Users, Mail, Copy, CheckCircle } from 'lucide-react'
import { APP_CONFIG } from '@/config/app-config'

export default function WaitlistAdminPage() {
  const [emails, setEmails] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [adminSecret, setAdminSecret] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  const fetchWaitlist = async () => {
    try {
      const response = await fetch('/api/waitlist/export', {
        headers: {
          'Authorization': `Bearer ${adminSecret}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
        setCount(data.count || 0)
        setIsAuthorized(true)
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error)
    }
  }

  const downloadCSV = () => {
    window.open(`/api/waitlist/export?format=csv`, '_blank')
  }

  const copyEmails = () => {
    const emailText = emails.join(', ')
    navigator.clipboard.writeText(emailText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendLaunchEmail = () => {
    // This would integrate with your email service
    alert(`Ready to send launch email to ${count} subscribers!\n\nIntegrate with SendGrid, Mailgun, or your preferred email service.`)
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Waitlist Admin</h1>
            <p className="text-gray-600 mb-4">Enter admin secret to view waitlist</p>
            <input
              type="password"
              placeholder="Admin secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && fetchWaitlist()}
            />
            <Button onClick={fetchWaitlist} className="w-full">
              View Waitlist
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Waitlist Dashboard</h1>
          <p className="text-gray-600">
            Manage your waitlist and prepare for launch
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Signups</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Mail className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ready to Email</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-10 w-10 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">App Status</p>
                <p className="text-xl font-bold">
                  {APP_CONFIG.mode === 'waitlist' ? 'Waitlist Mode' : 'Live'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={downloadCSV} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
            <Button onClick={copyEmails} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copied!' : 'Copy All Emails'}
            </Button>
            <Button onClick={sendLaunchEmail} className="bg-green-600 hover:bg-green-700">
              <Mail className="mr-2 h-4 w-4" />
              Send Launch Email
            </Button>
          </div>
        </Card>

        {/* Email List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Email List ({count})</h2>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  {email}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-bold mb-2">🚀 When Your Extension is Approved:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Update <code className="bg-white px-2 py-1 rounded">src/config/app-config.ts</code></li>
            <li>Change mode from 'waitlist' to 'live'</li>
            <li>Add your Chrome Extension URL</li>
            <li>Deploy the update</li>
            <li>Send launch email to all {count} subscribers!</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}