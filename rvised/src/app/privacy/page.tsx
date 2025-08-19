'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: August 19, 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Rvised ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              YouTube video summarization service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Account Information:</strong> Email address and name (via Clerk authentication)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Usage Data:</strong> YouTube video URLs you choose to summarize</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Content:</strong> Generated summaries, notes, and quiz responses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Preferences:</strong> Summary settings (mode, depth, format)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Payment Information:</strong> Processed securely via Stripe (we don't store card details)</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">We Use Data To:</h3>
                <ul className="text-sm space-y-1 text-green-800">
                  <li>✓ Provide AI summarization services</li>
                  <li>✓ Save and organize your summaries</li>
                  <li>✓ Process payments and subscriptions</li>
                  <li>✓ Improve our AI models and features</li>
                  <li>✓ Provide customer support</li>
                  <li>✓ Send important service updates</li>
                </ul>
              </div>
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">We Never:</h3>
                <ul className="text-sm space-y-1 text-red-800">
                  <li>✗ Sell your data to third parties</li>
                  <li>✗ Share your summaries publicly</li>
                  <li>✗ Use your data for advertising</li>
                  <li>✗ Access videos you don't summarize</li>
                  <li>✗ Send spam or marketing emails</li>
                  <li>✗ Share data without your consent</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Storage & Security</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <span>All data is encrypted in transit and at rest</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <span>Summaries are stored privately in Supabase (PostgreSQL)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <span>Authentication handled securely by Clerk</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <span>Payment processing secured by Stripe (PCI compliant)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <span>Regular security audits and updates</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have full control over your data:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Access & Export</h3>
                <p className="text-sm text-gray-600">Download all your summaries and data anytime from your dashboard</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Delete</h3>
                <p className="text-sm text-gray-600">Delete individual summaries or your entire account permanently</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Modify</h3>
                <p className="text-sm text-gray-600">Edit or update your summaries and preferences at any time</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Portability</h3>
                <p className="text-sm text-gray-600">Export summaries in PDF or Markdown format</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">We use trusted third-party services to operate:</p>
            <ul className="space-y-2">
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>Stripe:</strong> Payment processing (PCI compliant)</li>
              <li><strong>Supabase:</strong> Database hosting</li>
              <li><strong>OpenAI:</strong> AI summarization (content processed, not stored)</li>
              <li><strong>Vercel:</strong> Application hosting</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Each service has its own privacy policy and security measures. We only share the minimum 
              necessary data with these services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• We retain your data only while your account is active</li>
              <li>• Deleted summaries are permanently removed within 30 days</li>
              <li>• Account deletion removes all associated data</li>
              <li>• Backup data is purged within 90 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this privacy policy periodically. We'll notify you of significant changes 
              via email or through the application. Continued use of Rvised after changes constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                If you have questions about this privacy policy or your data:
              </p>
              <ul className="space-y-2">
                <li>Email: support@rvised.app</li>
                <li>Website: https://rvised.app</li>
              </ul>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-4">Chrome Extension Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Chrome extension follows the same privacy principles:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Only accesses YouTube pages when you activate it</li>
              <li>• Doesn't track browsing history</li>
              <li>• Doesn't inject ads or tracking scripts</li>
              <li>• Only sends video data when you request a summary</li>
              <li>• All extension data syncs with your Rvised account</li>
            </ul>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
          <p className="text-gray-700 mb-4">
            Your privacy is our priority. We're committed to transparency and giving you control over your data.
          </p>
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