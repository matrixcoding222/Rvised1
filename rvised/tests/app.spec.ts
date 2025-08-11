import { test, expect } from '@playwright/test'

test.describe('Rvised app smoke tests', () => {
  test('health endpoint is OK', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.ok).toBeTruthy()
  })

  test('summarize endpoint returns data for a known video (metadata fallback acceptable)', async ({ request }) => {
    const videoUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
    const res = await request.post('/api/summarize', {
      data: {
        videoUrl,
        settings: {
          learningMode: 'build',
          summaryDepth: 'standard',
          includeEmojis: true,
          includeQuiz: true,
          includeTimestamps: true,
        },
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBeTruthy()
    expect(body.data).toBeTruthy()
    expect(typeof body.data.summary).toBe('string')
    expect(body.data.summary.length).toBeGreaterThan(100)
  })

  test('projects save and list', async ({ request }) => {
    const summaryData = {
      videoTitle: 'Test Video',
      title: 'Test Video',
      videoId: 'jNQXAC9IVRw',
      channel: 'Channel',
      duration: 'PT1M',
      mainTakeaway: 'Takeaway',
      summary: 'This is a test summary.',
      keyInsights: ['Insight 1'],
      actionItems: ['Action 1'],
    }
    const save = await request.post('/api/projects', {
      data: {
        projectName: 'My Library',
        videoUrl: `https://www.youtube.com/watch?v=${summaryData.videoId}`,
        data: summaryData,
      },
    })
    expect(save.ok()).toBeTruthy()
    const saved = await save.json()
    expect(saved.success).toBeTruthy()

    const list = await request.get('/api/projects')
    expect(list.ok()).toBeTruthy()
    const items = (await list.json()).items || []
    expect(items.length).toBeGreaterThan(0)
  })
})


