document.addEventListener('DOMContentLoaded', () => {
    const videoSteps = [1, 2, 3, 4, 5].map((stepNum) => ({
        step: stepNum,
        video: `../../../assets/vedios/online-payment-intro/step-${stepNum}.mp4`
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
            title: `电子支付教学 - 第${item.step}步`,
            message: '',
            readerText: `现在播放电子支付教学第${item.step}步视频。`,
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

    function showVideoStep(stepNum) {
        const config = getVideoConfig(stepNum);
        if (!config) return;

        if (sourceEl) {
            sourceEl.src = config.video;
        }

        messageEl.classList.remove('active');
        videoEl.classList.remove('is-hidden');
        videoEl.load();
        tryAutoPlayVideo();
    }

    function showMessagePage(messageText) {
        videoEl.pause();
        videoEl.classList.add('is-hidden');
        messageEl.textContent = messageText;
        messageEl.classList.add('active');
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
            showVideoStep(page.videoStep);
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

    videoEl.addEventListener('ended', () => {
        if (currentPageIndex >= 1 && currentPageIndex <= 4) {
            goToPage(currentPageIndex + 1);
        }
    });

    renderPage(currentPageIndex);
});

