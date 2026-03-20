document.addEventListener('DOMContentLoaded', () => {
    const stepContent = {
        1: {
            title: '第1步 - 打开支付宝/微信',
            readerText: '首先，我们需要在手机上找到并点击支付宝或微信的图标来打开它。'
        },
        2: {
            title: '第2步 - 点击付款/扫一扫',
            readerText: '在支付宝或微信里，我们需要找到付款或扫一扫按钮并点击它。'
        },
        3: {
            title: '第3步 - 扫描支付码',
            readerText: '用手机摄像头对准商家的支付二维码，保持手机稳定，等待扫描完成。'
        },
        4: {
            title: '第4步 - 输入支付金额',
            readerText: '在弹出的支付页面中，输入你要支付的金额。'
        },
        5: {
            title: '第5步 - 确认支付',
            readerText: '输入金额后，点击确认支付按钮完成支付。'
        }
    };

    const videoSteps = [1, 2, 3, 4, 5].map((stepNum) => ({
        step: stepNum,
        video: `../../../assets/vedios/online-payment-intro/step-${stepNum}.mp4`,
        ...stepContent[stepNum]
    }));

    const pages = [
        {
            id: 'intro',
            title: '电子支付教学',
            message: '欢迎来到电子支付教学！',
            readerText: '欢迎来到电子支付教学！',
            videoStep: null
        },
        ...videoSteps.map((item) => ({
            id: `step-${item.step}`,
            title: item.title,
            message: '',
            readerText: item.readerText,
            videoStep: item.step
        })),
        {
            id: 'outro',
            title: '电子支付教学',
            message: '恭喜完成电子支付的学习！',
            readerText: '恭喜完成电子支付的学习！',
            videoStep: null
        }
    ];

    const params = new URLSearchParams(window.location.search);
    const rawStep = parseInt(params.get('step'), 10);
    let currentPageIndex = Number.isInteger(rawStep) && rawStep >= 1 && rawStep <= 5 ? rawStep : 0;

    const videoEl = document.getElementById('payment-video');
    const sourceEl = videoEl.querySelector('source');
    const messageEl = document.getElementById('message-screen');
    const stepDescriptionEl = document.getElementById('step-description');
    const navItems = Array.from(document.querySelectorAll('#step-navbar .nav-item'));
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const titleEl = document.getElementById('page-title');
    const readerEl = document.getElementById('page-reader-text');

    function setReaderText(text) {
        if (readerEl) readerEl.textContent = text || '';
    }

    function getVideoConfig(stepNum) {
        return videoSteps.find(item => item.step === stepNum) || null;
    }

    function updateNavBar(videoStep) {
        navItems.forEach((item) => {
            const itemStep = parseInt(item.dataset.step, 10);
            item.classList.toggle('active', itemStep === videoStep);
        });
    }

    function updateButtons(pageIndex) {
        prevBtn.disabled = pageIndex <= 0;
        nextBtn.disabled = pageIndex >= pages.length - 1;
    }

    function tryAutoPlayVideo() {
        const playPromise = videoEl.play();
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => {
                // Fallback for autoplay policy: retry once in muted mode.
                videoEl.muted = true;
                videoEl.play().catch(() => {});
            });
        }
    }

    function isAutoReadEnabled() {
        return Boolean(window.voiceCore && window.voiceCore.getSetting('autoPlay') === 'on');
    }

    function showStepDescription(text, visible) {
        if (!stepDescriptionEl) return;
        stepDescriptionEl.textContent = text || '';
        stepDescriptionEl.classList.toggle('is-hidden', !visible);
    }

    function playVideoByVoicePolicy(readerText) {
        if (!isAutoReadEnabled()) {
            tryAutoPlayVideo();
            return;
        }

        const synth = window.speechSynthesis;
        const startedAt = Date.now();
        let hasStartedSpeaking = false;

        const timer = setInterval(() => {
            const elapsed = Date.now() - startedAt;
            const speakingNow = Boolean(synth && synth.speaking);

            if (speakingNow) {
                hasStartedSpeaking = true;
            }

            if (hasStartedSpeaking && !speakingNow) {
                clearInterval(timer);
                tryAutoPlayVideo();
                return;
            }

            // If narration did not start in a short window, fail open and play video.
            if (!hasStartedSpeaking && elapsed > 1400) {
                clearInterval(timer);
                tryAutoPlayVideo();
                return;
            }

            // Hard timeout for any unexpected synth state.
            if (elapsed > 12000) {
                clearInterval(timer);
                tryAutoPlayVideo();
            }
        }, 100);
    }

    function showVideoStep(stepNum, readerText) {
        const config = getVideoConfig(stepNum);
        if (!config) return;

        if (sourceEl) {
            sourceEl.src = config.video;
        }

        messageEl.classList.remove('active');
        videoEl.classList.remove('is-hidden');
        videoEl.load();
        showStepDescription(readerText, true);
        playVideoByVoicePolicy(readerText);
    }

    function showMessagePage(messageText) {
        videoEl.pause();
        videoEl.classList.add('is-hidden');
        messageEl.textContent = messageText;
        messageEl.classList.add('active');
        showStepDescription('', false);
    }

    function updateTitle(titleText) {
        if (!titleEl) return;
        titleEl.textContent = titleText;
        document.title = titleText;
    }

    function syncUrl(videoStep) {
        const url = new URL(window.location.href);
        if (videoStep) {
            url.searchParams.set('step', String(videoStep));
        } else {
            url.searchParams.delete('step');
        }
        window.history.replaceState({}, '', url.toString());
    }

    function renderPage(pageIndex) {
        const page = pages[pageIndex];
        if (!page) return;

        currentPageIndex = pageIndex;
        updateTitle(page.title);
        updateButtons(pageIndex);
        updateNavBar(page.videoStep);

        if (page.videoStep) {
            showVideoStep(page.videoStep, page.readerText);
        } else {
            showMessagePage(page.message);
        }

        setReaderText(page.readerText || page.message || page.title);

        syncUrl(page.videoStep);
    }

    function goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= pages.length || pageIndex === currentPageIndex) return;
        renderPage(pageIndex);
    }

    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const stepNum = parseInt(item.dataset.step, 10);
            if (Number.isInteger(stepNum)) {
                goToPage(stepNum);
            }
        });
    });

    prevBtn.addEventListener('click', () => {
        goToPage(currentPageIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        goToPage(currentPageIndex + 1);
    });

    renderPage(currentPageIndex);
});

