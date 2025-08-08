(async function(){
  try {
    const root = document.getElementById('popup-root');
    if (!root) return;
    const url = chrome.runtime.getURL('shared/composer.html');
    root.innerHTML = await (await fetch(url)).text();
    const modUrl = chrome.runtime.getURL('shared/composer.js');
    const mod = await import(modUrl);
    mod.initComposer(root, { mode: 'popup' });
  } catch (e) { console.error('Wizard load failed', e); }
})();


