(() => {
    const synth = window.speechSynthesis;
    const ID = 'page-reader-text';
    const WAIT_TIMEOUT = 3000; // ms to wait for voices

    // State: 0: Stopped/Initial/Canceled, 1: Speaking, 2: Paused
    let state = 0;
    let playPageBtn = null; // Store reference to the button
    let stateCheckerInterval = null; // Interval for checking end of speech

    // --- State update function ---
    function updateButtonState(newState) {
        // Core: If speaking is explicitly canceled, ended, or error occurred, revert to 'Read'
        if (newState === 0 || newState === 'end' || newState === 'error') {
            state = 0; // Force set to Stopped state
            if (playPageBtn) {
                playPageBtn.textContent = '读';
                playPageBtn.title = '朗读本页';
            }
            return;
        }

        // Speaking / Paused
        state = newState;
        if (!playPageBtn) return;

        if (state === 1) {
            playPageBtn.textContent = '⏸';
            playPageBtn.title = '暂停朗读';
        } else if (state === 2) {
            playPageBtn.textContent = '▶';
            playPageBtn.title = '继续朗读';
        }
    }

    // --- State Checker (More reliable than synth.onend) ---
    function startStateChecker() {
        if (stateCheckerInterval) clearInterval(stateCheckerInterval);
        stateCheckerInterval = setInterval(() => {
            // If in Speaking (1) or Paused (2) state, and synth is neither speaking nor paused,
            // the speech has finished or was implicitly canceled by the browser.
            if ((state === 1 || state === 2) && !synth.speaking && !synth.paused) {
                updateButtonState(0); // Reset to 'Read'
                clearInterval(stateCheckerInterval);
                stateCheckerInterval = null;
            }
        }, 100); // Check every 100ms
    }

    // --- Button click handler ---
    function handlePlayback(text) {
        if (state === 1) {
            // Speaking -> Pause
            synth.pause();
            updateButtonState(2);
        } else if (state === 2) {
            // Paused -> Resume
            synth.resume();
            updateButtonState(1);
        } else {
            // Stopped/Initial -> Start Speaking
            if (!window.voiceCore) return;

            // 1. Start speaking (voiceCore handles synth.cancel())
            window.voiceCore.speakText(text);

            // 2. Immediately update state to 'Speaking'
            updateButtonState(1);

            // 3. Start state checker to reliably capture the end of the speech
            startStateChecker();
        }
    }

    // --- Auto-Play Logic ---
    async function tryAutoSpeak(text) {
        if (!window.voiceCore) {
            // Wait for voiceCore to be available
            window.addEventListener('voiceCore:voicesupdated', () => tryAutoSpeak(text), { once: true });
            return;
        }

        const auto = voiceCore.getSetting('autoPlay') || 'off';
        if (auto !== 'on') return;

        try {
            // Wait for voices and attempt to speak
            await voiceCore.waitForVoices(WAIT_TIMEOUT);
            await window.voiceCore.speakText(text);

            // Auto-play successful, set state and start checker
            updateButtonState(1);
            startStateChecker();

        } catch (e) {
            updateButtonState(0); // Reset state on failure
        }
    }

    // Helper function to stop speech and perform the navigation
    function stopSpeechAndNavigate(event) {
        event.preventDefault(); // Stop the <a> tag from navigating immediately

        const navButton = event.currentTarget;
        const targetUrl = navButton.getAttribute('data-href');

        if (window.speechSynthesis.speaking) {
            // 1. Immediately stop any current speech
            window.speechSynthesis.cancel();

            // 2. Wait a small moment to ensure the synth cancellation registers, then navigate
            // This small delay prevents potential race conditions in some browsers.
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 50); // 50ms is usually enough
        } else {
            // No speech playing, navigate immediately
            window.location.href = targetUrl;
        }
    }


    // --- Initialization ---
    function init() {
        const el = document.getElementById(ID);
        if (!el) return;
        const text = (el.textContent || el.innerText || '').trim();
        if (!text) return;

        playPageBtn = document.getElementById('play-page-btn');
        if (playPageBtn) {
            updateButtonState(0);
            playPageBtn.addEventListener('click', () => handlePlayback(text));
        }

        // NEW: Add event listeners for page navigation buttons
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', stopSpeechAndNavigate);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', stopSpeechAndNavigate);
        }

        tryAutoSpeak(text);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();