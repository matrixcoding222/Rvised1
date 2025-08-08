export function initWizard(root, { mode }) {
  const qs = (sel) => root.querySelector(sel)
  const qsa = (sel) => Array.from(root.querySelectorAll(sel))

  function goTo(n) {
    qsa('.screen').forEach(s => s.classList.remove('active'))
    const t = qs(`#screen-${n}`)
    if (t) t.classList.add('active')
    const dots = qsa('.progress-dot')
    dots.forEach(d => d.classList.remove('active'))
    if (dots[n-1]) dots[n-1].classList.add('active')
  }

  function getSettings() {
    const getRadio = (name, def) => (qs(`input[name="${name}"]:checked`)?.value) || def
    return {
      learningMode: getRadio('learningMode', 'student'),
      summaryDepth: getRadio('summaryDepth', 'standard'),
      project: getRadio('project', 'general'),
      includeTimestamps: !!qs('#includeTimestamps')?.checked,
      includeActionItems: !!qs('#includeActionItems')?.checked,
      includeEmojis: !!qs('#includeEmojis')?.checked,
      includeQuiz: !!qs('#includeQuiz')?.checked,
      includeResources: !!qs('#includeResources')?.checked,
      includeKeyTerms: !!qs('#includeKeyTerms')?.checked,
      quizCount: '5'
    }
  }

  function saveSettingsToStorage(settings) {
    try { chrome?.storage?.sync?.set({ rvisedSettings: settings }) } catch (_) {}
  }

  function sendMessageToCurrentTab(payload) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]
        if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
          chrome.tabs.sendMessage(tab.id, payload)
        }
      })
    } catch (_) {}
  }

  root.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-screen]')
    if (nav) {
      goTo(nav.getAttribute('data-screen'))
      return
    }

    if (e.target.id === 'generateSummaryBtn') {
      const settings = getSettings()
      saveSettingsToStorage(settings)
      if (mode === 'popup') {
        // Ask content script to start summarization and show overlay
        try {
          chrome.runtime.sendMessage({ action: 'showOverlay', settings })
        } catch (_) {}
        window.close?.()
      } else {
        // Overlay mode: let the content script handle summarization
        window.dispatchEvent(new CustomEvent('rvised-generate', { detail: { settings } }))
      }
    }
  })

  // Start at screen 1 by default
  goTo(1)
}


