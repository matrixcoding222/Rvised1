"use client"

import { ChromeExtensionOverlay, ExtensionTriggerButton } from "@/components/chrome-extension-overlay"

export default function ExtensionDemoPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Simulated YouTube Interface */}
      <div className="relative">
        {/* Fake YouTube Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
          <div className="text-xl font-bold text-red-600">YouTube</div>
          <div className="flex-1 max-w-2xl">
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500">Search YouTube</div>
          </div>
        </div>

        {/* Main Content Area with Video and Extension */}
        <div className="flex">
          {/* Video Player Area */}
          <div className="flex-1 bg-black">
            <div className="aspect-video relative max-w-4xl">
              {/* Fake Video Player */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">How to Build Better Learning Habits</h2>
                  <p className="text-gray-300">Andrew Huberman • 2.1M views • 3 days ago</p>
                </div>
              </div>

              {/* Extension Trigger Buttons */}
              <div className="absolute bottom-4 right-4">
                <ExtensionTriggerButton onClick={() => {}} />
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white p-4">
              <h1 className="text-xl font-semibold mb-2">How to Build Better Learning Habits</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>2,134,567 views</span>
                <span>•</span>
                <span>3 days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium">Andrew Huberman</div>
                    <div className="text-sm text-gray-600">3.2M subscribers</div>
                  </div>
                </div>
                {/* Small Extension Button in Channel Area */}
                <div className="flex items-center gap-2">
                  <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 p-2 rounded-full shadow-sm">
                    <span className="text-sm">🤓</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Instructions */}
            
          </div>

          {/* Extension Overlay - Always Open */}
          <div className="w-[400px] flex-shrink-0">
            <ChromeExtensionOverlay videoTitle="How to Build Better Learning Habits" channelName="Andrew Huberman" />
          </div>
        </div>
      </div>
    </div>
  )
}
