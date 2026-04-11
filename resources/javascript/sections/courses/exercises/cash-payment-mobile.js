// cash-payment-mobile.js  – Mobile-first Cash Payment
// Shares storage keys with desktop version (shared user presets).

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // DATA  (mirrors desktop cash-payment.js)
    // =====================================================================
    const categoryData = {
        fruits: {
            name: '水果',
            items: [
                { key: 'apple',      name: '苹果',  image: '../../../assets/images/fruits/apple.png' },
                { key: 'banana',     name: '香蕉',  image: '../../../assets/images/fruits/banana.jpeg' },
                { key: 'orange',     name: '橙子',  image: '../../../assets/images/fruits/orange.png' },
                { key: 'strawberry', name: '草莓',  image: '../../../assets/images/fruits/strawberry.png' }
            ]
        },
        snacks: {
            name: '零食',
            items: [
                { key: 'biscuit', name: '饼干',  image: '../../../assets/images/snacks/biscuit.jpg' },
                { key: 'chips',   name: '薯片',  image: '../../../assets/images/snacks/chips.jpeg' },
                { key: 'kitkat',  name: '巧克力', image: '../../../assets/images/snacks/kitkat.jpeg' },
                { key: 'yogurt',  name: '酸奶',  image: '../../../assets/images/snacks/yogurt.png' }
            ]
        },
        'study-tools': {
            name: '文具',
            items: [
                { key: 'eraser',   name: '橡皮',  image: '../../../assets/images/study-tools/eraser.jpeg' },
                { key: 'notebook', name: '笔记本', image: '../../../assets/images/study-tools/notebook.jpg' },
                { key: 'pencil',   name: '铅笔',  image: '../../../assets/images/study-tools/pencil.jpg' },
                { key: 'ruler',    name: '尺子',  image: '../../../assets/images/study-tools/ruler.png' }
            ]
        }
    };

    // Labels use Chinese numbers so TTS always reads them correctly
    const denominations = [
        { id: 'bill-100', label: '一百元',   valueFen: 10000, type: 'bill',      image: '../../../assets/images/rmbs/sides/head/yuan-100.jpg' },
        { id: 'bill-50',  label: '五十元',   valueFen: 5000,  type: 'bill',      image: '../../../assets/images/rmbs/sides/head/yuan-50.jpg'  },
        { id: 'bill-20',  label: '二十元',   valueFen: 2000,  type: 'bill',      image: '../../../assets/images/rmbs/sides/head/yuan-20.jpg'  },
        { id: 'bill-10',  label: '十元',     valueFen: 1000,  type: 'bill',      image: '../../../assets/images/rmbs/sides/head/yuan-10.jpg'  },
        { id: 'bill-5',   label: '五元',     valueFen: 500,   type: 'bill',      image: '../../../assets/images/rmbs/sides/head/yuan-5.jpg'   },
        { id: 'bill-1',   label: '一元纸币', valueFen: 100,   type: 'bill',      image: '../../../assets/images/rmbs/sides/head/yuan-1.jpg'   },
        { id: 'coin-1',   label: '一元硬币', valueFen: 100,   type: 'coin-yuan', image: '../../../assets/images/coins/tail/yuan-1.jpg'        },
        { id: 'coin-5j',  label: '五角',     valueFen: 50,    type: 'coin-jiao', image: '../../../assets/images/coins/tail/jiao-5.jpg'        },
        { id: 'coin-1j',  label: '一角',     valueFen: 10,    type: 'coin-jiao', image: '../../../assets/images/coins/tail/jiao-1.jpg'        }
    ];

    // Shared storage keys (same as desktop – presets are shared)
    const STORAGE_KEYS = {
        systemDefaults:  'cashPayment.systemPresetDefaults.v1',
        userPresets:     'cashPayment.userPresets.v1',
        activePreset:    'cashPayment.activePresetId.v1',
        paymentRuleMode: 'cashPayment.paymentRuleMode.v1'
    };

    const PRESET_IDS  = ['preset1', 'preset2', 'preset3'];
    const PRESET_META = {
        preset1: { name: '价格预设一', allowDecimal: false },
        preset2: { name: '价格预设二', allowDecimal: true  },
        preset3: { name: '价格预设三', allowDecimal: true  }
    };

    const CATEGORY_RANGES_FEN = {
        fruits:        { min: 300,  max: 3000 },
        snacks:        { min: 300,  max: 6000 },
        'study-tools': { min: 200,  max: 5000 }
    };

    // =====================================================================
    // STATE
    // =====================================================================
    const state = {
        goodIndex:             0,       // index into allGoods (flat list)
        showMoneyLabels:       false,
        counterCounts:         {},      // { denominationId: count }
        insufficientCount:     0,
        paymentRuleMode:       'change',
        activeView:            'practice',
        activePresetId:        'preset1',
        settingActivePresetId: 'preset1',
        systemPresetDefaults:  null,
        pricePresets:          null,
        priceSettingDraft:     null
    };

    // =====================================================================
    // REFS
    // =====================================================================
    const refs = {
        reader:                  document.getElementById('page-reader-text'),
        practiceView:            document.getElementById('practice-view'),
        settingPage:             document.getElementById('setting-page'),
        goodImage:               document.getElementById('good-image'),
        goodName:                document.getElementById('good-name'),
        priceTag:                document.getElementById('price-tag'),
        counterItems:            document.getElementById('money-counter'),
        counterTotal:            document.getElementById('counter-total'),
        resultMessage:           document.getElementById('result-message'),
        moneyPager:              document.getElementById('money-pager'),
        pagerDots:               document.getElementById('pager-dots'),
        prevGoodBtn:             document.getElementById('prev-good-btn'),
        nextGoodBtn:             document.getElementById('next-good-btn'),
        endBtn:                  document.getElementById('end-btn'),
        resetBtn:                document.getElementById('reset-btn'),
        checkBtn:                document.getElementById('check-btn'),
        setBtn:                  document.getElementById('set-btn'),
        settingEndBtn:           document.getElementById('setting-end-btn'),
        settingPlayBtn:          document.getElementById('setting-play-btn'),
        modeToggleBtn:           document.getElementById('mode-toggle-btn'),
        labelToggleBtn:          document.getElementById('label-toggle-btn'),
        pricePresetNavItems:     Array.from(document.querySelectorAll('#price-preset-navbar .nav-item')),
        priceSettingCanvas:      document.getElementById('price-setting-canvas'),
        settingResetBtn:         document.getElementById('setting-reset-btn'),
        settingSaveBtn:          document.getElementById('setting-save-btn'),
        settingApplyBtn:         document.getElementById('setting-apply-btn'),
        settingDecimalToggleBtn: document.getElementById('setting-decimal-toggle-btn'),
        settingCancelBtn:        document.getElementById('setting-cancel-btn'),
        settingFooterResetBtn:   document.getElementById('setting-footer-reset-btn'),
        settingFooterSaveBtn:    document.getElementById('setting-footer-save-btn'),
        settingFooterApplyBtn:   document.getElementById('setting-footer-apply-btn'),
        settingFooterCancelBtn:  document.getElementById('setting-footer-cancel-btn')
    };

    // =====================================================================
    // UTILITY
    // =====================================================================
    function clone(v) { return JSON.parse(JSON.stringify(v)); }

    function randomInRange(min, max, step) {
        const s = Math.max(step, 1);
        const n = Math.floor((max - min) / s);
        return min + Math.floor(Math.random() * (n + 1)) * s;
    }

    function getAllGoods() {
        const goods = [];
        Object.keys(categoryData).forEach(k => {
            categoryData[k].items.forEach(item => goods.push({ categoryKey: k, ...item }));
        });
        return goods;
    }

    // Computed once after categoryData is initialised
    const allGoods = getAllGoods();

    function getAllItemKeys() { return allGoods.map(g => g.key); }

    function createRandomPriceMap(allowDecimal) {
        const prices = {};
        allGoods.forEach(item => {
            const r = CATEGORY_RANGES_FEN[item.categoryKey];
            prices[item.key] = randomInRange(r.min, r.max, allowDecimal ? 10 : 100);
        });
        return prices;
    }

    function createZeroPriceMap() {
        const prices = {};
        getAllItemKeys().forEach(k => { prices[k] = 0; });
        return prices;
    }

    function createSystemDefaults() {
        return {
            preset1: { id: 'preset1', name: PRESET_META.preset1.name, allowDecimal: false, prices: createRandomPriceMap(false) },
            preset2: { id: 'preset2', name: PRESET_META.preset2.name, allowDecimal: true,  prices: createRandomPriceMap(true)  },
            preset3: { id: 'preset3', name: PRESET_META.preset3.name, allowDecimal: true,  prices: createZeroPriceMap()        }
        };
    }

    function normalizePriceFen(value, allowDecimal) {
        if (!Number.isFinite(value)) return 0;
        const clamped = Math.max(0, Math.round(value));
        const step = allowDecimal ? 10 : 100;
        return Math.round(clamped / step) * step;
    }

    function normalizePreset(raw, fallback) {
        const preset = clone(fallback);
        if (!raw || typeof raw !== 'object') return preset;
        preset.allowDecimal = Boolean(raw.allowDecimal);
        preset.name = PRESET_META[preset.id].name;
        const src = (raw.prices && typeof raw.prices === 'object') ? raw.prices : {};
        Object.keys(preset.prices).forEach(k => {
            const v = Number(src[k]);
            if (Number.isFinite(v)) preset.prices[k] = normalizePriceFen(v, preset.allowDecimal);
        });
        return preset;
    }

    function normalizePresetCollection(raw, fallback) {
        const out = clone(fallback);
        if (!raw || typeof raw !== 'object') return out;
        PRESET_IDS.forEach(id => { out[id] = normalizePreset(raw[id], fallback[id]); });
        return out;
    }

    function loadJson(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    }
    function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

    function loadSystemPresetDefaults() {
        const gen = createSystemDefaults();
        const stored = loadJson(STORAGE_KEYS.systemDefaults);
        const norm = normalizePresetCollection(stored, gen);
        if (!stored) saveJson(STORAGE_KEYS.systemDefaults, norm);
        return norm;
    }

    function loadUserPresets(sys) {
        const stored = loadJson(STORAGE_KEYS.userPresets);
        return stored ? normalizePresetCollection(stored, sys) : clone(sys);
    }

    function saveUserPresets()    { saveJson(STORAGE_KEYS.userPresets,     state.pricePresets); }
    function saveActivePresetId() { localStorage.setItem(STORAGE_KEYS.activePreset, state.activePresetId); }
    function savePaymentRuleMode(){ localStorage.setItem(STORAGE_KEYS.paymentRuleMode, state.paymentRuleMode); }

    function loadActivePresetId() {
        const s = localStorage.getItem(STORAGE_KEYS.activePreset);
        return PRESET_IDS.includes(s) ? s : 'preset1';
    }

    function loadPaymentRuleMode() {
        const s = localStorage.getItem(STORAGE_KEYS.paymentRuleMode);
        return (s === 'exact' || s === 'change') ? s : 'change';
    }

    function formatFenToYuan(fen, allowDecimal) {
        return (allowDecimal || fen % 100 !== 0)
            ? `${(fen / 100).toFixed(1)}元`
            : `${Math.round(fen / 100)}元`;
    }

    function formatFenForInput(fen, allowDecimal) {
        return allowDecimal ? (fen / 100).toFixed(1) : String(Math.round(fen / 100));
    }

    function parseInputToFen(raw, allowDecimal) {
        const n = Number(String(raw || '').trim());
        if (!Number.isFinite(n) || n < 0) return null;
        return normalizePriceFen(Math.round(n * 100), allowDecimal);
    }

    // =====================================================================
    // CORE GETTERS
    // =====================================================================
    function getCurrentGood()    { return allGoods[state.goodIndex]; }
    function getCurrentPreset()  { return state.pricePresets[state.activePresetId]; }

    function getCurrentPriceFen() {
        const preset = getCurrentPreset();
        const good   = getCurrentGood();
        if (!preset || !preset.prices) return 0;
        return normalizePriceFen(Number(preset.prices[good.key]), preset.allowDecimal);
    }

    function getUserMoneyFen() {
        return denominations.reduce((sum, den) => {
            return sum + den.valueFen * (state.counterCounts[den.id] || 0);
        }, 0);
    }

    // =====================================================================
    // FEEDBACK / ACCESSIBILITY
    // =====================================================================
    function setReaderText(text) {
        if (refs.reader) refs.reader.textContent = text || '';
    }

    function speakFeedback(text) {
        setReaderText(text);
        if (window.voiceCore) window.voiceCore.speakText(text);
    }

    function setResultMessage(msg, level) {
        refs.resultMessage.textContent = msg;
        refs.resultMessage.classList.remove('success', 'error');
        if (level === 'success') refs.resultMessage.classList.add('success');
        if (level === 'error')   refs.resultMessage.classList.add('error');
    }

    function setDefaultHint() {
        setResultMessage('点击下方人民币进行支付', null);
    }

    // =====================================================================
    // COUNTER OPERATIONS
    // =====================================================================
    function clearCounter() {
        state.counterCounts    = {};
        state.insufficientCount = 0;
        setDefaultHint();
        renderMoneyCounter();
        renderMoneyBankCounts();
    }

    function addDenomination(denominationId) {
        state.counterCounts[denominationId] = (state.counterCounts[denominationId] || 0) + 1;
        renderMoneyCounter();
        renderMoneyBankCounts();
        if (refs.resultMessage.textContent === '点击下方人民币进行支付') {
            setResultMessage('已放入现金，点击"核对"检查金额。', null);
        }
    }

    function removeDenomination(denominationId) {
        const count = state.counterCounts[denominationId] || 0;
        if (count <= 0) return;
        state.counterCounts[denominationId] = count - 1;
        renderMoneyCounter();
        renderMoneyBankCounts();
        if (getUserMoneyFen() === 0) setDefaultHint();
    }

    // =====================================================================
    // RENDER – GOOD DISPLAY
    // =====================================================================
    function renderGoodDisplay() {
        const good    = getCurrentGood();
        const preset  = getCurrentPreset();
        const priceFen = getCurrentPriceFen();
        refs.goodImage.src = good.image;
        refs.goodImage.alt = `${good.name}，价格${formatFenToYuan(priceFen, preset.allowDecimal)}`;
        refs.priceTag.textContent = formatFenToYuan(priceFen, preset.allowDecimal);
        refs.goodName.textContent = good.name;
    }

    // =====================================================================
    // RENDER – MONEY COUNTER (display only)
    // =====================================================================
    function renderMoneyCounter() {
        const totalFen  = getUserMoneyFen();
        refs.counterTotal.textContent = `¥${(totalFen / 100).toFixed(2)}`;

        const activeItems = denominations.filter(d => (state.counterCounts[d.id] || 0) > 0);
        refs.counterItems.innerHTML = activeItems.map(den => {
            const count  = state.counterCounts[den.id];
            const isBill = den.type === 'bill';
            return `<div class="m-counter-chip">
                        <img src="${den.image}" alt="${den.label}"
                             style="${isBill ? 'width:54px;height:26px' : 'width:26px;height:26px'}">
                        <span class="m-chip-count">&times;${count}</span>
                    </div>`;
        }).join('');
    }

    // =====================================================================
    // RENDER – MONEY BANK (horizontal snap pager)
    // =====================================================================
    function buildPagerPages() {
        const pages = [];
        for (let i = 0; i < denominations.length; i += 3) pages.push(denominations.slice(i, i + 3));
        return pages;
    }

    /** Full re-render – restores scroll position silently */
    function renderMoneyBank() {
        const pager  = refs.moneyPager;
        const dots   = refs.pagerDots;
        const pages  = buildPagerPages();

        // Save current page before clearing DOM
        const pw          = pager.offsetWidth || 1;
        const savedPage   = Math.round(pager.scrollLeft / pw);

        pager.innerHTML = pages.map(page => `
            <div class="money-page">
                ${page.map(den => {
                    const count  = state.counterCounts[den.id] || 0;
                    const isBill = den.type === 'bill';
                    return `
                        <div class="m-money-card">
                            <div class="m-money-card-img">
                                <img src="${den.image}" alt="${den.label}"
                                     class="${isBill ? 'bill-img' : 'coin-img'}">
                                <div class="m-money-label${state.showMoneyLabels ? '' : ' label-hidden'}">${den.label}</div>
                            </div>
                            <div class="m-money-controls">
                                <button class="m-minus-btn" data-id="${den.id}"${count === 0 ? ' disabled' : ''}>&#8722;</button>
                                <span class="m-count-display">${count}</span>
                                <button class="m-plus-btn" data-id="${den.id}">&#65291;</button>
                            </div>
                        </div>`;
                }).join('')}
            </div>`
        ).join('');

        // Bind events
        pager.querySelectorAll('.m-plus-btn').forEach(btn => {
            btn.addEventListener('click', () => addDenomination(btn.dataset.id));
        });
        pager.querySelectorAll('.m-minus-btn').forEach(btn => {
            btn.addEventListener('click', () => removeDenomination(btn.dataset.id));
        });

        // Restore scroll (no animation)
        if (savedPage > 0) {
            requestAnimationFrame(() => {
                pager.style.scrollBehavior = 'auto';
                pager.scrollLeft = savedPage * pager.offsetWidth;
                pager.style.scrollBehavior = '';
            });
        }

        // Render dots
        dots.innerHTML = pages.map((_, i) =>
            `<span class="m-dot${i === savedPage ? ' active' : ''}"></span>`
        ).join('');
    }

    /** Lightweight update – only refreshes counts/disabled state without scroll jump */
    function renderMoneyBankCounts() {
        const pager = refs.moneyPager;
        if (!pager.querySelector('.m-money-card')) { renderMoneyBank(); return; }

        pager.querySelectorAll('.m-money-card').forEach(card => {
            const plusBtn      = card.querySelector('.m-plus-btn');
            const minusBtn     = card.querySelector('.m-minus-btn');
            const countDisplay = card.querySelector('.m-count-display');
            if (!plusBtn) return;
            const count = state.counterCounts[plusBtn.dataset.id] || 0;
            countDisplay.textContent = count;
            minusBtn.disabled = (count === 0);
        });
    }

    // =====================================================================
    // RENDER – MODE / LABEL BUTTONS
    // =====================================================================
    function renderModeButton() {
        refs.modeToggleBtn.textContent = `支持找零：${state.paymentRuleMode === 'exact' ? '否' : '是'}`;
    }

    function renderLabelToggleButton() {
        refs.labelToggleBtn.textContent = state.showMoneyLabels ? '名称提示：开' : '名称提示：关';
    }

    function renderAll() {
        if (state.activeView !== 'practice') return;
        renderGoodDisplay();
        renderModeButton();
        renderLabelToggleButton();
        renderMoneyCounter();
        renderMoneyBank();
    }

    function announceCurrentGood() {
        const good      = getCurrentGood();
        const preset    = getCurrentPreset();
        const priceText = formatFenToYuan(getCurrentPriceFen(), preset.allowDecimal);
        const text = `当前物品是${good.name}，价格是${priceText}，请点击下方的人民币以支付。`;
        setReaderText(text);
    }

    // =====================================================================
    // GOOD NAVIGATION
    // =====================================================================
    function switchGood(offset) {
        state.goodIndex = (state.goodIndex + offset + allGoods.length) % allGoods.length;
        clearCounter();
        renderAll();
        announceCurrentGood();
    }

    // =====================================================================
    // PAYMENT CHECK
    // =====================================================================
    function checkPayment() {
        const target     = getCurrentPriceFen();
        const preset     = getCurrentPreset();
        const targetText = formatFenToYuan(target, preset.allowDecimal);
        const userMoney  = getUserMoneyFen();

        if (state.paymentRuleMode === 'exact') {
            if (userMoney === target) {
                const text = '恭喜完成支付！金额完全正确。';
                setResultMessage(text, 'success');
                speakFeedback(text);
                state.insufficientCount = 0;
                return;
            }
            if (userMoney > target) {
                const extraText = formatFenToYuan(userMoney - target, preset.allowDecimal);
                const text = `当前模式不支持找零。当前价格是${targetText}，你多付了${extraText}。请调整为刚好相同金额。`;
                setResultMessage(text, 'error');
                speakFeedback(text);
                return;
            }
        }

        if (userMoney >= target) {
            state.insufficientCount = 0;
            const change = userMoney - target;
            if (change === 0) {
                const text = '恭喜完成支付！';
                setResultMessage(text, 'success');
                speakFeedback(text);
            } else {
                const changeText = formatFenToYuan(change, preset.allowDecimal);
                setResultMessage(`恭喜完成支付！\n有${changeText}的找零。`, 'success');
                speakFeedback(`恭喜完成支付！有${changeText}的找零。`);
            }
            return;
        }

        const remain     = target - userMoney;
        const remainText = formatFenToYuan(remain, preset.allowDecimal);
        if (state.insufficientCount === 0) {
            const text = '支付的现金不足！';
            setResultMessage(text, 'error');
            speakFeedback(text);
        } else {
            setResultMessage(`支付的现金不足！\n还需要${remainText}待支付。`, 'error');
            speakFeedback(`支付的现金不足！还需要${remainText}待支付。`);
        }
        state.insufficientCount += 1;
    }

    // =====================================================================
    // TOGGLE PAYMENT RULE
    // =====================================================================
    function togglePaymentRuleMode() {
        state.paymentRuleMode = state.paymentRuleMode === 'exact' ? 'change' : 'exact';
        savePaymentRuleMode();
        renderModeButton();
        speakFeedback(state.paymentRuleMode === 'exact'
            ? '已切换为不支持找零，支付金额必须与商品价格完全相同。'
            : '已切换为支持找零，支付金额可以大于或等于商品价格。');
    }

    // =====================================================================
    // SETTING PAGE – OPEN / CLOSE
    // =====================================================================
    function openSettingPage() {
        state.activeView            = 'setting';
        state.settingActivePresetId = state.activePresetId;
        state.priceSettingDraft     = clone(state.pricePresets);
        refs.practiceView.classList.add('hidden');
        refs.settingPage.classList.remove('hidden');
        renderPriceSetting();
        setReaderText('已进入商品价格设置页面。');
    }

    function closeSettingPageToPractice() {
        state.activeView        = 'practice';
        state.priceSettingDraft = null;
        refs.settingPage.classList.add('hidden');
        refs.practiceView.classList.remove('hidden');
        clearCounter();
        renderAll();
        announceCurrentGood();
    }

    // =====================================================================
    // SETTING PAGE – RENDER
    // =====================================================================
    function getSettingDraftPreset() { return state.priceSettingDraft[state.settingActivePresetId]; }

    function renderPricePresetNavbar() {
        refs.pricePresetNavItems.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === state.settingActivePresetId);
        });
    }

    function renderPriceSettingDecimalButton() {
        const preset = getSettingDraftPreset();
        refs.settingDecimalToggleBtn.textContent = `含小数：${preset.allowDecimal ? '开' : '关'}`;
    }

    function renderPriceSettingCanvas() {
        const preset = getSettingDraftPreset();
        refs.priceSettingCanvas.innerHTML = allGoods.map(item => {
            const priceFen = normalizePriceFen(Number(preset.prices[item.key]), preset.allowDecimal);
            return `
                <div class="m-price-list-item">
                    <img class="m-price-list-img" src="${item.image}" alt="${item.name}">
                    <span class="m-price-list-name">${item.name}</span>
                    <span class="m-price-list-spacer"></span>
                    <input class="m-price-list-input"
                           type="number" min="0"
                           step="${preset.allowDecimal ? '0.1' : '1'}"
                           inputmode="decimal"
                           data-item-key="${item.key}"
                           value="${formatFenForInput(priceFen, preset.allowDecimal)}">
                    <span class="m-price-list-unit">元</span>
                </div>`;
        }).join('');

        refs.priceSettingCanvas.querySelectorAll('input[data-item-key]').forEach(input => {
            input.addEventListener('change', () => {
                const draft = getSettingDraftPreset();
                const fen   = parseInputToFen(input.value, draft.allowDecimal);
                if (fen === null) {
                    input.value = formatFenForInput(draft.prices[input.dataset.itemKey] || 0, draft.allowDecimal);
                    return;
                }
                draft.prices[input.dataset.itemKey] = fen;
                input.value = formatFenForInput(fen, draft.allowDecimal);
            });
        });
    }

    function renderPriceSetting() {
        renderPricePresetNavbar();
        renderPriceSettingDecimalButton();
        renderPriceSettingCanvas();
        renderModeButton();
        renderLabelToggleButton();
    }

    // =====================================================================
    // SETTING PAGE – ACTIONS
    // =====================================================================
    function resetCurrentSettingPreset() {
        const id = state.settingActivePresetId;
        state.priceSettingDraft[id] = clone(state.systemPresetDefaults[id]);
        renderPriceSetting();
        speakFeedback(`已重置${PRESET_META[id].name}为系统默认价格。`);
    }

    function saveCurrentPriceSettings() {
        state.pricePresets  = clone(state.priceSettingDraft);
        state.activePresetId = state.settingActivePresetId;
        saveUserPresets();
        saveActivePresetId();
        renderPriceSetting();
        speakFeedback(`已保存${PRESET_META[state.activePresetId].name}。`);
    }

    function applyCurrentSettingPresetToPractice() {
        state.pricePresets[state.settingActivePresetId] =
            clone(state.priceSettingDraft[state.settingActivePresetId]);
        state.activePresetId = state.settingActivePresetId;
        closeSettingPageToPractice();
        speakFeedback(`已使用${PRESET_META[state.activePresetId].name}进行练习。`);
    }

    function toggleSettingDecimalMode() {
        const preset          = getSettingDraftPreset();
        preset.allowDecimal   = !preset.allowDecimal;
        Object.keys(preset.prices).forEach(k => {
            preset.prices[k] = normalizePriceFen(Number(preset.prices[k]), preset.allowDecimal);
        });
        renderPriceSetting();
        speakFeedback(preset.allowDecimal ? '当前预设已开启含小数模式。' : '当前预设已关闭含小数模式。');
    }

    // =====================================================================
    // PAGER DOTS – scroll listener
    // =====================================================================
    function setupPagerScrollListener() {
        refs.moneyPager.addEventListener('scroll', () => {
            const pw = refs.moneyPager.offsetWidth;
            if (pw <= 0) return;
            const activePage = Math.round(refs.moneyPager.scrollLeft / pw);
            refs.pagerDots.querySelectorAll('.m-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === activePage);
            });
        }, { passive: true });
    }

    // =====================================================================
    // EVENT BINDING
    // =====================================================================
    function bindEvents() {
        // Practice page
        refs.endBtn.addEventListener('click', () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            window.location.href = 'exercises-catalog.html';
        });
        refs.setBtn.addEventListener('click', openSettingPage);
        refs.prevGoodBtn.addEventListener('click', () => switchGood(-1));
        refs.nextGoodBtn.addEventListener('click', () => switchGood(1));
        refs.resetBtn.addEventListener('click', () => {
            clearCounter();
            speakFeedback('已重置，已清空放置的人民币。');
        });
        refs.checkBtn.addEventListener('click', checkPayment);

        // Setting page navigation
        refs.settingEndBtn.addEventListener('click', closeSettingPageToPractice);
        refs.settingPlayBtn.addEventListener('click', () => {
            const text = (refs.reader.textContent || '').trim();
            if (text && window.voiceCore) window.voiceCore.speakText(text);
        });

        // Setting page controls (row 2 toggles)
        refs.modeToggleBtn.addEventListener('click', togglePaymentRuleMode);
        refs.labelToggleBtn.addEventListener('click', () => {
            state.showMoneyLabels = !state.showMoneyLabels;
            renderLabelToggleButton();
            renderMoneyBank();   // full re-render to update label visibility
            speakFeedback(state.showMoneyLabels ? '已显示货币名称提示。' : '已隐藏货币名称提示。');
        });

        // Setting page controls (preset tabs)
        refs.pricePresetNavItems.forEach(btn => {
            btn.addEventListener('click', () => {
                state.settingActivePresetId = btn.dataset.preset;
                renderPriceSetting();
            });
        });

        // Setting page actions (row 3 + footer mirrors)
        refs.settingResetBtn.addEventListener('click',   resetCurrentSettingPreset);
        refs.settingSaveBtn.addEventListener('click',    saveCurrentPriceSettings);
        refs.settingApplyBtn.addEventListener('click',   closeSettingPageToPractice);
        refs.settingDecimalToggleBtn.addEventListener('click', toggleSettingDecimalMode);
        refs.settingCancelBtn.addEventListener('click',  applyCurrentSettingPresetToPractice);

        refs.settingFooterResetBtn.addEventListener('click',  resetCurrentSettingPreset);
        refs.settingFooterSaveBtn.addEventListener('click',   saveCurrentPriceSettings);
        refs.settingFooterApplyBtn.addEventListener('click',  closeSettingPageToPractice);
        refs.settingFooterCancelBtn.addEventListener('click', applyCurrentSettingPresetToPractice);

        setupPagerScrollListener();
    }

    // =====================================================================
    // INITIALISATION
    // =====================================================================
    function initPersistentState() {
        state.systemPresetDefaults  = loadSystemPresetDefaults();
        state.pricePresets          = loadUserPresets(state.systemPresetDefaults);
        state.activePresetId        = loadActivePresetId();
        state.settingActivePresetId = state.activePresetId;
        state.paymentRuleMode       = loadPaymentRuleMode();
    }

    function init() {
        initPersistentState();
        bindEvents();
        setDefaultHint();
        renderAll();
        announceCurrentGood();
    }

    init();
});

