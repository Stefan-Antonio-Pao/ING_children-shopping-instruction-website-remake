// RMB Easy Learning JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const rmbData = {
        1: {
            name: '1元',
            color: 'yellowgreen',
            colorName: '黄绿色',
            front: '../../../assets/images/rmbs/sides/head/yuan-1.jpg',
            back: '../../../assets/images/rmbs/sides/tail/yuan-1.jpg',
            portrait: '../../../assets/images/rmbs/elements/portraits/yuan-1.jpg',
            value: '../../../assets/images/rmbs/elements/numbers/yuan-1.jpg',
            landscape: '../../../assets/images/rmbs/elements/landscapes/yuan-1.jpg',
            valueText: '1',
            valueCircleText: '壹',
            landscapeDescription: '1元人民币背面的风景是“三潭印月”'
        },
        5: {
            name: '5元',
            color: 'purple',
            colorName: '紫色',
            front: '../../../assets/images/rmbs/sides/head/yuan-5.jpg',
            back: '../../../assets/images/rmbs/sides/tail/yuan-5.jpg',
            portrait: '../../../assets/images/rmbs/elements/portraits/yuan-5.jpg',
            value: '../../../assets/images/rmbs/elements/numbers/yuan-5.jpg',
            landscape: '../../../assets/images/rmbs/elements/landscapes/yuan-5.jpg',
            valueText: '5',
            valueCircleText: '伍',
            landscapeDescription: '5元人民币背面的风景是“泰山”'
        },
        10: {
            name: '10元',
            color: 'blue',
            colorName: '蓝色',
            front: '../../../assets/images/rmbs/sides/head/yuan-10.jpg',
            back: '../../../assets/images/rmbs/sides/tail/yuan-10.jpg',
            portrait: '../../../assets/images/rmbs/elements/portraits/yuan-10.jpg',
            value: '../../../assets/images/rmbs/elements/numbers/yuan-10.jpg',
            landscape: '../../../assets/images/rmbs/elements/landscapes/yuan-10.jpg',
            valueText: '10',
            valueCircleText: '拾',
            landscapeDescription: '10元人民币背面的风景是“三峡夔门”'
        },
        20: {
            name: '20元',
            color: 'yellow',
            colorName: '黄色',
            front: '../../../assets/images/rmbs/sides/head/yuan-20.jpg',
            back: '../../../assets/images/rmbs/sides/tail/yuan-20.jpg',
            portrait: '../../../assets/images/rmbs/elements/portraits/yuan-20.jpg',
            value: '../../../assets/images/rmbs/elements/numbers/yuan-20.jpg',
            landscape: '../../../assets/images/rmbs/elements/landscapes/yuan-20.jpg',
            valueText: '20',
            valueCircleText: '贰拾',
            landscapeDescription: '20元人民币背面的风景是“桂林山水”'
        },
        50: {
            name: '50元',
            color: 'green',
            colorName: '绿色',
            front: '../../../assets/images/rmbs/sides/head/yuan-50.jpg',
            back: '../../../assets/images/rmbs/sides/tail/yuan-50.jpg',
            portrait: '../../../assets/images/rmbs/elements/portraits/yuan-50.jpg',
            value: '../../../assets/images/rmbs/elements/numbers/yuan-50.jpg',
            landscape: '../../../assets/images/rmbs/elements/landscapes/yuan-50.jpg',
            valueText: '50',
            valueCircleText: '伍拾',
            landscapeDescription: '50元人民币背面的风景是“布达拉宫”'
        },
        100: {
            name: '100元',
            color: 'red',
            colorName: '红色',
            front: '../../../assets/images/rmbs/sides/head/yuan-100.jpg',
            back: '../../../assets/images/rmbs/sides/tail/yuan-100.jpg',
            portrait: '../../../assets/images/rmbs/elements/portraits/yuan-100.jpg',
            value: '../../../assets/images/rmbs/elements/numbers/yuan-100.jpg',
            landscape: '../../../assets/images/rmbs/elements/landscapes/yuan-100.jpg',
            valueText: '100',
            valueCircleText: '壹佰',
            landscapeDescription: '100元人民币背面的风景是“人民大会堂”'
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const currentValue = parseInt(urlParams.get('value'), 10) || 1;
    const currentRMB = rmbData[currentValue];

    if (!currentRMB) {
        console.error('Invalid RMB value:', currentValue);
        return;
    }

    const values = [1, 5, 10, 20, 50, 100];
    const unifiedNavigation = document.getElementById('unified-navigation');
    const reader = document.getElementById('page-reader-text');
    const colorCard = document.getElementById('practice-color-card');
    const colorError = document.getElementById('color-wrong');
    const colorSelectPanel = document.getElementById('color-select-panel');
    const colorSuccessPanel = document.getElementById('color-success-panel');
    const colorSuccessText = document.getElementById('color-success-text');
    const practiceStepsContainer = document.getElementById('practice-steps-container');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const page4 = document.getElementById('page4');
    const board = document.getElementById('practice-front-board');
    const backBoard = document.getElementById('practice-back-board');
    const dropPortrait = document.getElementById('drop-portrait');
    const dropValue = document.getElementById('drop-value');
    const dragPortrait = document.getElementById('drag-portrait');
    const dragValue = document.getElementById('drag-value');
    const dragPortraitImg = document.getElementById('drag-portrait-img');
    const dragValueImg = document.getElementById('drag-value-img');
    const puzzleError = document.getElementById('puzzle-error');
    const puzzleDragPanel = document.getElementById('puzzle-drag-panel');
    const puzzleSuccessPanel = document.getElementById('puzzle-success-panel');
    const puzzleSuccessText = document.getElementById('puzzle-success-text');
    const landscapeSelectPanel = document.getElementById('landscape-select-panel');
    const landscapeOptionsGrid = document.getElementById('landscape-options-grid');
    const landscapeError = document.getElementById('landscape-error');
    const landscapeSuccessPanel = document.getElementById('landscape-success-panel');
    const landscapeSuccessText = document.getElementById('landscape-success-text');

    let currentMode = 'teaching';
    let currentTeachingPage = 1;

    const practiceState = {
        step: 1,
        colorSelected: false,
        landscapeSelected: false,
        placed: {
            portrait: false,
            value: false
        }
    };

    // --- Voice / Reader helpers ---
    function setReaderText(text) {
        if (reader) reader.textContent = text;
    }

    function speakFeedback(text) {
        if (window.voiceCore) window.voiceCore.speakText(text);
    }

    function getTeachingPageText(pageNum) {
        switch (pageNum) {
            case 1: return `这是${currentRMB.name}人民币，它的颜色是${currentRMB.colorName}`;
            case 2: return `钞票正面左侧印有大号数字"${currentRMB.valueText}"，下方还有汉字"${currentRMB.valueCircleText}圆"`;
            case 3: return `${currentRMB.name}人民币正面印有毛泽东的头像，位于钞票右侧`;
            case 4: return currentRMB.landscapeDescription;
            default: return '';
        }
    }

    function getPracticePageText(stepNum) {
        switch (stepNum) {
            case 1: return '请选择正确的人民币颜色';
            case 2: return '请把右侧元素拖到左侧正确位置以完成人民币正面';
            case 3: return '请选择正确的人民币背面风景';
            case 4: return `恭喜你完成${currentRMB.name}人民币的练习！`;
            default: return '';
        }
    }

    function setStepIndicator(stepNum) {
        const steps = document.querySelectorAll('#steps .step');
        steps.forEach((step, index) => {
            const n = index + 1;
            step.classList.remove('active', 'done');
            if (n < stepNum) step.classList.add('done');
            if (n === stepNum) step.classList.add('active');
        });
    }

    function switchPracticePage(stepNum) {
        practiceState.step = stepNum;
        document.querySelectorAll('#practice-content .page').forEach(page => page.classList.remove('active'));
        if (stepNum === 1 && page1) page1.classList.add('active');
        if (stepNum === 2 && page2) page2.classList.add('active');
        if (stepNum === 3 && page3) page3.classList.add('active');
        if (stepNum === 4 && page4) page4.classList.add('active');
        setStepIndicator(stepNum);
        setReaderText(getPracticePageText(stepNum));
    }

    function buildLandscapeOptions() {
        if (!landscapeOptionsGrid) return;

        const allValues = [1, 5, 10, 20, 50, 100];
        const wrongPool = allValues.filter(v => v !== currentValue);
        const shuffledWrong = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [currentValue, ...shuffledWrong].sort(() => Math.random() - 0.5);

        landscapeOptionsGrid.innerHTML = options.map(value => {
            const item = rmbData[value];
            return `
                <button class="landscape-option-item" type="button" data-value="${value}">
                    <img src="${item.landscape}" alt="${item.name}风景">
                </button>
            `;
        }).join('');

        landscapeOptionsGrid.querySelectorAll('.landscape-option-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedValue = parseInt(btn.dataset.value, 10);
                selectLandscape(selectedValue, btn);
            });
        });
    }

    function selectLandscape(selectedValue, btn) {
        if (practiceState.step !== 3) return;

        landscapeOptionsGrid.querySelectorAll('.landscape-option-item').forEach(item => {
            item.classList.remove('selected', 'correct', 'wrong');
        });

        if (selectedValue === currentValue) {
            practiceState.landscapeSelected = true;
            btn.classList.add('selected', 'correct');
            if (landscapeError) landscapeError.style.display = 'none';

            if (backBoard) {
                backBoard.style.backgroundImage = `url('${currentRMB.back}')`;
                backBoard.classList.add('is-complete');
            }

            if (landscapeSelectPanel) landscapeSelectPanel.style.display = 'none';
            if (landscapeSuccessPanel) landscapeSuccessPanel.style.display = 'block';
            if (landscapeSuccessText) {
                landscapeSuccessText.textContent = `恭喜正确拼出${currentRMB.name}反面`;
            }
            speakFeedback(`恭喜正确拼出${currentRMB.name}反面`);
        } else {
            practiceState.landscapeSelected = false;
            btn.classList.add('selected', 'wrong');
            if (landscapeError) landscapeError.style.display = 'block';
            speakFeedback('选择错误！请再试一次');
        }
    }

    function clearDropZone(zone, label) {
        if (!zone) return;
        zone.classList.remove('filled');
        zone.innerHTML = `<span>${label}</span>`;
    }

    function showPuzzleError() {
        if (!puzzleError) return;
        puzzleError.style.display = 'block';
        speakFeedback('位置错误！请换一个位置试试');
        setTimeout(() => {
            if (puzzleError) puzzleError.style.display = 'none';
        }, 1100);
    }

    function markDropSuccess(zone, imageSrc) {
        if (!zone) return;
        zone.classList.add('filled');
        zone.innerHTML = `<img src="${imageSrc}" alt="拼图元素">`;
    }

    function completeFrontPuzzle() {
        if (!board) return;

        board.style.backgroundImage = `url('${currentRMB.front}')`;
        board.classList.add('is-complete');

        if (dropPortrait) dropPortrait.style.display = 'none';
        if (dropValue) dropValue.style.display = 'none';

        if (puzzleDragPanel) puzzleDragPanel.style.display = 'none';
        if (puzzleSuccessPanel) puzzleSuccessPanel.style.display = 'block';
        if (puzzleSuccessText) {
            puzzleSuccessText.textContent = `恭喜正确拼出${currentRMB.name}正面`;
        }
        speakFeedback(`恭喜正确拼出${currentRMB.name}正面`);
        setStepIndicator(2);
    }

    function handleDrop(type, zone) {
        const dragEl = type === 'portrait' ? dragPortrait : dragValue;
        const imgEl = type === 'portrait' ? dragPortraitImg : dragValueImg;

        if (!dragEl || !imgEl || !zone) return;
        if (practiceState.placed[type]) return;

        practiceState.placed[type] = true;
        dragEl.classList.add('used');
        dragEl.setAttribute('draggable', 'false');
        markDropSuccess(zone, imgEl.src);

        if (practiceState.placed.portrait && practiceState.placed.value) {
            completeFrontPuzzle();
        }
    }

    function initPuzzleDnD() {
        if (!dropPortrait || !dropValue || !dragPortrait || !dragValue) return;

        dragPortrait.addEventListener('dragstart', e => {
            if (practiceState.step !== 2 || practiceState.placed.portrait) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', 'portrait');
        });

        dragValue.addEventListener('dragstart', e => {
            if (practiceState.step !== 2 || practiceState.placed.value) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', 'value');
        });

        [dropPortrait, dropValue].forEach(zone => {
            zone.addEventListener('dragover', e => {
                if (practiceState.step !== 2) return;
                e.preventDefault();
            });

            zone.addEventListener('drop', e => {
                if (practiceState.step !== 2) return;
                e.preventDefault();

                const draggedType = e.dataTransfer.getData('text/plain');
                const expectedType = zone.dataset.type;
                if (draggedType !== expectedType) {
                    showPuzzleError();
                    return;
                }
                handleDrop(draggedType, zone);
            });
        });
    }

    function getColorCode(color) {
        const colors = {
            yellowgreen: '#889c57',
            green: '#27ae60',
            purple: '#9b59b6',
            blue: '#2980b9',
            yellow: '#f39c12',
            red: '#c0392b'
        };
        return colors[color] || '#888888';
    }

    function getPreviewColorCode(color) {
        const colors = {
            yellowgreen: '#dfe8bf',
            green: '#d9efdf',
            purple: '#eadcf2',
            blue: '#dbeaf8',
            yellow: '#f9efc8',
            red: '#f3d7d3'
        };
        return colors[color] || '#f2f2f2';
    }

    function updateTeachingContent(rmb) {
        document.getElementById('teaching-bill-front').src = rmb.front;
        document.getElementById('teaching-bill-back').src = rmb.back;
        document.getElementById('teaching-color-badge').textContent = rmb.colorName;
        document.getElementById('teaching-color-badge').style.backgroundColor = getColorCode(rmb.color);
        const colorValue = document.getElementById('teaching-color-value');
        if (colorValue) colorValue.textContent = rmb.valueText;
        document.getElementById('teaching-color-name').textContent = rmb.colorName;
        document.getElementById('teaching-value-large').src = rmb.value;
        document.getElementById('teaching-value-number').textContent = rmb.valueText;
        const valueCircle = document.getElementById('teaching-value-circle');
        if (valueCircle) valueCircle.textContent = rmb.valueCircleText;
        document.getElementById('teaching-portrait-large').src = rmb.portrait;
        const portraitDesc = document.getElementById('teaching-portrait-description');
        if (portraitDesc) portraitDesc.textContent = `${rmb.name}人民币正面印有毛泽东的头像，位于钞票右侧`;
        document.getElementById('teaching-landscape-large').src = rmb.landscape;
        document.getElementById('teaching-landscape-description').textContent = rmb.landscapeDescription;
    }

    function updateTeachingNavigationDisplay(pageNum) {
        const prevBtn = document.getElementById('prev-teaching-btn');
        const nextBtn = document.getElementById('next-teaching-btn');
        const startBtn = document.getElementById('start-practice-btn');

        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';

        if (pageNum === 1) {
            if (nextBtn) nextBtn.style.display = 'inline-block';
        } else if (pageNum === 4) {
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

        if (currentMode === 'teaching') {
            updateTeachingNavigationDisplay(currentTeachingPage);
        } else {
            const backBtn = document.getElementById('back-to-teaching-btn');
            const restartBtn = document.getElementById('restart-practice-btn');
            if (backBtn) backBtn.style.display = 'inline-block';
            if (restartBtn) restartBtn.style.display = 'inline-block';
        }
    }

    function showTeachingPage(pageNum) {
        currentTeachingPage = pageNum;
        document.querySelectorAll('.teaching-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`teaching-page${pageNum}`).classList.add('active');
        updateNavigationButtons();
        setReaderText(getTeachingPageText(pageNum));
    }

    function resetPractice() {
        practiceState.step = 1;
        practiceState.colorSelected = false;
        practiceState.landscapeSelected = false;
        practiceState.placed.portrait = false;
        practiceState.placed.value = false;

        document.querySelectorAll('.color-circle').forEach(btn => btn.classList.remove('selected'));

        if (colorError) {
            colorError.style.display = 'none';
        }

        if (colorSelectPanel) colorSelectPanel.style.display = 'block';
        if (colorSuccessPanel) colorSuccessPanel.style.display = 'none';

        if (colorCard) {
            colorCard.style.backgroundColor = 'transparent';
            colorCard.style.borderColor = '#d0d0d0';
            colorCard.style.boxShadow = 'none';
        }

        if (board) {
            board.style.backgroundImage = 'none';
            board.classList.remove('is-complete');
            board.style.backgroundColor = 'transparent';
        }

        if (backBoard) {
            backBoard.style.backgroundImage = 'none';
            backBoard.classList.remove('is-complete');
            backBoard.style.backgroundColor = 'transparent';
            backBoard.style.borderColor = '#d0d0d0';
            backBoard.style.boxShadow = 'none';
        }

        clearDropZone(dropPortrait, '头像');
        clearDropZone(dropValue, '面值');

        if (dropPortrait) dropPortrait.style.display = 'flex';
        if (dropValue) dropValue.style.display = 'flex';

        if (dragPortrait) {
            dragPortrait.classList.remove('used');
            dragPortrait.setAttribute('draggable', 'true');
        }
        if (dragValue) {
            dragValue.classList.remove('used');
            dragValue.setAttribute('draggable', 'true');
        }

        if (puzzleError) puzzleError.style.display = 'none';
        if (puzzleDragPanel) puzzleDragPanel.style.display = 'block';
        if (puzzleSuccessPanel) puzzleSuccessPanel.style.display = 'none';
        if (landscapeSelectPanel) landscapeSelectPanel.style.display = 'block';
        if (landscapeError) landscapeError.style.display = 'none';
        if (landscapeOptionsGrid) landscapeOptionsGrid.style.display = 'grid';
        if (landscapeSuccessPanel) landscapeSuccessPanel.style.display = 'none';

        if (dragPortraitImg) dragPortraitImg.src = currentRMB.portrait;
        if (dragValueImg) dragValueImg.src = currentRMB.value;

        if (page1) {
            switchPracticePage(1);
        }
        if (currentMode !== 'practice') {
            setReaderText(getTeachingPageText(currentTeachingPage));
        }

        buildLandscapeOptions();
    }

    function setPracticeStepsVisible(visible) {
        if (!practiceStepsContainer) return;
        practiceStepsContainer.style.display = visible ? 'block' : 'none';
    }

    window.switchMode = function(mode) {
        currentMode = mode;

        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-btn`).classList.add('active');

        document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${mode}-content`).classList.add('active');

        setPracticeStepsVisible(mode === 'practice');

        if (mode === 'practice') {
            resetPractice();
        } else {
            setReaderText(getTeachingPageText(currentTeachingPage));
        }

        updateNavigationButtons();
    };

    window.backToTeaching = function() {
        showTeachingPage(1);
        window.switchMode('teaching');
    };

    window.restartPractice = function() {
        if (currentMode !== 'practice') {
            window.switchMode('practice');
            return;
        }
        resetPractice();
    };

    window.nextTeachingPage = function() {
        if (currentMode !== 'teaching') return;
        if (currentTeachingPage < 4) {
            showTeachingPage(currentTeachingPage + 1);
        }
    };

    window.prevTeachingPage = function() {
        if (currentMode !== 'teaching') return;
        if (currentTeachingPage > 1) {
            showTeachingPage(currentTeachingPage - 1);
        }
    };

    window.selectColor = function(color, btn) {
        if (currentMode !== 'practice' || practiceState.step !== 1) return;

        document.querySelectorAll('.color-circle').forEach(circle => circle.classList.remove('selected'));
        btn.classList.add('selected');

        if (color === currentRMB.color) {
            practiceState.colorSelected = true;

            if (colorError) colorError.style.display = 'none';

            if (colorCard) {
                colorCard.style.backgroundColor = getPreviewColorCode(currentRMB.color);
                colorCard.style.borderColor = '#d0d0d0';
                colorCard.style.boxShadow = `0 0 0 6px ${getPreviewColorCode(currentRMB.color)}88`;
            }

            if (board) {
                board.style.backgroundColor = getPreviewColorCode(currentRMB.color);
                board.style.borderColor = '#d0d0d0';
                board.style.boxShadow = `0 0 0 6px ${getPreviewColorCode(currentRMB.color)}88`;
            }

            if (colorSelectPanel) colorSelectPanel.style.display = 'none';
            if (colorSuccessPanel) colorSuccessPanel.style.display = 'block';
            if (colorSuccessText) colorSuccessText.textContent = `恭喜！${currentRMB.name}的颜色是${currentRMB.colorName}，答对了！`;
            speakFeedback(`恭喜！${currentRMB.name}的颜色是${currentRMB.colorName}，答对了！`);
        } else {
            practiceState.colorSelected = false;

            if (colorCard) {
                colorCard.style.backgroundColor = 'transparent';
                colorCard.style.borderColor = '#d0d0d0';
                colorCard.style.boxShadow = 'none';
            }

            if (colorError) colorError.style.display = 'block';
            speakFeedback('颜色错误！请换一个颜色试试');
        }
    };

    window.nextColorStep = function() {
        switchPracticePage(2);
    };

    window.nextPracticeStep = function() {
        if (backBoard) {
            backBoard.style.backgroundColor = getPreviewColorCode(currentRMB.color);
            backBoard.style.borderColor = '#d0d0d0';
            backBoard.style.boxShadow = `0 0 0 6px ${getPreviewColorCode(currentRMB.color)}88`;
            backBoard.style.backgroundImage = 'none';
            backBoard.classList.remove('is-complete');
        }

        if (landscapeError) landscapeError.style.display = 'none';
        buildLandscapeOptions();
        switchPracticePage(3);
    };

    window.nextPracticeFinalStep = function() {
        const completionFrontImg = document.getElementById('completion-front-img');
        const completionBackImg = document.getElementById('completion-back-img');
        const completionText = document.getElementById('completion-text');

        if (completionFrontImg) completionFrontImg.src = currentRMB.front;
        if (completionBackImg) completionBackImg.src = currentRMB.back;
        if (completionText) completionText.textContent = `恭喜你完成${currentRMB.name}人民币的练习！`;

        switchPracticePage(4);
    };

    document.title = `认识人民币 - ${currentRMB.name}`;
    document.querySelector('.main-title').textContent = `认识人民币 - ${currentRMB.name}`;

    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById(`nav-${currentValue}`).classList.add('active');

    updateTeachingContent(currentRMB);
    showTeachingPage(currentTeachingPage); // also initialises reader text via setReaderText

    document.getElementById('prev-btn').addEventListener('click', () => {
        const currentIndex = values.indexOf(currentValue);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : values.length - 1;
        window.location.href = `?value=${values[prevIndex]}`;
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        const currentIndex = values.indexOf(currentValue);
        const nextIndex = currentIndex < values.length - 1 ? currentIndex + 1 : 0;
        window.location.href = `?value=${values[nextIndex]}`;
    });


    initPuzzleDnD();

    resetPractice();
    setPracticeStepsVisible(false);
});

