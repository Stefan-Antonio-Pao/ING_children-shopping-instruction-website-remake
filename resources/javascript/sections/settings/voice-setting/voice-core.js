// javascript
(() => {
    const synth = window.speechSynthesis;
    let voices = [];

    // Ensure default settings exist immediately so other pages can read them
    const DEFAULT_LANG = 'zh-CN';
    function ensureDefaults() {
        if (localStorage.getItem('selectedVoiceLang') === null) localStorage.setItem('selectedVoiceLang', DEFAULT_LANG);
        if (localStorage.getItem('selectedRate') === null) localStorage.setItem('selectedRate', '1');
        if (localStorage.getItem('selectedPitch') === null) localStorage.setItem('selectedPitch', '1');
        if (localStorage.getItem('selectedVoiceIndex') === null) localStorage.setItem('selectedVoiceIndex', ''); // empty means "not fixed index yet"
        if (localStorage.getItem('autoPlay') === null) localStorage.setItem('autoPlay', 'off');
        if (localStorage.getItem('userSetVoice') === null) localStorage.setItem('userSetVoice', 'false');
    }
    ensureDefaults();

    // Helper: resolvers for callers waiting for voices
    let pendingResolvers = [];
    function resolveVoicesLoaded() {
        pendingResolvers.forEach(r => {
            try { r(); } catch (e) { /* ignore */ }
        });
        pendingResolvers = [];
    }
    // Wait until voices array is non-empty, or timeout (ms)
    function waitForVoices(timeout = 2000) {
        if (voices && voices.length) return Promise.resolve();
        return new Promise(resolve => {
            pendingResolvers.push(resolve);
            // safety timeout: resolve anyway after timeout so UI can proceed
            setTimeout(() => {
                // if still pending, resolve this one
                const idx = pendingResolvers.indexOf(resolve);
                if (idx !== -1) {
                    pendingResolvers.splice(idx, 1);
                    resolve();
                }
            }, timeout);
        });
    }

    // Choose the best Chinese voice index by scoring:
    // prefer zh*, localService, name matches common Chinese tokens,
    // AND prefer voices that appear later in the list (slight boost).
    function pickBestChineseVoiceIndex(vs) {
        if (!vs || !vs.length) return -1;

        // 1. extend the keyword of zh-CN
        const tokens = /(ting|mei|yun|xia|li|zhang|liang|xiaoxiao|xiao|xiaoyan|yue|mandarin|普通话|汉语)/i;
        // define high-quality voice name tokens with the highest priority
        // Yu-shu 和 Google 普通话/國語 have the highest quality among common browsers
        const highQualityTokens = /(Yu-shu|Google 普通话|Google 國語)/i;

        const candidates = vs.map((v, i) => ({ v, i }))
            .filter(x => x.v.lang && x.v.lang.toLowerCase().startsWith('zh'));
        if (!candidates.length) return -1;

        candidates.sort((a, b) => {
            const score = (x => {
                let s = 0;

                // certain high-quality voice names
                if (highQualityTokens.test(x.v.name)) s += 100; // make sure these are top

                // local service
                if (x.v.localService) s += 10;

                // lang matching
                if (x.v.lang && x.v.lang.toLowerCase() === 'zh-cn') s += 3;

                // basic name tokens matching
                if (tokens.test(x.v.name)) s += 5;

                // index weight
                s += (x.i / Math.max(1, vs.length - 1)) * 1.5;
                return s;
            });
            return score(b) - score(a);
        });
        return candidates[0].i;
    }

    function updateVoicesList() {
        voices = synth.getVoices() || [];

        // if voice is available, resolve waiters
        if (voices.length) {
            resolveVoicesLoaded();
        }

        window.dispatchEvent(new Event('voiceCore:voices-updated'));
    }

    // Attach handler; some browsers call onvoiceschanged later
    synth.onvoiceschanged = updateVoicesList;
    // try to populate immediately (some browsers already have voices)
    updateVoicesList();

    function getCurrentVoice() {
        const idx = Number(localStorage.getItem('selectedVoiceIndex'));
        return Number.isFinite(idx) && voices[idx] ? voices[idx] : voices[voices.length - 1] || voices[0] || null;
    }

    async function speakText(text) {
        if (!text) return;
        await waitForVoices();
        const voice = getCurrentVoice();
        if (!voice) {
            console.warn('No speech voices available yet.');
            return;
        }
        const utt = new SpeechSynthesisUtterance(text);
        utt.voice = voice;
        utt.rate = parseFloat(localStorage.getItem('selectedRate')) || 1;
        utt.pitch = parseFloat(localStorage.getItem('selectedPitch')) || 1;
        synth.cancel();
        synth.speak(utt);
    }

    async function populateVoiceSelect(selectEl) {
        if (!selectEl) return;
        await waitForVoices();

        selectEl.innerHTML = ''; // clear current options
        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})${voice.localService ? ' • local' : ''}`;
            option.value = i; // use index as value
            selectEl.appendChild(option);
        });

        const storedIndex = localStorage.getItem('selectedVoiceIndex');
        const userSet = localStorage.getItem('userSetVoice') === 'true';

        let selectedValue = null;

        if (userSet && storedIndex !== null && voices[Number(storedIndex)]) {
            // A. user have already manually selected a voice that still exists: respect it
            selectedValue = storedIndex;

        } else {
            // B. run first time or user-set voice no longer exists: try to intelligently select a good Chinese voice
            const best = pickBestChineseVoiceIndex(voices);
            if (best >= 0) {
                selectedValue = String(best);
            } else if (selectEl.options.length) {
                // C. fail to select a good Chinese voice: fallback to last option (usually default system voice)
                selectedValue = String(selectEl.options[selectEl.options.length - 1].value);
            }

            // whatever the result is, store it as the current selected voice index
            if (selectedValue !== null) {
                localStorage.setItem('selectedVoiceIndex', selectedValue);
                // p.s. do NOT set userSetVoice to true here, so that we can re-run intelligent selection next time if needed
            }
        }

        if (selectedValue !== null) {
            selectEl.value = selectedValue;
        }
    }

    function setSetting(key, value) {
        if (!key) return;
        localStorage.setItem(key, String(value));
    }

    function getSetting(key) {
        return localStorage.getItem(key);
    }

    // Expose API
    window.voiceCore = {
        speakText,
        populateVoiceSelect,
        setSetting,
        getSetting,
        ensureDefaults,
        // also expose a helper to wait for voice population
        waitForVoices,
    };
})();