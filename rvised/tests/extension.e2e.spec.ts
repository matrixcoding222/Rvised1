import { test, expect, chromium } from '@playwright/test'
import path from 'path'

// E2E check: launch Chromium with the unpacked extension, open a YouTube watch page,
// verify the overlay appears, and basic interactivity works.
test('Chrome extension overlay loads on YouTube and buttons are clickable', async () => {
  const extensionPath = path.resolve(__dirname, '../../extensions/rvised-extension')

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  })

  try {
    const page = await context.newPage()
    page.on('console', msg => console.log('[ext console]', msg.type(), msg.text()))
    page.on('pageerror', err => console.log('[ext error]', err.message))
    await page.goto('https://www.youtube.com/watch?v=jNQXAC9IVRw', { waitUntil: 'domcontentloaded' })

    // Wait for overlay to auto-inject and assert single instance
    await page.waitForSelector('#rvised-overlay', { timeout: 30000 })
    const overlays1 = await page.$$('#rvised-overlay')
    expect(overlays1.length).toBe(1)

    // Buttons clickable
    const genBtn = await page.$('#rvised-overlay #summarizeBtn')
    expect(genBtn).toBeTruthy()
    await genBtn!.click({ force: true })

    // Wait up to 60s for either a result or a graceful error (no TrustedTypes eval)
    const resultLocator = page.locator('#rvised-overlay #summaryResult:not(.hidden)')
    const errorLocator = page.locator('#rvised-overlay .error')
    const appeared = await Promise.race([
      resultLocator.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false),
      errorLocator.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false),
    ])
    expect(appeared).toBeTruthy()

    // Navigate to a second video and ensure no duplicate overlays
    await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#rvised-overlay', { timeout: 30000 })
    const overlays2 = await page.$$('#rvised-overlay')
    expect(overlays2.length).toBe(1)

    // Try opening dashboard link (if present)
    const dashLink = await page.$('#rvised-overlay .summary-actions a')
    if (dashLink) {
      const [dashboard] = await Promise.all([
        context.waitForEvent('page'),
        dashLink.click({ button: 'middle' }).catch(() => dashLink.click())
      ])
      await dashboard.waitForLoadState('domcontentloaded')
      await dashboard.close()
    }
  } finally {
    await context.close()
  }
})


