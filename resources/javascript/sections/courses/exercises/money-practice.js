document.addEventListener('DOMContentLoaded', () => {
    const levelConfig = {
        easy: {
            title: '兑钱练习 - 纸币兑换',
            allowCoins: false,
            navLabel: '纸币兑换'
        },
        medium: {
            title: '兑钱练习 - 综合兑换',
            allowCoins: true,
            navLabel: '综合兑换'
        }
    };

    const denominations = [
        { id: 'bill-100', label: '100元', valueFen: 10000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-100.jpg' },
        { id: 'bill-50', label: '50元', valueFen: 5000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-50.jpg' },
        { id: 'bill-20', label: '20元', valueFen: 2000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-20.jpg' },
        { id: 'bill-10', label: '10元', valueFen: 1000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-10.jpg' },
        { id: 'bill-5', label: '5元', valueFen: 500, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-5.jpg' },
        { id: 'bill-1', label: '1元', valueFen: 100, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-1.jpg' },
        { id: 'coin-1', label: '1元', valueFen: 100, type: 'coin-yuan', image: '../../../assets/images/coins/tail/yuan-1.jpg' },
        { id: 'coin-5j', label: '5角', valueFen: 50, type: 'coin-jiao', image: '../../../assets/images/coins/tail/jiao-5.jpg' },
        { id: 'coin-1j', label: '1角', valueFen: 10, type: 'coin-jiao', image: '../../../assets/images/coins/tail/jiao-1.jpg' }
    ];

    const dragMime = 'application/x-money-practice';
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level') === 'medium' ? 'medium' : 'easy';

    const state = {
        level,
        teacherItems: [],
        studentItems: [],
        mistakeCount: 0,
        dragDroppedInCounter: false,
        draggingCounterId: null,
        draggingCounterSide: null
    };

    const refs = {
        reader: document.getElementById('page-reader-text'),
        levelNavItems: Array.from(document.querySelectorAll('#level-navbar .nav-item')),
        mainTitle: document.getElementById('main-title'),
        teacherCounter: document.getElementById('teacher-counter'),
        studentCounter: document.getElementById('student-counter'),
        teacherResult: document.getElementById('teacher-result'),
        studentResult: document.getElementById('student-result'),
        billBank: document.getElementById('bill-bank'),
        coinBank: document.getElementById('coin-bank'),
        coinSection: document.getElementById('coin-section'),
        resetBtn: document.getElementById('reset-btn'),
        checkBtn: document.getElementById('check-btn')
    };

    function setReaderText(text) {
        if (refs.reader) refs.reader.textContent = text || '';
    }

    function speakFeedback(text) {
        setReaderText(text);
        if (window.voiceCore) window.voiceCore.speakText(text);
    }

    function formatFenToYuan(fen) {
        if (fen % 100 === 0) {
            return `${Math.round(fen / 100)}元`;
        }
        return `${(fen / 100).toFixed(1)}元`;
    }

    function getDenominationSize(type) {
        if (type === 'bill') return { w: 150, h: 72 };
        if (type === 'coin-yuan') return { w: 70, h: 70 };
        return { w: 60, h: 60 };
    }

    function getCounterItemClass(type) {
        if (type === 'bill') return 'counter-money bill';
        if (type === 'coin-yuan') return 'counter-money coin-yuan';
        return 'counter-money coin-jiao';
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function updateResult(el, message, levelName) {
        el.textContent = message;
        el.classList.remove('success', 'error');
        if (levelName) el.classList.add(levelName);
    }

    function setDefaultHints() {
        updateResult(refs.teacherResult, '将中间的人民币拖动到此处', null);
        updateResult(refs.studentResult, '将中间的人民币拖动到此处', null);
    }

    function isDenominationAllowed(den) {
        if (state.level === 'medium') return true;
        return den.type === 'bill';
    }

    function getCounterItems(side) {
        return side === 'teacher' ? state.teacherItems : state.studentItems;
    }

    function setCounterItems(side, items) {
        if (side === 'teacher') {
            state.teacherItems = items;
        } else {
            state.studentItems = items;
        }
    }

    function applyDragPreview(event, den) {
        if (!event.dataTransfer || !den) return;

        const size = getDenominationSize(den.type);
        const preview = document.createElement('div');
        preview.style.position = 'fixed';
        preview.style.left = '-9999px';
        preview.style.top = '-9999px';
        preview.style.width = `${size.w}px`;
        preview.style.height = `${size.h}px`;
        preview.style.pointerEvents = 'none';

        const img = document.createElement('img');
        img.src = den.image;
        img.alt = den.label;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        preview.appendChild(img);

        document.body.appendChild(preview);
        event.dataTransfer.setDragImage(preview, size.w / 2, size.h / 2);
        setTimeout(() => preview.remove(), 0);
    }

    function renderNavbarAndTitle() {
        refs.mainTitle.textContent = levelConfig[state.level].title;
        document.title = levelConfig[state.level].title;
        refs.levelNavItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.level === state.level);
        });
    }

    function renderBank() {
        const allowed = denominations.filter(isDenominationAllowed);
        const bills = allowed.filter(den => den.type === 'bill');
        const coins = allowed.filter(den => den.type !== 'bill');

        refs.billBank.innerHTML = bills.map((den) => `
            <div class="bank-money bill" draggable="true" data-id="${den.id}">
                <img src="${den.image}" alt="${den.label}">
                <div class="money-label">${den.label}</div>
            </div>
        `).join('');

        refs.coinBank.innerHTML = coins.map((den) => {
            const smallClass = den.type === 'coin-jiao' ? 'small' : '';
            return `
                <div class="bank-money coin ${smallClass}" draggable="true" data-id="${den.id}">
                    <img src="${den.image}" alt="${den.label}">
                    <div class="money-label">${den.label}</div>
                </div>
            `;
        }).join('');

        refs.coinSection.style.display = coins.length ? 'block' : 'none';

        document.querySelectorAll('.bank-money[draggable="true"]').forEach((el) => {
            el.addEventListener('dragstart', (event) => {
                const denominationId = el.dataset.id;
                const den = denominations.find(d => d.id === denominationId);
                state.dragDroppedInCounter = false;
                event.dataTransfer.setData(dragMime, JSON.stringify({ source: 'bank', denominationId }));
                applyDragPreview(event, den);
            });
        });
    }

    function parseDragPayload(event) {
        const raw = event.dataTransfer.getData(dragMime);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function getCounterEl(side) {
        return side === 'teacher' ? refs.teacherCounter : refs.studentCounter;
    }

    function placeMoneyAt(side, denominationId, rawX, rawY) {
        const den = denominations.find(d => d.id === denominationId);
        if (!den || !isDenominationAllowed(den)) return;

        const counterEl = getCounterEl(side);
        const size = getDenominationSize(den.type);
        const maxX = Math.max(0, counterEl.clientWidth - size.w);
        const maxY = Math.max(0, counterEl.clientHeight - size.h);
        const x = clamp(rawX - size.w / 2, 0, maxX);
        const y = clamp(rawY - size.h / 2, 0, maxY);

        const items = getCounterItems(side);
        items.push({
            id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            denominationId,
            x,
            y
        });

        renderCounterItems(side);
        const resultEl = side === 'teacher' ? refs.teacherResult : refs.studentResult;
        if (resultEl.textContent === '将中间的人民币拖动到此处') {
            updateResult(resultEl, '已放入人民币。', null);
        }
    }

    function moveCounterMoney(side, id, rawX, rawY) {
        const items = getCounterItems(side);
        const target = items.find(item => item.id === id);
        if (!target) return;

        const den = denominations.find(d => d.id === target.denominationId);
        if (!den) return;

        const counterEl = getCounterEl(side);
        const size = getDenominationSize(den.type);
        const maxX = Math.max(0, counterEl.clientWidth - size.w);
        const maxY = Math.max(0, counterEl.clientHeight - size.h);
        target.x = clamp(rawX - size.w / 2, 0, maxX);
        target.y = clamp(rawY - size.h / 2, 0, maxY);

        renderCounterItems(side);
    }

    function removeCounterItem(side, id) {
        const next = getCounterItems(side).filter(item => item.id !== id);
        setCounterItems(side, next);
        renderCounterItems(side);

        const resultEl = side === 'teacher' ? refs.teacherResult : refs.studentResult;
        if (!next.length) {
            updateResult(resultEl, '将中间的人民币拖动到此处', null);
        }
    }

    function renderCounterItems(side) {
        const counterEl = getCounterEl(side);
        const items = getCounterItems(side);
        counterEl.innerHTML = '';

        items.forEach((item) => {
            const den = denominations.find(d => d.id === item.denominationId);
            if (!den) return;

            const el = document.createElement('div');
            el.className = getCounterItemClass(den.type);
            el.style.left = `${item.x}px`;
            el.style.top = `${item.y}px`;
            el.dataset.id = item.id;
            el.draggable = true;

            const img = document.createElement('img');
            img.src = den.image;
            img.alt = den.label;
            el.appendChild(img);

            el.addEventListener('dragstart', (event) => {
                state.draggingCounterId = item.id;
                state.draggingCounterSide = side;
                state.dragDroppedInCounter = false;
                event.dataTransfer.setData(dragMime, JSON.stringify({ source: 'counter', id: item.id, side }));
                applyDragPreview(event, den);
            });

            el.addEventListener('dragend', () => {
                if (!state.dragDroppedInCounter && state.draggingCounterId === item.id && state.draggingCounterSide === side) {
                    removeCounterItem(side, item.id);
                }
                state.draggingCounterId = null;
                state.draggingCounterSide = null;
            });

            counterEl.appendChild(el);
        });
    }

    function getTotalFen(items) {
        return items.reduce((sum, item) => {
            const den = denominations.find(d => d.id === item.denominationId);
            return sum + (den ? den.valueFen : 0);
        }, 0);
    }

    function checkAnswer() {
        const teacherMoney = getTotalFen(state.teacherItems);
        const studentMoney = getTotalFen(state.studentItems);

        if (teacherMoney === studentMoney) {
            state.mistakeCount = 0;
            updateResult(refs.studentResult, '回答正确！', 'success');
            speakFeedback('回答正确！');
            return;
        }

        if (state.mistakeCount === 0) {
            updateResult(refs.studentResult, '回答错误，请在好好想一想哦！', 'error');
            speakFeedback('回答错误，请在好好想一想哦！');
        } else {
            const diff = Math.abs(studentMoney - teacherMoney);
            const direction = studentMoney < teacherMoney ? '少了' : '多了';
            const message = `回答错误，请在好好想一想哦！\n${direction}${formatFenToYuan(diff)}。`;
            updateResult(refs.studentResult, message, 'error');
            speakFeedback(`回答错误，请在好好想一想哦！${direction}${formatFenToYuan(diff)}。`);
        }
        state.mistakeCount += 1;
    }

    function resetAll() {
        state.teacherItems = [];
        state.studentItems = [];
        state.mistakeCount = 0;
        renderCounterItems('teacher');
        renderCounterItems('student');
        setDefaultHints();
        speakFeedback('已重置，已清空老师和学生的人民币。');
    }

    function bindCounterDropWithMove(side) {
        const counterEl = getCounterEl(side);

        counterEl.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        counterEl.addEventListener('drop', (event) => {
            event.preventDefault();
            const payload = parseDragPayload(event);
            if (!payload) return;

            const rect = counterEl.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;

            if (payload.source === 'bank') {
                placeMoneyAt(side, payload.denominationId, localX, localY);
                state.dragDroppedInCounter = true;
                return;
            }

            if (payload.source === 'counter') {
                state.dragDroppedInCounter = true;

                if (payload.side === side) {
                    moveCounterMoney(side, payload.id, localX, localY);
                    return;
                }

                const sourceSide = payload.side;
                const sourceItems = getCounterItems(sourceSide);
                const moving = sourceItems.find(item => item.id === payload.id);
                if (!moving) return;

                setCounterItems(sourceSide, sourceItems.filter(item => item.id !== payload.id));
                renderCounterItems(sourceSide);

                const sourceHint = sourceSide === 'teacher' ? refs.teacherResult : refs.studentResult;
                if (!getCounterItems(sourceSide).length) {
                    updateResult(sourceHint, '将中间的人民币拖动到此处', null);
                }

                const den = denominations.find(d => d.id === moving.denominationId);
                if (!den) return;
                const size = getDenominationSize(den.type);
                const maxX = Math.max(0, counterEl.clientWidth - size.w);
                const maxY = Math.max(0, counterEl.clientHeight - size.h);
                moving.x = clamp(localX - size.w / 2, 0, maxX);
                moving.y = clamp(localY - size.h / 2, 0, maxY);

                const targetItems = getCounterItems(side);
                targetItems.push(moving);
                renderCounterItems(side);
            }
        });
    }

    function bindEvents() {
        refs.levelNavItems.forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const target = item.dataset.level;
                if (!levelConfig[target] || target === state.level) return;
                window.location.href = `?level=${target}`;
            });
        });

        refs.resetBtn.addEventListener('click', resetAll);
        refs.checkBtn.addEventListener('click', checkAnswer);

        bindCounterDropWithMove('teacher');
        bindCounterDropWithMove('student');
    }

    function announceEnter() {
        const text = `当前是${levelConfig[state.level].navLabel}。请先在左侧放置老师金额，再在右侧放置同等金额。`;
        setReaderText(text);
    }

    function init() {
        renderNavbarAndTitle();
        renderBank();
        setDefaultHints();
        renderCounterItems('teacher');
        renderCounterItems('student');
        bindEvents();
        announceEnter();
    }

    init();
});


