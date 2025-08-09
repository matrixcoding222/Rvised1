import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-[#FAFBFC] text-gray-900 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/95 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex bg-white border-gray-100 border rounded-xl shadow-sm items-center justify-center">
                <span className="text-sm">👓</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Rvised</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 text-sm">Dashboard</Link>
              <a href="/extension.zip" download className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 transition-all">Download Extension</a>
            </div>
            <Link href="/dashboard" className="md:hidden text-sm text-gray-700">Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-100">
              <span>Chrome Extension • Free Forever</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]">
              YouTube Summaries<br />
              <span className="text-blue-600">Right Where You Watch</span>
            </h1>
            <p className="text-xl text-gray-600 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              Get instant AI summaries of any YouTube video without leaving the page. Save time, stay focused, learn faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
              <a href="/extension.zip" download className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 shadow-xl shadow-blue-500/25">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download Chrome Extension</span>
              </a>
              <Link href="/dashboard" className="group flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all font-medium px-6 py-4">
                <div className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
                  <span className="text-blue-600">▶</span>
                </div>
                <span>Open Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="flex text-yellow-400">⭐⭐⭐⭐⭐</div>
              <span>4.8/5 from 10,000+ users</span>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 text-sm text-gray-600 border border-gray-100">
                    youtube.com/watch?v=dQw4w9WgXcQ
                  </div>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-blue-600 text-4xl">▶</span>
                  </div>
                  <p className="text-gray-500 font-medium text-lg">Extension Demo Preview</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">👓</div>
                <span className="font-semibold text-gray-900 text-lg">Rvised Summary</span>
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-500 rounded-full mt-2" /><p>Key concepts explained in simple terms</p></div>
                <div className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-500 rounded-full mt-2" /><p>Important timestamps and moments</p></div>
                <div className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-500 rounded-full mt-2" /><p>Actionable takeaways and next steps</p></div>
              </div>
              <Link href="/dashboard" className="w-full inline-block text-center bg-blue-600 text-white py-3 rounded-xl text-sm font-medium mt-6 hover:bg-blue-700 transition">Save Summary</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-semibold tracking-tight mb-6">Works on Any YouTube Video</h2>
            <p className="text-gray-600 text-xl">Install once, summarize forever</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white">⬇</div>
              <h3 className="text-2xl font-semibold mb-4">Install Extension</h3>
              <p className="text-gray-600 text-lg">One-click install from Chrome Web Store</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white">▶</div>
              <h3 className="text-2xl font-semibold mb-4">Watch YouTube</h3>
              <p className="text-gray-600 text-lg">Browse YouTube normally - we'll be there</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white">⚡</div>
              <h3 className="text-2xl font-semibold mb-4">Get Instant Summary</h3>
              <p className="text-gray-600 text-lg">Click our button for instant AI summary</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-semibold tracking-tight mb-6">Everything You Need</h2>
            <p className="text-gray-600 text-xl">Powerful features, simple experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              ['Lightning Fast', 'Get summaries in under 5 seconds'],
              ['Save & Organize', 'Access your summaries in web dashboard'],
              ['Key Timestamps', 'Jump to important moments'],
              ['Multiple Formats', 'Bullet points, paragraphs, or key quotes'],
              ['Any Language', 'Works with videos in 50+ languages'],
              ['Privacy First', 'Your data stays secure and private'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-xl mb-3">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-semibold tracking-tight mb-6">Manage Your Learning</h2>
            <p className="text-gray-600 text-xl">Access all your summaries in our web dashboard</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 border border-gray-100 shadow-xl">
            <div className="aspect-video bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-blue-600 text-6xl mb-6">▦</div>
                <p className="text-gray-700 font-semibold text-xl">Dashboard Preview</p>
                <p className="text-gray-500 text-lg mt-3">Search, organize, and revisit your summaries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tight mb-6">Simple Pricing</h2>
          <p className="text-gray-600 text-xl mb-16">Start free, upgrade when you need more</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Free</h3>
              <div className="text-4xl font-bold mb-8">$0<span className="text-xl font-normal text-gray-500">/month</span></div>
              <div className="space-y-4 mb-10 text-left">
                {['5 summaries per day', 'Chrome extension', 'Basic dashboard'].map(x => (
                  <div key={x} className="flex items-center space-x-4"><span className="text-green-500">✔</span><span className="text-gray-600 text-lg">{x}</span></div>
                ))}
              </div>
              <Link href="/extension" className="w-full inline-block text-center border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition">Install Free</Link>
            </div>
            <div className="bg-blue-600 text-white rounded-3xl p-10 shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-8">$4.99<span className="text-xl font-normal text-blue-100">/month</span></div>
              <div className="space-y-4 mb-10 text-left">
                {['Unlimited summaries', 'Advanced formats', 'Full dashboard access'].map(x => (
                  <div key={x} className="flex items-center space-x-4"><span>✔</span><span className="text-lg">{x}</span></div>
                ))}
              </div>
              <Link href="/dashboard" className="w-full inline-block text-center bg-white text-blue-600 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tight mb-8">Start Summarizing Today</h2>
          <p className="text-xl text-gray-600 mb-12">Join 10,000+ users saving hours every week</p>
          <Link href="/extension" className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-5 rounded-xl font-semibold text-xl inline-flex items-center gap-4 mx-auto shadow-xl shadow-blue-500/25">Add to Chrome - It's Free</Link>
          <p className="text-gray-500 text-lg mt-8">✨ No account required to start • 5 daily summaries forever free</p>
        </div>
      </section>
    </div>
  )
}