export function initComposer(root, { mode }){
  const qs = (s)=> root.querySelector(s)

  const learning = qs('#rv-learningMode')
  const depth = qs('#rv-summaryDepth')
  const t = qs('#rv-includeTimestamps')
  const a = qs('#rv-includeActionItems')
  const e = qs('#rv-includeEmojis')
  const q = qs('#rv-includeQuiz')
  const btn = qs('#rv-generate')
  const result = qs('#rv-result')

  function getSettings(){
    return {
      learningMode: learning.value,
      summaryDepth: depth.value,
      includeTimestamps: !!t.checked,
      includeActionItems: !!a.checked,
      includeEmojis: !!e.checked,
      includeQuiz: !!q.checked,
      quizCount: '5'
    }
  }

  async function start(){
    const settings = getSettings()
    try { chrome?.storage?.sync?.set({ rvisedSettings: settings }) } catch(_){ }
    if (mode === 'popup'){
      try { chrome.runtime.sendMessage({ action:'showOverlay', settings }) } catch(_){ }
      window.close?.()
    } else {
      window.dispatchEvent(new CustomEvent('rvised-generate', { detail:{ settings } }))
    }
  }

  btn.addEventListener('click', start)
  const close = qs('#rv-close-btn')
  if (close) close.addEventListener('click', ()=> root.closest('#rvised-overlay')?.remove())
}


