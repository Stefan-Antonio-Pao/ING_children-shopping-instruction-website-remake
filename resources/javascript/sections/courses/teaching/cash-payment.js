document.addEventListener('DOMContentLoaded', () => {
    const categoryData = {
        fruits: {
            name: '水果',
            items: [
                { key: 'apple', name: '苹果', image: '../../../assets/images/fruits/apple.png', intPriceFen: 700, fltPriceFen: 680 },
                { key: 'banana', name: '香蕉', image: '../../../assets/images/fruits/banana.jpeg', intPriceFen: 200, fltPriceFen: 230 },
                { key: 'orange', name: '橙子', image: '../../../assets/images/fruits/orange.png', intPriceFen: 2500, fltPriceFen: 2560 },
                { key: 'strawberry', name: '草莓', image: '../../../assets/images/fruits/strawberry.png', intPriceFen: 12600, fltPriceFen: 12540 }
            ]
        },
        snacks: {
            name: '零食',
            items: [
                { key: 'biscuit', name: '饼干', image: '../../../assets/images/snacks/biscuit.jpg', intPriceFen: 1200, fltPriceFen: 1250 },
                { key: 'chips', name: '薯片', image: '../../../assets/images/snacks/chips.jpeg', intPriceFen: 3800, fltPriceFen: 3820 },
                { key: 'kitkat', name: '巧克力', image: '../../../assets/images/snacks/kitkat.jpeg', intPriceFen: 22800, fltPriceFen: 22780 },
                { key: 'yogurt', name: '酸奶', image: '../../../assets/images/snacks/yogurt.png', intPriceFen: 900, fltPriceFen: 960 }
            ]
        },
        'study-tools': {
            name: '文具',
            items: [
                { key: 'eraser', name: '橡皮', image: '../../../assets/images/study-tools/eraser.jpeg', intPriceFen: 4100, fltPriceFen: 4160 },
                { key: 'notebook', name: '笔记本', image: '../../../assets/images/study-tools/notebook.jpg', intPriceFen: 300, fltPriceFen: 320 },
                { key: 'pencil', name: '铅笔', image: '../../../assets/images/study-tools/pencil.jpg', intPriceFen: 23600, fltPriceFen: 23540 },
                { key: 'ruler', name: '尺子', image: '../../../assets/images/study-tools/ruler.png', intPriceFen: 200, fltPriceFen: 180 }
            ]
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

    const state = {
        activeCategory: 'fruits',
        goodIndex: 0,
        priceMode: 'int',
        showMoneyLabels: false,
        counterItems: [],
        insufficientCount: 0,
        dragDroppedInCounter: false,
        draggingCounterId: null
    };

    const refs = {
        reader: document.getElementById('page-reader-text'),
        categoryNavItems: Array.from(document.querySelectorAll('#category-navbar .nav-item')),
        itemStrip: document.getElementById('item-strip'),
        goodImage: document.getElementById('good-image'),
        priceTag: document.getElementById('price-tag'),
        prevGoodBtn: document.getElementById('prev-good-btn'),
        nextGoodBtn: document.getElementById('next-good-btn'),
        moneyCounter: document.getElementById('money-counter'),
        resultMessage: document.getElementById('result-message'),
        billBank: document.getElementById('bill-bank'),
        coinBank: document.getElementById('coin-bank'),
        resetBtn: document.getElementById('reset-btn'),
        checkBtn: document.getElementById('check-btn'),
        modeToggleBtn: document.getElementById('mode-toggle-btn'),
        labelToggleBtn: document.getElementById('label-toggle-btn'),
        moneyBank: document.getElementById('money-bank')
    };

    const dragMime = 'application/x-cash-payment';

    function setReaderText(text) {
        if (refs.reader) refs.reader.textContent = text || '';
    }

    function speakFeedback(text) {
        setReaderText(text);
        if (window.voiceCore) window.voiceCore.speakText(text);
    }

    function formatFenToYuan(fen, forceOneDecimal) {
        if (forceOneDecimal) {
            return `${(fen / 100).toFixed(1)}元`;
        }
        return `${Math.round(fen / 100)}元`;
    }

    function getCurrentCategory() {
        return categoryData[state.activeCategory];
    }

    function getCurrentGoods() {
        return getCurrentCategory().items;
    }

    function getCurrentGood() {
        return getCurrentGoods()[state.goodIndex];
    }

    function getCurrentPriceFen() {
        const good = getCurrentGood();
        return state.priceMode === 'int' ? good.intPriceFen : good.fltPriceFen;
    }

    function getUserMoneyFen() {
        return state.counterItems.reduce((sum, item) => {
            const den = denominations.find(d => d.id === item.denominationId);
            return sum + (den ? den.valueFen : 0);
        }, 0);
    }

    function getCounterItemClass(type) {
        if (type === 'bill') return 'counter-money bill';
        if (type === 'coin-yuan') return 'counter-money coin-yuan';
        return 'counter-money coin-jiao';
    }

    function getDenominationSize(type) {
        if (type === 'bill') return { w: 150, h: 72 };
        if (type === 'coin-yuan') return { w: 70, h: 70 };
        return { w: 60, h: 60 };
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

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function setResultMessage(message, level) {
        refs.resultMessage.textContent = message;
        refs.resultMessage.classList.remove('success', 'error');
        if (level === 'success') refs.resultMessage.classList.add('success');
        if (level === 'error') refs.resultMessage.classList.add('error');
    }

    function setDefaultHint() {
        setResultMessage('将右侧的人民币拖动到此处', null);
    }

    function renderCategoryNav() {
        refs.categoryNavItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.category === state.activeCategory);
        });
    }

    function renderItemStrip() {
        const goods = getCurrentGoods();
        refs.itemStrip.innerHTML = goods.map((good, index) => `
            <button type="button" class="item-chip ${index === state.goodIndex ? 'active' : ''}" data-index="${index}">
                <img src="${good.image}" alt="${good.name}">
                <span>${good.name}</span>
            </button>
        `).join('');

        refs.itemStrip.querySelectorAll('.item-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const newIndex = parseInt(chip.dataset.index, 10);
                if (!Number.isInteger(newIndex) || newIndex === state.goodIndex) return;
                state.goodIndex = newIndex;
                clearCounterAndAttempts();
                renderAll();
                announceCurrentGood();
            });
        });
    }

    function renderGoodDisplay() {
        const good = getCurrentGood();
        const priceFen = getCurrentPriceFen();
        refs.goodImage.src = good.image;
        refs.goodImage.alt = good.name;
        refs.priceTag.textContent = formatFenToYuan(priceFen, state.priceMode === 'flt');
    }

    function renderModeButton() {
        refs.modeToggleBtn.classList.remove('mode-int', 'mode-flt');
        refs.modeToggleBtn.classList.add(state.priceMode === 'int' ? 'mode-int' : 'mode-flt');
        refs.modeToggleBtn.innerHTML = '<span class="mode-label int">整</span>/<span class="mode-label flt">零</span>';
    }

    function renderLabelToggleButton() {
        if (!refs.labelToggleBtn) return;
        refs.labelToggleBtn.textContent = state.showMoneyLabels ? '名称提示：开' : '名称提示：关';
        if (refs.moneyBank) {
            refs.moneyBank.classList.toggle('show-labels', state.showMoneyLabels);
        }
    }

    function renderCounterItems() {
        refs.moneyCounter.innerHTML = '';

        state.counterItems.forEach((item) => {
            const den = denominations.find(d => d.id === item.denominationId);
            if (!den) return;

            const el = document.createElement('div');
            el.className = getCounterItemClass(den.type);
            el.style.left = `${item.x}px`;
            el.style.top = `${item.y}px`;
            el.draggable = true;
            el.dataset.id = item.id;

            const img = document.createElement('img');
            img.src = den.image;
            img.alt = den.label;
            el.appendChild(img);

            el.addEventListener('dragstart', (event) => {
                state.draggingCounterId = item.id;
                state.dragDroppedInCounter = false;
                event.dataTransfer.setData(dragMime, JSON.stringify({ source: 'counter', id: item.id }));
                applyDragPreview(event, den);
            });

            el.addEventListener('dragend', () => {
                if (state.draggingCounterId === item.id && !state.dragDroppedInCounter) {
                    state.counterItems = state.counterItems.filter(counterItem => counterItem.id !== item.id);
                    renderCounterItems();
                    if (!state.counterItems.length) setDefaultHint();
                }
                state.draggingCounterId = null;
            });

            refs.moneyCounter.appendChild(el);
        });
    }

    function renderMoneyBank() {
        const bills = denominations.filter(d => d.type === 'bill');
        const coins = denominations.filter(d => d.type !== 'bill');

        refs.billBank.innerHTML = bills.map((den) => `
            <div class="bank-money bill" draggable="true" data-id="${den.id}">
                <img src="${den.image}" alt="${den.label}">
                <div class="money-label">${den.label}</div>
            </div>
        `).join('');

        refs.coinBank.innerHTML = coins.map((den) => {
            const smallClass = den.id === 'coin-5j' || den.id === 'coin-1j' ? 'small' : '';
            return `
                <div class="bank-money coin ${smallClass}" draggable="true" data-id="${den.id}">
                    <img src="${den.image}" alt="${den.label}">
                    <div class="money-label">${den.label}</div>
                </div>
            `;
        }).join('');

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

    function placeMoneyAt(denominationId, rawX, rawY) {
        const den = denominations.find(d => d.id === denominationId);
        if (!den) return;

        const size = getDenominationSize(den.type);
        const maxX = Math.max(0, refs.moneyCounter.clientWidth - size.w);
        const maxY = Math.max(0, refs.moneyCounter.clientHeight - size.h);
        const x = clamp(rawX - size.w / 2, 0, maxX);
        const y = clamp(rawY - size.h / 2, 0, maxY);

        state.counterItems.push({
            id: `counter-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            denominationId,
            x,
            y
        });
        renderCounterItems();
        if (refs.resultMessage.textContent === '将右侧的人民币拖动到此处') {
            setResultMessage('已放入现金，点击“核对”检查金额。', null);
        }
    }

    function moveCounterMoney(id, rawX, rawY) {
        const target = state.counterItems.find(item => item.id === id);
        if (!target) return;
        const den = denominations.find(d => d.id === target.denominationId);
        if (!den) return;

        const size = getDenominationSize(den.type);
        const maxX = Math.max(0, refs.moneyCounter.clientWidth - size.w);
        const maxY = Math.max(0, refs.moneyCounter.clientHeight - size.h);
        target.x = clamp(rawX - size.w / 2, 0, maxX);
        target.y = clamp(rawY - size.h / 2, 0, maxY);
        renderCounterItems();
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

    function clearCounterAndAttempts() {
        state.counterItems = [];
        state.insufficientCount = 0;
        setDefaultHint();
    }

    function announceCurrentGood() {
        const good = getCurrentGood();
        const priceText = formatFenToYuan(getCurrentPriceFen(), state.priceMode === 'flt');
        const text = `当前物品的价格是${priceText}，请将右侧的人民币拖入中间的灰色区域以支付。`;
        // Only update reader text here; page-reader will auto-play it only when autoPlay is enabled.
        setReaderText(text);
        refs.goodImage.alt = `${good.name}，价格${priceText}`;
    }

    function checkPayment() {
        const target = getCurrentPriceFen();
        const userMoney = getUserMoneyFen();

        if (userMoney >= target) {
            const change = userMoney - target;
            state.insufficientCount = 0;
            if (change === 0) {
                const text = '恭喜完成支付！';
                setResultMessage(text, 'success');
                speakFeedback(text);
            } else {
                const text = `恭喜完成支付！\n有${formatFenToYuan(change, state.priceMode === 'flt')}的找零。`;
                setResultMessage(text, 'success');
                speakFeedback(`恭喜完成支付！有${formatFenToYuan(change, state.priceMode === 'flt')}的找零。`);
            }
            return;
        }

        const remain = target - userMoney;
        if (state.insufficientCount === 0) {
            const text = '支付的现金不足！';
            setResultMessage(text, 'error');
            speakFeedback(text);
        } else {
            const text = `支付的现金不足！\n还需要${formatFenToYuan(remain, state.priceMode === 'flt')}待支付。`;
            setResultMessage(text, 'error');
            speakFeedback(`支付的现金不足！还需要${formatFenToYuan(remain, state.priceMode === 'flt')}待支付。`);
        }
        state.insufficientCount += 1;
    }

    function handleCategorySwitch(categoryKey) {
        if (!categoryData[categoryKey] || categoryKey === state.activeCategory) return;
        state.activeCategory = categoryKey;
        state.goodIndex = 0;
        clearCounterAndAttempts();
        renderAll();
        announceCurrentGood();
    }

    function switchGood(offset) {
        const goods = getCurrentGoods();
        state.goodIndex = (state.goodIndex + offset + goods.length) % goods.length;
        clearCounterAndAttempts();
        renderAll();
        announceCurrentGood();
    }

    function togglePriceMode() {
        state.priceMode = state.priceMode === 'int' ? 'flt' : 'int';
        state.insufficientCount = 0;
        renderGoodDisplay();
        renderModeButton();
        const modeText = state.priceMode === 'int' ? '整价模式' : '零价模式';
        speakFeedback(`已切换到${modeText}。`);
        announceCurrentGood();
    }

    function bindEvents() {
        refs.categoryNavItems.forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                handleCategorySwitch(item.dataset.category);
            });
        });

        refs.prevGoodBtn.addEventListener('click', () => switchGood(-1));
        refs.nextGoodBtn.addEventListener('click', () => switchGood(1));

        refs.modeToggleBtn.addEventListener('click', togglePriceMode);
        refs.labelToggleBtn.addEventListener('click', () => {
            state.showMoneyLabels = !state.showMoneyLabels;
            renderLabelToggleButton();
            speakFeedback(state.showMoneyLabels ? '已显示货币名称提示。' : '已隐藏货币名称提示。');
        });
        refs.resetBtn.addEventListener('click', () => {
            clearCounterAndAttempts();
            renderCounterItems();
            speakFeedback('已重置，已清空放置的人民币。');
        });
        refs.checkBtn.addEventListener('click', checkPayment);

        refs.moneyCounter.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        refs.moneyCounter.addEventListener('drop', (event) => {
            event.preventDefault();
            const payload = parseDragPayload(event);
            if (!payload) return;

            const rect = refs.moneyCounter.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;

            if (payload.source === 'bank') {
                placeMoneyAt(payload.denominationId, localX, localY);
            }

            if (payload.source === 'counter') {
                state.dragDroppedInCounter = true;
                moveCounterMoney(payload.id, localX, localY);
            }
        });
    }

    function renderAll() {
        renderCategoryNav();
        renderItemStrip();
        renderGoodDisplay();
        renderModeButton();
        renderLabelToggleButton();
        renderCounterItems();
    }

    function init() {
        renderMoneyBank();
        bindEvents();
        setDefaultHint();
        renderAll();
        announceCurrentGood();
    }

    init();
});


