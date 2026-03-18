// javascript
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('voice-select');
    const rate = document.getElementById('rate');
    const pitch = document.getElementById('pitch');
    const rateValue = document.getElementById('rate-value');
    const pitchValue = document.getElementById('pitch-value');
    const aiBtn = document.getElementById('ai-voice-btn');
    const resetBtn = document.getElementById('ai-voice-reset');
    const playBtn = document.querySelector('.test-btn');

    // Initialize UI from localStorage
    function loadUI() {
        rate.value = voiceCore.getSetting('selectedRate') || '1';
        pitch.value = voiceCore.getSetting('selectedPitch') || '1';
        rateValue.textContent = rate.value;
        pitchValue.textContent = pitch.value;
        const auto = voiceCore.getSetting('autoPlay') || 'off';
        if (auto === 'on') {
            aiBtn.classList.remove('off');
            aiBtn.textContent = '自动朗读：开启';
        } else {
            aiBtn.classList.add('off');
            aiBtn.textContent = '自动朗读：关闭';
        }
    }

    // Populate select (voiceCore handles waiting for voices)
    voiceCore.populateVoiceSelect(select).then(() => {
        // ensure UI select reflects stored index
        const stored = voiceCore.getSetting('selectedVoiceIndex');
        if (stored !== null && stored !== '') select.value = stored;
    });

    loadUI();

    // Handlers

    select.addEventListener('change', () => {
        voiceCore.setSetting('selectedVoiceIndex', select.value);
        voiceCore.setSetting('selectedVoiceLang', '');
        voiceCore.setSetting('userSetVoice', 'true');
    });

    rate.addEventListener('input', () => {
        rateValue.textContent = rate.value;
        voiceCore.setSetting('selectedRate', rate.value);
    });

    pitch.addEventListener('input', () => {
        pitchValue.textContent = pitch.value;
        voiceCore.setSetting('selectedPitch', pitch.value);
    });

    aiBtn.addEventListener('click', () => {
        const current = voiceCore.getSetting('autoPlay') || 'off';
        const next = current === 'on' ? 'off' : 'on';
        voiceCore.setSetting('autoPlay', next);
        if (next === 'on') {
            aiBtn.classList.remove('off');
            aiBtn.textContent = '自动朗读：开启';
        } else {
            aiBtn.classList.add('off');
            aiBtn.textContent = '自动朗读：关闭';
        }
    });

    resetBtn.addEventListener('click', () => {
        voiceCore.setSetting('selectedVoiceIndex', '');
        voiceCore.setSetting('userSetVoice', 'false');

        voiceCore.setSetting('selectedRate', '1');
        voiceCore.setSetting('selectedPitch', '1');

        rate.value = '1';
        pitch.value = '1';
        rateValue.textContent = '1';
        pitchValue.textContent = '1';

        voiceCore.populateVoiceSelect(select);
    });

    // const sampleText = sampleParagraph ? sampleParagraph.textContent.trim() : '这是新语音的播放效果，你可以在上方继续调整。';
    const sampleText = '这是新语音的播放效果。';
    playBtn.addEventListener('click', () => {
        // user gesture -> speak is allowed
        voiceCore.speakText(sampleText);
    });
    //
    // // optional: click on paragraph to speak
    // if (sampleParagraph) {
    //     sampleParagraph.addEventListener('click', () => voiceCore.speakText(sampleText));
    // }
});