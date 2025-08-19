'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
              <span className="text-xl font-bold">Rvised</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: August 19, 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Rvised ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Rvised provides AI-powered YouTube video summarization services through:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Web application at rvised.app</li>
              <li>• Chrome browser extension</li>
              <li>• API access (Pro users)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Account Responsibilities:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ You must provide accurate account information</li>
                <li>✓ You are responsible for maintaining account security</li>
                <li>✓ You must be 13 years or older to use the Service</li>
                <li>✓ One person or entity per account</li>
                <li>✓ You're responsible for all activity under your account</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription & Pricing</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Free Tier</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 3 summaries per day</li>
                  <li>• Videos up to 20 minutes</li>
                  <li>• Basic features</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Pro Tier ($8.99/mo)</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Unlimited summaries</li>
                  <li>• Any video length</li>
                  <li>• Priority processing</li>
                  <li>• Export features</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Billing:</strong> Subscriptions auto-renew until cancelled. Prices may change with 30 days notice. 
                No refunds for partial months.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Permitted:</h3>
                <ul className="text-sm space-y-1 text-green-800">
                  <li>✓ Personal educational use</li>
                  <li>✓ Professional research</li>
                  <li>✓ Content creation assistance</li>
                  <li>✓ Study and note-taking</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Prohibited:</h3>
                <ul className="text-sm space-y-1 text-red-800">
                  <li>✗ Illegal or harmful content</li>
                  <li>✗ Copyright infringement</li>
                  <li>✗ Automated/bot usage</li>
                  <li>✗ Reselling summaries</li>
                  <li>✗ Service disruption attempts</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content & Intellectual Property</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-sm text-gray-700">
                  You retain rights to summaries you create. By using Rvised, you grant us license to 
                  process and store your content to provide the Service.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">YouTube Content</h3>
                <p className="text-sm text-gray-700">
                  You must comply with YouTube's Terms of Service. Rvised doesn't download or redistribute 
                  videos, only processes transcripts for summarization.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Our Service</h3>
                <p className="text-sm text-gray-700">
                  Rvised and its original content, features, and functionality are owned by us and 
                  protected by international copyright and trademark laws.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimers & Limitations</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Service Limitations:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Service provided "as is" without warranties</li>
                <li>• AI summaries may contain errors or inaccuracies</li>
                <li>• Not responsible for YouTube content availability</li>
                <li>• No guarantee of uninterrupted service</li>
                <li>• Maximum liability limited to amount paid in last 12 months</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Account Termination</h2>
            <p className="text-gray-700 mb-4">We may terminate or suspend accounts for:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Violation of these Terms</li>
              <li>• Fraudulent or illegal activity</li>
              <li>• Extended inactivity (12+ months)</li>
              <li>• Non-payment of subscription fees</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You may cancel your account anytime from Settings. Upon termination, your right to use 
              the Service ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Modifications to Service</h2>
            <p className="text-gray-700">
              We reserve the right to modify or discontinue the Service at any time. We'll provide 
              30 days notice for significant changes affecting paid features. Continued use after 
              changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-gray-700">
              These Terms are governed by the laws of the United States, without regard to conflict 
              of law provisions. Any disputes shall be resolved in the courts of Delaware.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">For questions about these Terms:</p>
              <ul className="space-y-2">
                <li>Email: support@rvised.app</li>
                <li>Website: https://rvised.app</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found unenforceable, the remaining provisions will 
              continue in full force and effect.
            </p>
          </section>
        </div>

        {/* Agreement Box */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3">By using Rvised, you acknowledge:</h3>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li>✓ You have read and understood these Terms</li>
            <li>✓ You agree to be bound by these Terms</li>
            <li>✓ You are at least 13 years old</li>
            <li>✓ You will use the Service responsibly</li>
          </ul>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rvised
          </Link>
        </div>
      </main>
    </div>
  )
}