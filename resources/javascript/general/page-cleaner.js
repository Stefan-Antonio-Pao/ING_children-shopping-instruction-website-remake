document.addEventListener('DOMContentLoaded', () => {
    const clearDataButton = document.getElementById('clear-data-btn');

    if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
            // 1. Clear all localStorage data
            localStorage.clear();

            // 2. Restore default settings through voiceCore.ensureDefaults()
            // This will re-populate all default values correctly
            if (window.voiceCore && typeof window.voiceCore.ensureDefaults === 'function') {
                window.voiceCore.ensureDefaults();
            }

            // 3. Reload the page to apply the cleared/reset state with defaults restored
            window.location.reload();
        });
    }
});

/**
 * NOTE: The 'clearStorage' function below performs a full localStorage wipe.
 * It is safer to use the specific clear/reset functions provided by
 * directorCore and voiceSetting, which is what the click listener does now.
 */
function clearStorage() {
    localStorage.clear();
    console.warn("所有网站设置已重置！(WARNING: This clears ALL localStorage for the site)");
}