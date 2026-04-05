document.addEventListener('DOMContentLoaded', () => {
    const categoryData = {
        fruits: {
            name: '水果',
            items: [
                { key: 'apple', name: '苹果', image: '../../../assets/images/fruits/apple.png' },
                { key: 'banana', name: '香蕉', image: '../../../assets/images/fruits/banana.jpeg' },
                { key: 'orange', name: '橙子', image: '../../../assets/images/fruits/orange.png' },
                { key: 'strawberry', name: '草莓', image: '../../../assets/images/fruits/strawberry.png' }
            ]
        },
        snacks: {
            name: '零食',
            items: [
                { key: 'biscuit', name: '饼干', image: '../../../assets/images/snacks/biscuit.jpg' },
                { key: 'chips', name: '薯片', image: '../../../assets/images/snacks/chips.jpeg' },
                { key: 'kitkat', name: '巧克力', image: '../../../assets/images/snacks/kitkat.jpeg' },
                { key: 'yogurt', name: '酸奶', image: '../../../assets/images/snacks/yogurt.png' }
            ]
        },
        'study-tools': {
            name: '文具',
            items: [
                { key: 'eraser', name: '橡皮', image: '../../../assets/images/study-tools/eraser.jpeg' },
                { key: 'notebook', name: '笔记本', image: '../../../assets/images/study-tools/notebook.jpg' },
                { key: 'pencil', name: '铅笔', image: '../../../assets/images/study-tools/pencil.jpg' },
                { key: 'ruler', name: '尺子', image: '../../../assets/images/study-tools/ruler.png' }
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

    const STORAGE_KEYS = {
        systemDefaults: 'cashPayment.systemPresetDefaults.v1',
        userPresets: 'cashPayment.userPresets.v1',
        activePreset: 'cashPayment.activePresetId.v1',
        paymentRuleMode: 'cashPayment.paymentRuleMode.v1'
    };

    const PRESET_IDS = ['preset1', 'preset2', 'preset3'];
    const PRESET_META = {
        preset1: { name: '价格预设1', allowDecimal: false },
        preset2: { name: '价格预设2', allowDecimal: true },
        preset3: { name: '价格预设3', allowDecimal: true }
    };

    const CATEGORY_RANGES_FEN = {
        fruits: { min: 300, max: 3000 },
        snacks: { min: 300, max: 6000 },
        'study-tools': { min: 200, max: 5000 }
    };

    const state = {
        activeCategory: 'fruits',
        goodIndex: 0,
        showMoneyLabels: false,
        counterItems: [],
        insufficientCount: 0,
        dragDroppedInCounter: false,
        draggingCounterId: null,
        paymentRuleMode: 'change',
        activeView: 'practice',
        activePresetId: 'preset1',
        settingActivePresetId: 'preset1',
        systemPresetDefaults: null,
        pricePresets: null,
        priceSettingDraft: null
    };

    const refs = {
        reader: document.getElementById('page-reader-text'),
        practiceView: document.getElementById('practice-view'),
        priceSettingView: document.getElementById('price-setting-view'),
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
        openPriceSettingBtn: document.getElementById('open-price-setting-btn'),
        labelToggleBtn: document.getElementById('label-toggle-btn'),
        moneyBank: document.getElementById('money-bank'),
        pricePresetNavItems: Array.from(document.querySelectorAll('#price-preset-navbar .nav-item')),
        priceSettingCanvas: document.getElementById('price-setting-canvas'),
        settingResetBtn: document.getElementById('setting-reset-btn'),
        settingSaveBtn: document.getElementById('setting-save-btn'),
        settingApplyBtn: document.getElementById('setting-apply-btn'),
        settingDecimalToggleBtn: document.getElementById('setting-decimal-toggle-btn'),
        settingCancelBtn: document.getElementById('setting-cancel-btn')
    };

    const dragMime = 'application/x-cash-payment';

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function randomInRange(min, max, step) {
        const safeStep = Math.max(step, 1);
        const count = Math.floor((max - min) / safeStep);
        const index = Math.floor(Math.random() * (count + 1));
        return min + index * safeStep;
    }

    function getAllGoods() {
        const goods = [];
        Object.keys(categoryData).forEach((categoryKey) => {
            categoryData[categoryKey].items.forEach((item) => {
                goods.push({ categoryKey, ...item });
            });
        });
        return goods;
    }

    function getAllItemKeys() {
        return getAllGoods().map(item => item.key);
    }

    function createRandomPriceMap(allowDecimal) {
        const prices = {};
        getAllGoods().forEach((item) => {
            const range = CATEGORY_RANGES_FEN[item.categoryKey];
            const step = allowDecimal ? 10 : 100;
            prices[item.key] = randomInRange(range.min, range.max, step);
        });
        return prices;
    }

    function createZeroPriceMap() {
        const prices = {};
        getAllItemKeys().forEach((key) => {
            prices[key] = 0;
        });
        return prices;
    }

    function createSystemDefaults() {
        return {
            preset1: {
                id: 'preset1',
                name: PRESET_META.preset1.name,
                allowDecimal: false,
                prices: createRandomPriceMap(false)
            },
            preset2: {
                id: 'preset2',
                name: PRESET_META.preset2.name,
                allowDecimal: true,
                prices: createRandomPriceMap(true)
            },
            preset3: {
                id: 'preset3',
                name: PRESET_META.preset3.name,
                allowDecimal: true,
                prices: createZeroPriceMap()
            }
        };
    }

    function normalizePriceFen(value, allowDecimal) {
        if (!Number.isFinite(value)) return 0;
        const clamped = Math.max(0, Math.round(value));
        const step = allowDecimal ? 10 : 100;
        return Math.round(clamped / step) * step;
    }

    function normalizePreset(rawPreset, fallbackPreset) {
        const preset = clone(fallbackPreset);
        if (!rawPreset || typeof rawPreset !== 'object') return preset;

        preset.allowDecimal = Boolean(rawPreset.allowDecimal);
        preset.name = PRESET_META[preset.id].name;

        const sourcePrices = rawPreset.prices && typeof rawPreset.prices === 'object' ? rawPreset.prices : {};
        Object.keys(preset.prices).forEach((itemKey) => {
            const rawValue = Number(sourcePrices[itemKey]);
            if (Number.isFinite(rawValue)) {
                preset.prices[itemKey] = normalizePriceFen(rawValue, preset.allowDecimal);
            }
        });

        return preset;
    }

    function normalizePresetCollection(rawCollection, fallbackCollection) {
        const output = clone(fallbackCollection);
        if (!rawCollection || typeof rawCollection !== 'object') return output;

        PRESET_IDS.forEach((presetId) => {
            output[presetId] = normalizePreset(rawCollection[presetId], fallbackCollection[presetId]);
        });
        return output;
    }

    function loadJson(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function saveJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function loadSystemPresetDefaults() {
        const generatedDefaults = createSystemDefaults();
        const stored = loadJson(STORAGE_KEYS.systemDefaults);
        const normalized = normalizePresetCollection(stored, generatedDefaults);
        if (!stored) {
            saveJson(STORAGE_KEYS.systemDefaults, normalized);
        }
        return normalized;
    }

    function loadUserPresets(systemDefaults) {
        const stored = loadJson(STORAGE_KEYS.userPresets);
        if (!stored) return clone(systemDefaults);
        return normalizePresetCollection(stored, systemDefaults);
    }

    function saveUserPresets() {
        saveJson(STORAGE_KEYS.userPresets, state.pricePresets);
    }

    function loadActivePresetId() {
        const stored = localStorage.getItem(STORAGE_KEYS.activePreset);
        return PRESET_IDS.includes(stored) ? stored : 'preset1';
    }

    function saveActivePresetId() {
        localStorage.setItem(STORAGE_KEYS.activePreset, state.activePresetId);
    }

    function loadPaymentRuleMode() {
        const stored = localStorage.getItem(STORAGE_KEYS.paymentRuleMode);
        return stored === 'exact' || stored === 'change' ? stored : 'change';
    }

    function savePaymentRuleMode() {
        localStorage.setItem(STORAGE_KEYS.paymentRuleMode, state.paymentRuleMode);
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

    function getCurrentPreset() {
        return state.pricePresets[state.activePresetId];
    }

    function getCurrentPriceFen() {
        const preset = getCurrentPreset();
        const good = getCurrentGood();
        if (!preset || !preset.prices) return 0;
        return normalizePriceFen(Number(preset.prices[good.key]), preset.allowDecimal);
    }

    function getUserMoneyFen() {
        return state.counterItems.reduce((sum, item) => {
            const den = denominations.find(d => d.id === item.denominationId);
            return sum + (den ? den.valueFen : 0);
        }, 0);
    }

    function formatFenToYuan(fen, allowDecimal) {
        if (allowDecimal || fen % 100 !== 0) {
            return `${(fen / 100).toFixed(1)}元`;
        }
        return `${Math.round(fen / 100)}元`;
    }

    function formatFenForInput(fen, allowDecimal) {
        if (allowDecimal) return (fen / 100).toFixed(1);
        return String(Math.round(fen / 100));
    }

    function parseInputToFen(raw, allowDecimal) {
        const text = String(raw || '').trim();
        if (!text) return 0;
        const number = Number(text);
        if (!Number.isFinite(number) || number < 0) return null;
        const fen = Math.round(number * 100);
        return normalizePriceFen(fen, allowDecimal);
    }

    function setReaderText(text) {
        if (refs.reader) refs.reader.textContent = text || '';
    }

    function speakFeedback(text) {
        setReaderText(text);
        if (window.voiceCore) window.voiceCore.speakText(text);
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
        const preset = getCurrentPreset();
        const priceFen = getCurrentPriceFen();
        refs.goodImage.src = good.image;
        refs.goodImage.alt = good.name;
        refs.priceTag.textContent = formatFenToYuan(priceFen, preset.allowDecimal);
    }

    function renderModeButton() {
        const modeText = state.paymentRuleMode === 'exact' ? '否' : '是';
        refs.modeToggleBtn.textContent = `支持找零：${modeText}`;
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
        const preset = getCurrentPreset();
        const priceText = formatFenToYuan(getCurrentPriceFen(), preset.allowDecimal);
        const text = `当前物品的价格是${priceText}，请将右侧的人民币拖入中间的灰色区域以支付。`;
        setReaderText(text);
        refs.goodImage.alt = `${good.name}，价格${priceText}`;
    }

    function checkPayment() {
        const target = getCurrentPriceFen();
        const preset = getCurrentPreset();
        const targetText = formatFenToYuan(target, preset.allowDecimal);
        const userMoney = getUserMoneyFen();

        if (state.paymentRuleMode === 'exact') {
            if (userMoney === target) {
                const text = '恭喜完成支付！金额完全正确。';
                setResultMessage(text, 'success');
                speakFeedback(text);
                state.insufficientCount = 0;
                return;
            }

            if (userMoney < target) {
                const remain = target - userMoney;
                const remainText = formatFenToYuan(remain, preset.allowDecimal);
                const text = `整额模式需要与商品价格完全相同。当前价格是${targetText}，还差${remainText}。`;
                setResultMessage(text, 'error');
                speakFeedback(text);
                state.insufficientCount += 1;
                return;
            }

            const extra = userMoney - target;
            const extraText = formatFenToYuan(extra, preset.allowDecimal);
            const text = `整额模式不能多付。当前价格是${targetText}，你多付了${extraText}。请调整为刚好相同金额。`;
            setResultMessage(text, 'error');
            speakFeedback(text);
            return;
        }

        if (userMoney >= target) {
            const change = userMoney - target;
            state.insufficientCount = 0;
            if (change === 0) {
                const text = '恭喜完成支付！';
                setResultMessage(text, 'success');
                speakFeedback(text);
            } else {
                const changeText = formatFenToYuan(change, preset.allowDecimal);
                const text = `恭喜完成支付！\n有${changeText}的找零。`;
                setResultMessage(text, 'success');
                speakFeedback(`恭喜完成支付！有${changeText}的找零。`);
            }
            return;
        }

        const remain = target - userMoney;
        const remainText = formatFenToYuan(remain, preset.allowDecimal);
        if (state.insufficientCount === 0) {
            const text = '支付的现金不足！';
            setResultMessage(text, 'error');
            speakFeedback(text);
        } else {
            const text = `支付的现金不足！\n还需要${remainText}待支付。`;
            setResultMessage(text, 'error');
            speakFeedback(`支付的现金不足！还需要${remainText}待支付。`);
        }
        state.insufficientCount += 1;
    }

    function renderPricePresetNavbar() {
        refs.pricePresetNavItems.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.preset === state.settingActivePresetId);
        });
    }

    function getSettingDraftPreset() {
        return state.priceSettingDraft[state.settingActivePresetId];
    }

    function renderPriceSettingDecimalButton() {
        const preset = getSettingDraftPreset();
        refs.settingDecimalToggleBtn.textContent = `含小数：${preset.allowDecimal ? '开' : '关'}`;
    }

    function renderPriceSettingCanvas() {
        const preset = getSettingDraftPreset();
        const cards = getAllGoods().map((item) => {
            const priceFen = normalizePriceFen(Number(preset.prices[item.key]), preset.allowDecimal);
            return `
                <div class="price-card">
                    <div class="price-image-wrap">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="price-good-name">${item.name}</div>
                    <label class="price-input-row">
                        <input
                            type="number"
                            min="0"
                            step="${preset.allowDecimal ? '0.1' : '1'}"
                            inputmode="decimal"
                            data-item-key="${item.key}"
                            value="${formatFenForInput(priceFen, preset.allowDecimal)}"
                        >
                        <span class="unit">元</span>
                    </label>
                </div>
            `;
        }).join('');

        refs.priceSettingCanvas.innerHTML = `<div class="price-setting-grid">${cards}</div>`;

        refs.priceSettingCanvas.querySelectorAll('input[data-item-key]').forEach((input) => {
            input.addEventListener('change', () => {
                const draftPreset = getSettingDraftPreset();
                const parsedFen = parseInputToFen(input.value, draftPreset.allowDecimal);
                if (parsedFen === null) {
                    input.value = formatFenForInput(draftPreset.prices[input.dataset.itemKey] || 0, draftPreset.allowDecimal);
                    return;
                }
                draftPreset.prices[input.dataset.itemKey] = parsedFen;
                input.value = formatFenForInput(parsedFen, draftPreset.allowDecimal);
            });
        });
    }

    function renderPriceSetting() {
        renderPricePresetNavbar();
        renderPriceSettingDecimalButton();
        renderPriceSettingCanvas();
    }

    function openPriceSettingView() {
        state.activeView = 'price-setting';
        state.settingActivePresetId = state.activePresetId;
        state.priceSettingDraft = clone(state.pricePresets);
        refs.practiceView.classList.add('hidden');
        refs.priceSettingView.classList.remove('hidden');
        renderPriceSetting();
    }

    function closePriceSettingViewAndBackToPractice() {
        state.activeView = 'practice';
        state.priceSettingDraft = null;
        refs.priceSettingView.classList.add('hidden');
        refs.practiceView.classList.remove('hidden');
        clearCounterAndAttempts();
        renderAll();
        announceCurrentGood();
    }

    function resetCurrentSettingPreset() {
        const presetId = state.settingActivePresetId;
        state.priceSettingDraft[presetId] = clone(state.systemPresetDefaults[presetId]);
        renderPriceSetting();
        speakFeedback(`已重置${PRESET_META[presetId].name}为系统默认价格。`);
    }

    function saveCurrentPriceSettings() {
        state.pricePresets = clone(state.priceSettingDraft);
        state.activePresetId = state.settingActivePresetId;
        saveUserPresets();
        saveActivePresetId();
        renderAll();
        speakFeedback(`已保存${PRESET_META[state.activePresetId].name}。`);
    }

    function applyCurrentSettingPresetToPractice() {
        state.pricePresets[state.settingActivePresetId] = clone(state.priceSettingDraft[state.settingActivePresetId]);
        state.activePresetId = state.settingActivePresetId;
        clearCounterAndAttempts();
        closePriceSettingViewAndBackToPractice();
        speakFeedback(`已使用${PRESET_META[state.activePresetId].name}进行练习。`);
    }

    function toggleSettingDecimalMode() {
        const preset = getSettingDraftPreset();
        const nextAllowDecimal = !preset.allowDecimal;
        preset.allowDecimal = nextAllowDecimal;
        Object.keys(preset.prices).forEach((itemKey) => {
            preset.prices[itemKey] = normalizePriceFen(Number(preset.prices[itemKey]), preset.allowDecimal);
        });
        renderPriceSetting();
        speakFeedback(nextAllowDecimal ? '当前预设已开启含小数模式。' : '当前预设已关闭含小数模式。');
    }

    function renderAll() {
        if (state.activeView !== 'practice') return;
        renderCategoryNav();
        renderItemStrip();
        renderGoodDisplay();
        renderModeButton();
        renderLabelToggleButton();
        renderCounterItems();
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

    function togglePaymentRuleMode() {
        state.paymentRuleMode = state.paymentRuleMode === 'exact' ? 'change' : 'exact';
        savePaymentRuleMode();
        renderModeButton();
        const modeText = state.paymentRuleMode === 'exact'
            ? '已切换为不支持找零，支付金额必须与商品价格完全相同。'
            : '已切换为支持找零，支付金额可以大于或等于商品价格。';
        speakFeedback(modeText);
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

        refs.modeToggleBtn.addEventListener('click', togglePaymentRuleMode);
        refs.openPriceSettingBtn.addEventListener('click', openPriceSettingView);

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

        refs.pricePresetNavItems.forEach((btn) => {
            btn.addEventListener('click', () => {
                state.settingActivePresetId = btn.dataset.preset;
                renderPriceSetting();
            });
        });

        refs.settingResetBtn.addEventListener('click', resetCurrentSettingPreset);
        refs.settingSaveBtn.addEventListener('click', saveCurrentPriceSettings);
        refs.settingApplyBtn.addEventListener('click', closePriceSettingViewAndBackToPractice);
        refs.settingDecimalToggleBtn.addEventListener('click', toggleSettingDecimalMode);
        refs.settingCancelBtn.addEventListener('click', applyCurrentSettingPresetToPractice);
    }

    function initPersistentState() {
        state.systemPresetDefaults = loadSystemPresetDefaults();
        state.pricePresets = loadUserPresets(state.systemPresetDefaults);
        state.activePresetId = loadActivePresetId();
        state.settingActivePresetId = state.activePresetId;
        state.paymentRuleMode = loadPaymentRuleMode();
    }

    function init() {
        initPersistentState();
        renderMoneyBank();
        bindEvents();
        setDefaultHint();
        renderAll();
        announceCurrentGood();
    }

    init();
});

