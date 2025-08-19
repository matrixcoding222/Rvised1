// Debug helper to check extension status
console.log('🔍 Rvised Debug Helper Loaded');

// Check for UI script
setTimeout(() => {
    console.log('=== RVISED EXTENSION DEBUG ===');
    console.log('1. v0 UI Script loaded?', !!window.getExactV0UI);
    console.log('2. Location:', window.location.pathname);
    console.log('3. On YouTube watch page?', window.location.pathname.includes('/watch'));
    
    // Check for button
    const button = document.getElementById('rvised-main-button');
    console.log('4. Summarize button exists?', !!button);
    if (button) {
        console.log('   Button location:', button.parentElement?.id || 'unknown');
    }
    
    // Check for container
    const container = document.getElementById('rvised-extension-container') || 
                     document.getElementById('rvised-overlay-container');
    console.log('5. Extension container exists?', !!container);
    if (container) {
        const style = window.getComputedStyle(container);
        console.log('   Container display:', style.display);
        console.log('   Container visibility:', style.visibility);
        console.log('   Container opacity:', style.opacity);
        
        // Check for overlay inside
        const overlay = container.querySelector('#rvised-overlay-container');
        if (overlay) {
            const overlayStyle = window.getComputedStyle(overlay);
            console.log('6. Overlay container found inside');
            console.log('   Overlay display:', overlayStyle.display);
            console.log('   Overlay visibility:', overlayStyle.visibility);
        }
        
        // Check for main card
        const card = container.querySelector('#rvised-main-card');
        if (card) {
            const cardStyle = window.getComputedStyle(card);
            console.log('7. Main card found');
            console.log('   Card display:', cardStyle.display);
            console.log('   Card visibility:', cardStyle.visibility);
        }
    }
    
    // Check for secondary column
    const secondary = document.querySelector('#secondary');
    console.log('8. YouTube secondary column exists?', !!secondary);
    
    console.log('=== END DEBUG ===');
}, 2000);

// Also log when UI becomes ready
window.addEventListener('rvisedUIReady', () => {
    console.log('✅ Rvised UI Ready Event Fired!');
});