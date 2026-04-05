document.addEventListener('DOMContentLoaded', () => {
    const coinData = {
        'yuan-1': {
            key: 'yuan-1',
            name: '1元',
            valueText: '1',
            unitChar: '元',
            colorName: '银色',
            colorKey: 'nickel',
            shapeKey: 'circle',
            shapeName: '圆形',
            patternName: '菊花',
            head: '../../../assets/images/coins/head/yuan-1.jpg',
            tail: '../../../assets/images/coins/tail/yuan-1.jpg'
        },
        'jiao-5': {
            key: 'jiao-5',
            name: '5角',
            valueText: '5',
            unitChar: '角',
            colorName: '银色',
            colorKey: 'nickel',
            shapeKey: 'polygon11',
            shapeName: '多边形',
            patternName: '荷花',
            head: '../../../assets/images/coins/head/jiao-5.jpg',
            tail: '../../../assets/images/coins/tail/jiao-5.jpg'
        },
        'jiao-1': {
            key: 'jiao-1',
            name: '1角',
            valueText: '1',
            unitChar: '角',
            colorName: '银色',
            colorKey: 'nickel',
            shapeKey: 'circle',
            shapeName: '圆形',
            patternName: '兰花',
            head: '../../../assets/images/coins/head/jiao-1.jpg',
            tail: '../../../assets/images/coins/tail/jiao-1.jpg'
        }
    };

    const coinOrder = ['yuan-1', 'jiao-5', 'jiao-1'];
    const urlParams = new URLSearchParams(window.location.search);
    const currentCoinKey = urlParams.get('coin') || 'yuan-1';
    const currentCoin = coinData[currentCoinKey];

    if (!currentCoin) {
        console.error('Invalid coin key:', currentCoinKey);
        return;
    }

    const reader = document.getElementById('page-reader-text');
    const unifiedNavigation = document.getElementById('unified-navigation');
    const practiceStepsContainer = document.getElementById('practice-steps-container');

    const state = {
        mode: 'teaching',
        teachingPage: 1,
        practiceStep: 1,
        colorCorrect: false,
        shapeCorrect: false,
        valueCorrect: false,
        patternCorrect: false
    };

    const refs = {
        teachingHead: document.getElementById('teaching-coin-head'),
        teachingTail: document.getElementById('teaching-coin-tail'),
        teachingColorBadge: document.getElementById('teaching-color-badge'),
        teachingColorDescription: document.getElementById('teaching-color-description'),
        teachingValueImage: document.getElementById('teaching-value-image'),
        teachingValueDescription: document.getElementById('teaching-value-description'),
        teachingPatternImage: document.getElementById('teaching-pattern-image'),
        teachingPatternDescription: document.getElementById('teaching-pattern-description'),
        colorCanvas: document.getElementById('practice-color-canvas'),
        colorOuter: document.querySelector('#practice-color-canvas .coin-outer-ring'),
        colorInnerShape: document.getElementById('practice-color-inner-shape'),
        colorPanel: document.getElementById('coin-color-panel'),
        colorError: document.getElementById('coin-color-error'),
        colorSuccessPanel: document.getElementById('coin-color-success-panel'),
        colorSuccessText: document.getElementById('coin-color-success-text'),
        shapeCanvas: document.getElementById('practice-shape-canvas'),
        shapeOuter: document.querySelector('#practice-shape-canvas .coin-outer-ring'),
        shapeInnerShape: document.getElementById('practice-shape-inner-shape'),
        shapePanel: document.getElementById('coin-shape-panel'),
        shapeError: document.getElementById('coin-shape-error'),
        shapeSuccessPanel: document.getElementById('coin-shape-success-panel'),
        shapeSuccessText: document.getElementById('coin-shape-success-text'),
        valueCanvas: document.getElementById('practice-value-canvas'),
        valueOuter: document.querySelector('#practice-value-canvas .coin-outer-ring'),
        valueInnerShape: document.getElementById('practice-value-inner-shape'),
        valueImage: document.getElementById('practice-value-image'),
        valuePanel: document.getElementById('coin-value-panel'),
        valueOptions: document.getElementById('coin-value-options'),
        valueError: document.getElementById('coin-value-error'),
        valueSuccessPanel: document.getElementById('coin-value-success-panel'),
        valueSuccessText: document.getElementById('coin-value-success-text'),
        patternCanvas: document.getElementById('practice-pattern-canvas'),
        patternOuter: document.querySelector('#practice-pattern-canvas .coin-outer-ring'),
        patternInnerShape: document.getElementById('practice-pattern-inner-shape'),
        patternImage: document.getElementById('practice-pattern-image'),
        patternPanel: document.getElementById('coin-pattern-panel'),
        patternOptions: document.getElementById('coin-pattern-options'),
        patternError: document.getElementById('coin-pattern-error'),
        patternSuccessPanel: document.getElementById('coin-pattern-success-panel'),
        patternSuccessText: document.getElementById('coin-pattern-success-text'),
        completionHead: document.getElementById('completion-head-img'),
        completionTail: document.getElementById('completion-tail-img'),
        completionText: document.getElementById('coin-completion-text')
    };

    function toChineseNumeral(numberText) {
        const num = parseInt(numberText, 10);
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

        if (Number.isNaN(num)) return numberText;
        if (num < 10) return digits[num];
        if (num === 10) return '十';
        if (num < 20) return `十${digits[num % 10]}`;
        if (num < 100) {
            const tens = Math.floor(num / 10);
            const ones = num % 10;
            return `${digits[tens]}十${ones === 0 ? '' : digits[ones]}`;
        }
        if (num === 100) return '一百';
        return numberText;
    }

    function normalizeSpeechText(text) {
        if (typeof text !== 'string') return text;
        return text.replace(/\d+/g, match => toChineseNumeral(match));
    }

    function setReaderText(text) {
        if (reader) reader.textContent = normalizeSpeechText(text);
    }

    function speakFeedback(text) {
        const speechText = normalizeSpeechText(text);
        if (window.voiceCore) window.voiceCore.speakText(speechText);
        setReaderText(speechText);
    }

    function getTeachingPageText(pageNum) {
        switch (pageNum) {
            case 1:
                return `这是${currentCoin.name}硬币，它的颜色是${currentCoin.colorName}，内圈形状是${currentCoin.shapeName}`;
            case 2:
                return `硬币正面有大号数字"${currentCoin.valueText}"，右下角有一个“${currentCoin.unitChar}”字`;
            case 3:
                return `${currentCoin.name}硬币背后的纹样是一朵"${currentCoin.patternName}"`;
            default:
                return '';
        }
    }

    function getPracticeStepText(stepNum) {
        switch (stepNum) {
            case 1:
                return '请选择正确的硬币颜色';
            case 2:
                return '请选择正确的内圈形状';
            case 3:
                return '请选择正确的硬币面值';
            case 4:
                return '请选择正确的硬币纹样';
            case 5:
                return `恭喜你完成${currentCoin.name}硬币的练习！`;
            default:
                return '';
        }
    }

    function getCoinFillColor() {
        return '#eef1f4';
    }

    function applyFilledOuter(outerEl) {
        if (!outerEl) return;
        outerEl.classList.add('is-filled');
        outerEl.style.background = getCoinFillColor();
        outerEl.style.borderColor = '#d0d0d0';
        outerEl.style.boxShadow = '0 0 0 6px rgba(207, 214, 220, 0.45)';
    }

    function clearFilledOuter(outerEl) {
        if (!outerEl) return;
        outerEl.classList.remove('is-filled');
        outerEl.style.background = 'transparent';
        outerEl.style.borderColor = '#d0d0d0';
        outerEl.style.boxShadow = 'none';
    }

    function setInnerShape(shapeEl, shapeKey, visible) {
        if (!shapeEl) return;
        shapeEl.classList.remove('shape-circle', 'shape-polygon11', 'is-visible');
        if (visible) {
            shapeEl.classList.add(shapeKey === 'polygon11' ? 'shape-polygon11' : 'shape-circle', 'is-visible');
        }
    }

    function setCanvasImage(imgEl, src, visible) {
        if (!imgEl) return;
        imgEl.src = src || '';
        imgEl.classList.toggle('is-visible', Boolean(visible && src));
    }

    function setStepIndicator(stepNum) {
        document.querySelectorAll('#steps .step').forEach((step, index) => {
            const n = index + 1;
            step.classList.remove('active', 'done');
            if (n < stepNum) step.classList.add('done');
            if (n === stepNum) step.classList.add('active');
        });
    }

    function renderTeachingContent() {
        document.title = `认识硬币 - ${currentCoin.name}`;
        document.querySelector('.main-title').textContent = `认识硬币 - ${currentCoin.name}`;
        refs.teachingHead.src = currentCoin.head;
        refs.teachingTail.src = currentCoin.tail;
        refs.teachingColorBadge.textContent = currentCoin.colorName;
        refs.teachingColorDescription.textContent = `这是${currentCoin.name}硬币，它的颜色是${currentCoin.colorName}，内圈形状是${currentCoin.shapeName}`;
        refs.teachingValueImage.src = currentCoin.tail;
        refs.teachingValueDescription.textContent = `硬币正面有大号数字"${currentCoin.valueText}"，右下角有一个“${currentCoin.unitChar}”字`;
        refs.teachingPatternImage.src = currentCoin.head;
        refs.teachingPatternDescription.textContent = `${currentCoin.name}硬币背后的纹样是一朵"${currentCoin.patternName}"`;
    }

    function renderNavActive() {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const currentNav = document.getElementById(`nav-${currentCoin.key}`);
        if (currentNav) currentNav.classList.add('active');
    }

    function updateTeachingNavigationDisplay() {
        const prevBtn = document.getElementById('prev-teaching-btn');
        const nextBtn = document.getElementById('next-teaching-btn');
        const startBtn = document.getElementById('start-practice-btn');

        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';

        if (state.teachingPage === 1) {
            if (nextBtn) nextBtn.style.display = 'inline-block';
        } else if (state.teachingPage === 3) {
            if (prevBtn) prevBtn.style.display = 'inline-block';
            if (startBtn) startBtn.style.display = 'inline-block';
        } else {
            if (prevBtn) prevBtn.style.display = 'inline-block';
            if (nextBtn) nextBtn.style.display = 'inline-block';
        }
    }

    function updateNavigationButtons() {
        if (!unifiedNavigation) return;
        unifiedNavigation.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.display = 'none';
        });

        if (state.mode === 'teaching') {
            updateTeachingNavigationDisplay();
        } else {
            const backBtn = document.getElementById('back-to-teaching-btn');
            const restartBtn = document.getElementById('restart-practice-btn');
            if (backBtn) backBtn.style.display = 'inline-block';
            if (restartBtn) restartBtn.style.display = 'inline-block';
        }
    }

    function showTeachingPage(pageNum) {
        state.teachingPage = pageNum;
        document.querySelectorAll('.teaching-page').forEach(page => page.classList.remove('active'));
        const target = document.getElementById(`teaching-page${pageNum}`);
        if (target) target.classList.add('active');
        updateNavigationButtons();
        setReaderText(getTeachingPageText(pageNum));
    }

    function buildCoinOptions(container, side, onSelect) {
        if (!container) return;
        container.innerHTML = coinOrder.map(key => {
            const coin = coinData[key];
            const imgSrc = side === 'head' ? coin.head : coin.tail;
            return `
                <button class="coin-image-option" type="button" data-coin="${coin.key}">
                    <img src="${imgSrc}" alt="${coin.name}${side === 'head' ? '纹样' : '面值'}">
                </button>
            `;
        }).join('');

        container.querySelectorAll('.coin-image-option').forEach(button => {
            button.addEventListener('click', () => onSelect(button.dataset.coin, button));
        });
    }

    function resetSelections(selector) {
        document.querySelectorAll(selector).forEach(item => {
            item.classList.remove('selected', 'correct', 'wrong');
        });
    }

    function renderPracticeVisualState() {
        clearFilledOuter(refs.colorOuter);
        clearFilledOuter(refs.shapeOuter);
        clearFilledOuter(refs.valueOuter);
        clearFilledOuter(refs.patternOuter);

        setInnerShape(refs.colorInnerShape, currentCoin.shapeKey, false);
        setInnerShape(refs.shapeInnerShape, currentCoin.shapeKey, state.shapeCorrect);
        setInnerShape(refs.valueInnerShape, currentCoin.shapeKey, state.shapeCorrect);
        setInnerShape(refs.patternInnerShape, currentCoin.shapeKey, state.shapeCorrect);

        setCanvasImage(refs.valueImage, currentCoin.tail, state.valueCorrect);
        setCanvasImage(refs.patternImage, currentCoin.head, state.patternCorrect);

        if (state.colorCorrect) {
            applyFilledOuter(refs.colorOuter);
            applyFilledOuter(refs.shapeOuter);
            applyFilledOuter(refs.valueOuter);
            applyFilledOuter(refs.patternOuter);
        }
    }

    function renderPracticePanels() {
        refs.colorPanel.style.display = state.colorCorrect ? 'none' : 'block';
        refs.colorSuccessPanel.style.display = state.colorCorrect ? 'block' : 'none';
        refs.shapePanel.style.display = state.shapeCorrect ? 'none' : 'block';
        refs.shapeSuccessPanel.style.display = state.shapeCorrect ? 'block' : 'none';
        refs.valuePanel.style.display = state.valueCorrect ? 'none' : 'block';
        refs.valueSuccessPanel.style.display = state.valueCorrect ? 'block' : 'none';
        refs.patternPanel.style.display = state.patternCorrect ? 'none' : 'block';
        refs.patternSuccessPanel.style.display = state.patternCorrect ? 'block' : 'none';
    }

    function renderCompletion() {
        refs.completionHead.src = currentCoin.head;
        refs.completionTail.src = currentCoin.tail;
        refs.completionText.textContent = `恭喜你完成${currentCoin.name}硬币的练习！`;
    }

    function switchPracticePage(stepNum) {
        state.practiceStep = stepNum;
        document.querySelectorAll('#practice-content .page').forEach(page => page.classList.remove('active'));
        const target = document.getElementById(`page${stepNum}`);
        if (target) target.classList.add('active');
        setStepIndicator(stepNum);
        if (stepNum === 5) renderCompletion();
        setReaderText(getPracticeStepText(stepNum));
    }

    function resetPractice() {
        state.practiceStep = 1;
        state.colorCorrect = false;
        state.shapeCorrect = false;
        state.valueCorrect = false;
        state.patternCorrect = false;

        resetSelections('.coin-color-option');
        resetSelections('.coin-shape-option');
        resetSelections('.coin-image-option');

        refs.colorError.style.display = 'none';
        refs.shapeError.style.display = 'none';
        refs.valueError.style.display = 'none';
        refs.patternError.style.display = 'none';

        refs.colorSuccessText.textContent = '';
        refs.shapeSuccessText.textContent = '';
        refs.valueSuccessText.textContent = '';
        refs.patternSuccessText.textContent = '';

        buildCoinOptions(refs.valueOptions, 'tail', handleValueSelection);
        buildCoinOptions(refs.patternOptions, 'head', handlePatternSelection);
        renderPracticeVisualState();
        renderPracticePanels();
        switchPracticePage(1);
        if (state.mode !== 'practice') {
            setReaderText(getTeachingPageText(state.teachingPage));
        }
    }

    function setPracticeStepsVisible(visible) {
        if (practiceStepsContainer) {
            practiceStepsContainer.style.display = visible ? 'block' : 'none';
        }
    }

    function markSuccess(panelTextEl, message) {
        if (panelTextEl) panelTextEl.textContent = message;
        speakFeedback(message);
    }

    function markError(errorEl, message) {
        if (errorEl) errorEl.style.display = 'block';
        speakFeedback(message);
    }

    function clearError(errorEl) {
        if (errorEl) errorEl.style.display = 'none';
    }

    window.switchMode = function(mode) {
        state.mode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`${mode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');

        document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
        const activeContent = document.getElementById(`${mode}-content`);
        if (activeContent) activeContent.classList.add('active');

        setPracticeStepsVisible(mode === 'practice');

        if (mode === 'practice') {
            resetPractice();
        } else {
            setReaderText(getTeachingPageText(state.teachingPage));
        }

        updateNavigationButtons();
    };

    window.prevTeachingPage = function() {
        if (state.mode !== 'teaching' || state.teachingPage <= 1) return;
        showTeachingPage(state.teachingPage - 1);
    };

    window.nextTeachingPage = function() {
        if (state.mode !== 'teaching' || state.teachingPage >= 3) return;
        showTeachingPage(state.teachingPage + 1);
    };

    window.backToTeaching = function() {
        showTeachingPage(1);
        window.switchMode('teaching');
    };

    window.restartPractice = function() {
        if (state.mode !== 'practice') {
            window.switchMode('practice');
            return;
        }
        resetPractice();
    };

    window.selectCoinColor = function(colorKey, btn) {
        if (state.mode !== 'practice' || state.practiceStep !== 1) return;
        clearError(refs.colorError);
        resetSelections('.coin-color-option');
        btn.classList.add('selected');

        if (colorKey === currentCoin.colorKey) {
            state.colorCorrect = true;
            btn.classList.add('correct');
            renderPracticeVisualState();
            renderPracticePanels();
            markSuccess(refs.colorSuccessText, `答对了！${currentCoin.name}硬币的颜色是${currentCoin.colorName}。`);
        } else {
            state.colorCorrect = false;
            btn.classList.add('wrong');
            clearFilledOuter(refs.colorOuter);
            markError(refs.colorError, '颜色错误！请换一个颜色试试');
        }
    };

    window.nextCoinColorStep = function() {
        if (!state.colorCorrect) return;
        renderPracticeVisualState();
        switchPracticePage(2);
    };

    window.selectCoinShape = function(shapeKey, btn) {
        if (state.mode !== 'practice' || state.practiceStep !== 2) return;
        clearError(refs.shapeError);
        resetSelections('.coin-shape-option');
        btn.classList.add('selected');

        if (shapeKey === currentCoin.shapeKey) {
            state.shapeCorrect = true;
            btn.classList.add('correct');
            renderPracticeVisualState();
            renderPracticePanels();
            markSuccess(refs.shapeSuccessText, `答对了！${currentCoin.name}硬币的内圈形状是${currentCoin.shapeName}。`);
        } else {
            state.shapeCorrect = false;
            setInnerShape(refs.shapeInnerShape, currentCoin.shapeKey, false);
            markError(refs.shapeError, '形状错误！请换一个形状试试');
        }
    };

    window.nextCoinShapeStep = function() {
        if (!state.shapeCorrect) return;
        renderPracticeVisualState();
        switchPracticePage(3);
    };

    function handleValueSelection(selectedKey, btn) {
        if (state.mode !== 'practice' || state.practiceStep !== 3) return;
        clearError(refs.valueError);
        resetSelections('#coin-value-options .coin-image-option');
        btn.classList.add('selected');

        if (selectedKey === currentCoin.key) {
            state.valueCorrect = true;
            btn.classList.add('correct');
            renderPracticeVisualState();
            renderPracticePanels();
            markSuccess(refs.valueSuccessText, `恭喜正确找到${currentCoin.name}硬币的面值`);
        } else {
            state.valueCorrect = false;
            setCanvasImage(refs.valueImage, currentCoin.tail, false);
            btn.classList.add('wrong');
            markError(refs.valueError, '选择错误！请再试一次');
        }
    }

    window.nextCoinValueStep = function() {
        if (!state.valueCorrect) return;
        renderPracticeVisualState();
        switchPracticePage(4);
    };

    function handlePatternSelection(selectedKey, btn) {
        if (state.mode !== 'practice' || state.practiceStep !== 4) return;
        clearError(refs.patternError);
        resetSelections('#coin-pattern-options .coin-image-option');
        btn.classList.add('selected');

        if (selectedKey === currentCoin.key) {
            state.patternCorrect = true;
            btn.classList.add('correct');
            renderPracticeVisualState();
            renderPracticePanels();
            markSuccess(refs.patternSuccessText, `恭喜正确找到${currentCoin.name}硬币的纹样`);
        } else {
            state.patternCorrect = false;
            setCanvasImage(refs.patternImage, currentCoin.head, false);
            btn.classList.add('wrong');
            markError(refs.patternError, '选择错误！请再试一次');
        }
    }

    window.nextCoinPatternStep = function() {
        if (!state.patternCorrect) return;
        renderPracticeVisualState();
        switchPracticePage(5);
    };

    document.getElementById('prev-btn').addEventListener('click', () => {
        const currentIndex = coinOrder.indexOf(currentCoin.key);
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : coinOrder.length - 1;
        window.location.href = `?coin=${coinOrder[nextIndex]}`;
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        const currentIndex = coinOrder.indexOf(currentCoin.key);
        const nextIndex = currentIndex < coinOrder.length - 1 ? currentIndex + 1 : 0;
        window.location.href = `?coin=${coinOrder[nextIndex]}`;
    });

    renderTeachingContent();
    renderNavActive();
    resetPractice();
    showTeachingPage(1);
    setPracticeStepsVisible(false);
});

