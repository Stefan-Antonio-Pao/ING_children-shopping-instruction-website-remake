document.addEventListener('DOMContentLoaded', () => {
    const LEVELS = {
        easy: { name: '购物模拟（一）', requiresLimit: false, allowDecimal: false, exactOnly: false },
        medium: { name: '购物模拟（二）', requiresLimit: false, allowDecimal: false, exactOnly: true },
        hard: { name: '购物挑战（一）', requiresLimit: true, allowDecimal: false, exactOnly: true },
        expert: { name: '购物挑战（二）', requiresLimit: true, allowDecimal: true, exactOnly: true }
    };

    const RULES = {
        easy: { needsReturnStepOnOverpay: false, requiresLimitCheck: false },
        medium: { needsReturnStepOnOverpay: true, requiresLimitCheck: false },
        hard: { needsReturnStepOnOverpay: true, requiresLimitCheck: true },
        expert: { needsReturnStepOnOverpay: true, requiresLimitCheck: true }
    };

    const DIRECTOR_MAP = {
        bear: { name: '小熊', video: 'bear' },
        cat: { name: '小猫', video: 'cat' },
        dog: { name: '小狗', video: 'dog' },
        rabbit: { name: '小兔', video: 'rabbit' }
    };

    const GOODS_SOURCE = {
        fruits: {
            label: '水果',
            items: [
                { id: 'apple', name: '苹果', image: '../../../assets/images/fruits/apple.png' },
                { id: 'banana', name: '香蕉', image: '../../../assets/images/fruits/banana.jpeg' },
                { id: 'orange', name: '橙子', image: '../../../assets/images/fruits/orange.png' },
                { id: 'strawberry', name: '草莓', image: '../../../assets/images/fruits/strawberry.png' }
            ]
        },
        snacks: {
            label: '零食',
            items: [
                { id: 'biscuit', name: '饼干', image: '../../../assets/images/snacks/biscuit.jpg' },
                { id: 'chips', name: '薯片', image: '../../../assets/images/snacks/chips.jpeg' },
                { id: 'kitkat', name: '巧克力', image: '../../../assets/images/snacks/kitkat.jpeg' },
                { id: 'yogurt', name: '酸奶', image: '../../../assets/images/snacks/yogurt.png' }
            ]
        },
        'study-tools': {
            label: '文具',
            items: [
                { id: 'eraser', name: '橡皮', image: '../../../assets/images/study-tools/eraser.jpeg' },
                { id: 'notebook', name: '笔记本', image: '../../../assets/images/study-tools/notebook.jpg' },
                { id: 'pencil', name: '铅笔', image: '../../../assets/images/study-tools/pencil.jpg' },
                { id: 'ruler', name: '尺子', image: '../../../assets/images/study-tools/ruler.png' }
            ]
        }
    };

    const DENOMINATIONS = [
        { id: 'bill-100', label: '100元', valueFen: 10000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-100.jpg' },
        { id: 'bill-50', label: '50元', valueFen: 5000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-50.jpg' },
        { id: 'bill-20', label: '20元', valueFen: 2000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-20.jpg' },
        { id: 'bill-10', label: '10元', valueFen: 1000, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-10.jpg' },
        { id: 'bill-5', label: '5元', valueFen: 500, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-5.jpg' },
        { id: 'bill-1', label: '1元', valueFen: 100, type: 'bill', image: '../../../assets/images/rmbs/sides/head/yuan-1.jpg' },
        { id: 'coin-1', label: '1元硬币', valueFen: 100, type: 'coin-yuan', image: '../../../assets/images/coins/tail/yuan-1.jpg' },
        { id: 'coin-5j', label: '5角', valueFen: 50, type: 'coin-jiao', image: '../../../assets/images/coins/tail/jiao-5.jpg' },
        { id: 'coin-1j', label: '1角', valueFen: 10, type: 'coin-jiao', image: '../../../assets/images/coins/tail/jiao-1.jpg' }
    ];

    const dragMime = 'application/x-shopping-cash';

    const refs = {
        reader: document.getElementById('page-reader-text'),
        navbarItems: Array.from(document.querySelectorAll('#app-navbar .nav-item')),
        navLimit: document.getElementById('nav-limit'),
        itemStrip: document.getElementById('item-strip'),
        mainTitle: document.getElementById('main-title'),
        limitProcess: document.getElementById('limit-process'),
        limitFill: document.getElementById('limit-fill'),
        limitProcessText: document.getElementById('limit-process-text'),
        limitConfigBox: document.getElementById('limit-config-box'),
        confirmLimitBtn: document.getElementById('confirm-limit-btn'),
        bearVideo: document.getElementById('bear-video'),
        roleVideo: document.getElementById('role-video'),
        successVideo: document.getElementById('success-video'),
        rolePageText: document.getElementById('role-page-text'),
        successText: document.getElementById('success-text'),
        toPage2Btn: document.getElementById('to-page2-btn'),
        toPage3Btn: document.getElementById('to-page3-btn'),
        goodsGrid: document.getElementById('goods-grid'),
        cartList: document.getElementById('cart-list'),
        totalPriceText: document.getElementById('total-price-text'),
        balanceText: document.getElementById('balance-text'),
        checkoutBtn: document.getElementById('checkout-btn'),

        payCounter: document.getElementById('pay-counter'),
        payBankBills: document.getElementById('pay-bank-bills'),
        payBankCoins: document.getElementById('pay-bank-coins'),
        payBankCoinsSection: document.getElementById('pay-bank-coins-section'),
        payInstruction: document.getElementById('pay-instruction'),
        payAmountText: document.getElementById('pay-amount-text'),
        payCheckBtn: document.getElementById('pay-check-btn'),
        payMessage: document.getElementById('pay-message'),
        payNextBtn: document.getElementById('pay-next-btn'),

        returnCounter: document.getElementById('return-counter'),
        returnBankBills: document.getElementById('return-bank-bills'),
        returnBankCoins: document.getElementById('return-bank-coins'),
        returnBankCoinsSection: document.getElementById('return-bank-coins-section'),
        returnInstruction: document.getElementById('return-instruction'),
        returnAmountText: document.getElementById('return-amount-text'),
        returnAmountMask: document.getElementById('return-amount-mask'),
        toggleReturnMaskBtn: document.getElementById('toggle-return-mask-btn'),
        returnCheckBtn: document.getElementById('return-check-btn'),
        returnMessage: document.getElementById('return-message'),
        returnNextBtn: document.getElementById('return-next-btn'),

        restartBtn: document.getElementById('restart-btn'),
        resetCounterBtn: document.getElementById('reset-counter-btn'),
        warning: document.getElementById('limit-warning'),
        warningText: document.getElementById('limit-warning-text'),
        closeWarningBtn: document.getElementById('close-limit-warning-btn'),
        page0: document.getElementById('page0-limit'),
        page1: document.getElementById('page1-intro'),
        page2: document.getElementById('page2-role'),
        page3: document.getElementById('page3-shop'),
        page4: document.getElementById('page4-pay'),
        page5: document.getElementById('page5-return'),
        page6: document.getElementById('page6-success')
    };

    const search = new URLSearchParams(window.location.search);
    const levelKey = search.get('level') || 'easy';
    const level = LEVELS[levelKey] || LEVELS.easy;
    const directorKey = localStorage.getItem('selectedDirector') || 'dog';
    const director = DIRECTOR_MAP[directorKey] || DIRECTOR_MAP.dog;

    const state = {
        page: level.requiresLimit ? 'page0' : 'page1',
        activeCategory: 'fruits',
        limitMode: 'manual',
        totalLimitFen: null,
        goodsByCategory: {},
        cart: {},
        totalPriceFen: 0,

        payCounterItems: [],
        returnCounterItems: [],
        payFailCount: 0,
        returnFailCount: 0,
        paidFen: 0,
        needReturnFen: 0,
        showReturnMask: true,

        dragCtx: {
            mode: null,
            counterId: null,
            droppedInside: false
        }
    };

    function setReaderText(text) {
        if (refs.reader) refs.reader.textContent = text || '';
    }

    function speak(text) {
        setReaderText(text);
        if (window.voiceCore) window.voiceCore.speakText(text);
    }

    function getDisplayDecimals() {
        return level.allowDecimal ? 1 : 0;
    }

    function fmtFen(fen) {
        const num = fen / 100;
        return `¥${num.toFixed(getDisplayDecimals())}`;
    }

    function parseInputToFen(value) {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        if (!Number.isFinite(num) || num < 1) return null;
        if (!level.allowDecimal) return Math.round(num) * 100;
        return Math.round(num * 10) * 10;
    }

    function randomLimitFen() {
        const raw = Math.random() * 85 + 15;
        if (!level.allowDecimal) return Math.round(raw) * 100;
        return Math.round(raw * 10) * 10;
    }

    function getCurrentRule() {
        return RULES[levelKey] || RULES.easy;
    }

    function isAdvancedLevel() {
        return levelKey === 'hard' || levelKey === 'expert';
    }

    function normalizePriceFenForLevel(fen) {
        if (levelKey === 'hard') {
            return Math.max(100, Math.round(fen / 100) * 100);
        }
        if (levelKey === 'expert') {
            return Math.max(10, Math.round(fen / 10) * 10);
        }
        return Math.max(100, Math.round(fen / 100) * 100);
    }

    function makePriceFen() {
        if (levelKey === 'easy' || levelKey === 'medium') {
            const options = [100, 500, 1000, 2000, 5000];
            return options[Math.floor(Math.random() * options.length)];
        }

        if (levelKey === 'hard') {
            const maxByLimit = Number.isFinite(state.totalLimitFen)
                ? Math.max(1, Math.floor((state.totalLimitFen / 3) / 100))
                : 50;
            const maxYuan = Math.max(1, Math.min(50, maxByLimit));
            return (Math.floor(Math.random() * maxYuan) + 1) * 100;
        }

        const maxTenths = Number.isFinite(state.totalLimitFen)
            ? Math.max(10, Math.floor((state.totalLimitFen / 3) / 10))
            : 500;
        const valueTenths = Math.floor(Math.random() * maxTenths) + 10;
        return valueTenths * 10;
    }

    function ensureAtLeastThreeAffordableItems() {
        if (!isAdvancedLevel() || !Number.isFinite(state.totalLimitFen)) return;

        const threshold = Math.floor(state.totalLimitFen / 3);
        if (threshold <= 0) return;
        const minUnit = levelKey === 'hard' ? 100 : 10;
        if (threshold < minUnit) return;

        const allItems = Object.values(state.goodsByCategory).flatMap((cat) => cat.items);
        const affordable = allItems.filter((item) => item.priceFen <= threshold);
        if (affordable.length >= 3) return;

        const targetCount = Math.min(3, allItems.length);
        for (let i = 0; i < targetCount; i += 1) {
            const candidate = allItems[i];
            if (!candidate) continue;
            const raw = minUnit + Math.floor(Math.random() * Math.max(1, threshold - minUnit + 1));
            candidate.priceFen = normalizePriceFenForLevel(raw);
            if (candidate.priceFen > threshold) {
                candidate.priceFen = normalizePriceFenForLevel(threshold);
            }
        }
    }

    function regenerateGoodsForCurrentLimit() {
        if (!isAdvancedLevel()) return;
        seedGoods();
        ensureAtLeastThreeAffordableItems();
        // Price set has changed; clear shopping cart to avoid stale per-item prices.
        state.cart = {};
        recalcTotals();
        renderShop();
    }

    function seedGoods() {
        const seeded = {};
        Object.entries(GOODS_SOURCE).forEach(([key, category]) => {
            seeded[key] = {
                label: category.label,
                items: category.items.map((item) => ({
                    ...item,
                    priceFen: makePriceFen()
                }))
            };
        });
        state.goodsByCategory = seeded;
        ensureAtLeastThreeAffordableItems();
    }

    function recalcTotals() {
        let sum = 0;
        Object.values(state.cart).forEach((entry) => {
            sum += entry.priceFen * entry.qty;
        });
        state.totalPriceFen = sum;
    }

    function showWarning(text) {
        refs.warningText.textContent = text;
        refs.warning.style.display = 'flex';
        speak(text.replace(/\n/g, '，'));
    }

    function closeWarning() {
        refs.warning.style.display = 'none';
    }

    function tryAdd(item) {
        const nextTotal = state.totalPriceFen + item.priceFen;
        if (level.requiresLimit && Number.isFinite(state.totalLimitFen) && nextTotal > state.totalLimitFen) {
            const remain = state.totalLimitFen - state.totalPriceFen;
            showWarning(`钱不够了！\n余额：${fmtFen(state.totalLimitFen)}\n已花：${fmtFen(state.totalPriceFen)}\n还剩：${fmtFen(Math.max(0, remain))}\n这件商品超出预算了\n请选少一点`);
            return;
        }

        if (!state.cart[item.id]) state.cart[item.id] = { ...item, qty: 0 };
        state.cart[item.id].qty += 1;
        recalcTotals();
        renderShop();
    }

    function removeOne(itemId) {
        if (!state.cart[itemId]) return;
        state.cart[itemId].qty -= 1;
        if (state.cart[itemId].qty <= 0) delete state.cart[itemId];
        recalcTotals();
        renderShop();
    }

    function renderStrip() {
        refs.itemStrip.innerHTML = '';

        if (state.page === 'page0' && level.requiresLimit) {
            const modes = [
                { key: 'manual', text: '手动输入' },
                { key: 'random', text: '随机生成' },
                { key: 'none', text: '不限制消费' }
            ];
            modes.forEach((mode) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `strip-btn ${state.limitMode === mode.key ? 'active' : ''}`;
                btn.textContent = mode.text;
                btn.addEventListener('click', () => {
                    state.limitMode = mode.key;
                    renderLimitConfig();
                    renderStrip();
                });
                refs.itemStrip.appendChild(btn);
            });
            return;
        }

        if (state.page === 'page3') {
            Object.entries(state.goodsByCategory).forEach(([key, cat]) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `strip-btn ${state.activeCategory === key ? 'active' : ''}`;
                btn.textContent = cat.label;
                btn.addEventListener('click', () => {
                    state.activeCategory = key;
                    renderShop();
                    renderStrip();
                });
                refs.itemStrip.appendChild(btn);
            });
        }
    }

    function renderLimitConfig() {
        if (!level.requiresLimit) return;

        if (state.limitMode === 'manual') {
            refs.limitConfigBox.innerHTML = `
                <div class="limit-config-content">
                    <h3>当前模式：手动输入</h3>
                    <p>请输入至少1元的预算金额。</p>
                    <div class="limit-config-input-row">
                        <input id="manual-limit-input" type="number" min="1" step="${level.allowDecimal ? '0.1' : '1'}" placeholder="例如 ${level.allowDecimal ? '30.5' : '30'}">
                    </div>
                    <p id="manual-limit-note" class="limit-config-note"></p>
                </div>
                <div class="limit-config-actions">
                    <button type="button" class="nav-btn" id="manual-limit-btn">确定</button>
                </div>
            `;
            const input = document.getElementById('manual-limit-input');
            const btn = document.getElementById('manual-limit-btn');
            const note = document.getElementById('manual-limit-note');
            btn.addEventListener('click', () => {
                const fen = parseInputToFen(input.value);
                if (!fen) {
                    note.textContent = '请输入有效金额（至少1元）。';
                    return;
                }
                state.totalLimitFen = fen;
                note.textContent = `已设置预算：${fmtFen(fen)}`;
                regenerateGoodsForCurrentLimit();
                renderLimitProcess();
            });
            return;
        }

        if (state.limitMode === 'random') {
            if (!Number.isFinite(state.totalLimitFen)) state.totalLimitFen = randomLimitFen();
            refs.limitConfigBox.innerHTML = `
                <div class="limit-config-content">
                    <h3>当前模式：随机生成</h3>
                    <p>本次随机预算：<strong id="random-limit-text">${fmtFen(state.totalLimitFen)}</strong></p>
                </div>
                <div class="limit-config-actions">
                    <button type="button" class="nav-btn" id="reroll-limit-btn">重新随机</button>
                </div>
            `;
            document.getElementById('reroll-limit-btn').addEventListener('click', () => {
                state.totalLimitFen = randomLimitFen();
                regenerateGoodsForCurrentLimit();
                renderLimitConfig();
                renderLimitProcess();
            });
            return;
        }

        state.totalLimitFen = null;
        refs.limitConfigBox.innerHTML = `
            <h3>当前模式：不限制消费</h3>
            <p>本次练习不设置消费上限。</p>
        `;
        regenerateGoodsForCurrentLimit();
        renderLimitProcess();
    }

    function renderLimitProcess() {
        const show = Number.isFinite(state.totalLimitFen) && (state.page === 'page3' || state.page === 'page4');
        refs.limitProcess.style.display = show ? 'block' : 'none';
        if (!show) return;

        const pct = Math.min(100, state.totalPriceFen / state.totalLimitFen * 100);
        refs.limitProcessText.textContent = `${fmtFen(state.totalPriceFen)}/${fmtFen(state.totalLimitFen)}`;
        refs.limitFill.style.width = `${pct}%`;
        refs.limitFill.style.background = pct > 95 ? '#d9534f' : '#5fb770';
    }

    function renderShop() {
        const category = state.goodsByCategory[state.activeCategory];
        refs.goodsGrid.innerHTML = category.items.map((item) => {
            const qty = state.cart[item.id]?.qty || 0;
            return `
                <div class="good-card">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="good-name">${item.name}</div>
                    <div class="good-price">${fmtFen(item.priceFen)}</div>
                    <div class="good-ops">
                        <button type="button" data-dec="${item.id}">-</button>
                        <span>${qty}</span>
                        <button type="button" data-add="${item.id}">+</button>
                    </div>
                </div>
            `;
        }).join('');

        refs.goodsGrid.querySelectorAll('[data-add]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const item = category.items.find(v => v.id === btn.dataset.add);
                if (item) tryAdd(item);
            });
        });
        refs.goodsGrid.querySelectorAll('[data-dec]').forEach((btn) => {
            btn.addEventListener('click', () => removeOne(btn.dataset.dec));
        });

        const entries = Object.values(state.cart);
        if (!entries.length) {
            refs.cartList.innerHTML = '<p style="color:#8092a8;">还没有选商品，快去左侧选一选吧</p>';
        } else {
            refs.cartList.innerHTML = entries.map((entry) => `
                <div class="cart-item">
                    <img src="${entry.image}" alt="${entry.name}">
                    <span>${entry.name} × ${entry.qty}</span>
                    <strong>${fmtFen(entry.qty * entry.priceFen)}</strong>
                    <button type="button" class="strip-btn" data-cart-dec="${entry.id}">-</button>
                </div>
            `).join('');
            refs.cartList.querySelectorAll('[data-cart-dec]').forEach((btn) => {
                btn.addEventListener('click', () => removeOne(btn.dataset.cartDec));
            });
        }

        refs.totalPriceText.textContent = fmtFen(state.totalPriceFen);
        if (Number.isFinite(state.totalLimitFen)) {
            refs.balanceText.textContent = fmtFen(state.totalLimitFen - state.totalPriceFen);
        } else {
            refs.balanceText.textContent = '不限额';
        }
        renderLimitProcess();
    }

    function getActiveDenominations() {
        return DENOMINATIONS.filter((den) => den.type === 'bill' || level.allowDecimal);
    }

    function getCounterStore(mode) {
        return mode === 'pay' ? state.payCounterItems : state.returnCounterItems;
    }

    function setCounterStore(mode, items) {
        if (mode === 'pay') state.payCounterItems = items;
        else state.returnCounterItems = items;
    }

    function getCounterRefs(mode) {
        if (mode === 'pay') {
            return {
                counter: refs.payCounter,
                msg: refs.payMessage,
                nextBtn: refs.payNextBtn,
                bills: refs.payBankBills,
                coins: refs.payBankCoins,
                coinSection: refs.payBankCoinsSection
            };
        }
        return {
            counter: refs.returnCounter,
            msg: refs.returnMessage,
            nextBtn: refs.returnNextBtn,
            bills: refs.returnBankBills,
            coins: refs.returnBankCoins,
            coinSection: refs.returnBankCoinsSection
        };
    }

    function getDenById(id) {
        return DENOMINATIONS.find((d) => d.id === id);
    }

    function getDenSize(type) {
        if (type === 'bill') return { w: 132, h: 62 };
        if (type === 'coin-yuan') return { w: 62, h: 62 };
        return { w: 54, h: 54 };
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function setCheckoutMsg(mode, text, levelType) {
        const { msg } = getCounterRefs(mode);
        msg.textContent = text;
        msg.classList.remove('success', 'error');
        if (levelType === 'success') msg.classList.add('success');
        if (levelType === 'error') msg.classList.add('error');
    }

    function setNextVisible(mode, visible) {
        const { nextBtn } = getCounterRefs(mode);
        nextBtn.style.display = visible ? 'inline-block' : 'none';
    }

    function renderCounter(mode) {
        const { counter } = getCounterRefs(mode);
        const list = getCounterStore(mode);
        counter.innerHTML = '';

        list.forEach((entry) => {
            const den = getDenById(entry.denominationId);
            if (!den) return;
            const el = document.createElement('div');
            el.className = `counter-money ${den.type}`;
            el.style.left = `${entry.x}px`;
            el.style.top = `${entry.y}px`;
            el.draggable = true;
            el.dataset.id = entry.id;
            const img = document.createElement('img');
            img.src = den.image;
            img.alt = den.label;
            el.appendChild(img);

            el.addEventListener('dragstart', (event) => {
                state.dragCtx.mode = mode;
                state.dragCtx.counterId = entry.id;
                state.dragCtx.droppedInside = false;
                event.dataTransfer.setData(dragMime, JSON.stringify({ source: 'counter', mode, id: entry.id }));
            });

            el.addEventListener('dragend', () => {
                if (state.dragCtx.mode === mode && state.dragCtx.counterId === entry.id && !state.dragCtx.droppedInside) {
                    const next = getCounterStore(mode).filter((it) => it.id !== entry.id);
                    setCounterStore(mode, next);
                    renderCounter(mode);
                }
                state.dragCtx.mode = null;
                state.dragCtx.counterId = null;
                state.dragCtx.droppedInside = false;
            });

            counter.appendChild(el);
        });
    }

    function placeMoney(mode, denominationId, clientX, clientY) {
        const den = getDenById(denominationId);
        const { counter } = getCounterRefs(mode);
        if (!den || !counter) return;
        const rect = counter.getBoundingClientRect();
        const size = getDenSize(den.type);
        const x = clamp(clientX - rect.left - size.w / 2, 0, Math.max(0, rect.width - size.w));
        const y = clamp(clientY - rect.top - size.h / 2, 0, Math.max(0, rect.height - size.h));
        const list = getCounterStore(mode);
        list.push({
            id: `${mode}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            denominationId,
            x,
            y
        });
        renderCounter(mode);
    }

    function moveMoney(mode, itemId, clientX, clientY) {
        const { counter } = getCounterRefs(mode);
        const list = getCounterStore(mode);
        const target = list.find((it) => it.id === itemId);
        if (!target) return;
        const den = getDenById(target.denominationId);
        if (!den) return;

        const rect = counter.getBoundingClientRect();
        const size = getDenSize(den.type);
        target.x = clamp(clientX - rect.left - size.w / 2, 0, Math.max(0, rect.width - size.w));
        target.y = clamp(clientY - rect.top - size.h / 2, 0, Math.max(0, rect.height - size.h));
        renderCounter(mode);
    }

    function bindCounterDrop(mode) {
        const { counter } = getCounterRefs(mode);
        counter.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        });

        counter.addEventListener('drop', (event) => {
            event.preventDefault();
            const raw = event.dataTransfer.getData(dragMime);
            if (!raw) return;
            let payload = null;
            try {
                payload = JSON.parse(raw);
            } catch (err) {
                return;
            }

            if (payload.source === 'bank') {
                placeMoney(mode, payload.denominationId, event.clientX, event.clientY);
                state.dragCtx.droppedInside = true;
                return;
            }

            if (payload.source === 'counter' && payload.mode === mode) {
                state.dragCtx.droppedInside = true;
                moveMoney(mode, payload.id, event.clientX, event.clientY);
            }
        });
    }

    function renderBank(mode) {
        const { bills, coins, coinSection } = getCounterRefs(mode);
        const active = getActiveDenominations();
        const billList = active.filter((d) => d.type === 'bill');
        const coinList = active.filter((d) => d.type !== 'bill');

        bills.innerHTML = billList.map((den) => `
            <div class="bank-money bill" draggable="true" data-denomination="${den.id}" data-mode="${mode}">
                <img src="${den.image}" alt="${den.label}">
            </div>
        `).join('');

        if (coinList.length) {
            coinSection.style.display = 'block';
            coins.innerHTML = coinList.map((den) => `
                <div class="bank-money coin" draggable="true" data-denomination="${den.id}" data-mode="${mode}">
                    <img src="${den.image}" alt="${den.label}">
                </div>
            `).join('');
        } else {
            coinSection.style.display = 'none';
            coins.innerHTML = '';
        }

        document.querySelectorAll(`.bank-money[draggable=\"true\"][data-mode=\"${mode}\"]`).forEach((el) => {
            el.addEventListener('dragstart', (event) => {
                const denominationId = el.dataset.denomination;
                state.dragCtx.mode = mode;
                state.dragCtx.counterId = null;
                state.dragCtx.droppedInside = false;
                event.dataTransfer.setData(dragMime, JSON.stringify({ source: 'bank', mode, denominationId }));
            });
        });
    }

    function sumCounterFen(mode) {
        return getCounterStore(mode).reduce((sum, entry) => {
            const den = getDenById(entry.denominationId);
            return sum + (den ? den.valueFen : 0);
        }, 0);
    }

    function isEnoughLimitForCheckout() {
        const rule = getCurrentRule();
        if (!rule.requiresLimitCheck || !Number.isFinite(state.totalLimitFen)) return true;
        return state.totalPriceFen <= state.totalLimitFen;
    }

    function checkPayResult() {
        const userMoneyFen = sumCounterFen('pay');

        if (!isEnoughLimitForCheckout()) {
            setCheckoutMsg('pay', '消费超出限制，无法付款。', 'error');
            speak('消费超出限制，无法付款。');
            setNextVisible('pay', false);
            return;
        }

        if (userMoneyFen < state.totalPriceFen) {
            state.payFailCount += 1;
            let msg = '金额不足，请再放入一些人民币。';
            if (state.payFailCount >= 2) {
                msg += `\n还差${fmtFen(state.totalPriceFen - userMoneyFen)}！`;
            }
            setCheckoutMsg('pay', msg, 'error');
            speak(msg.replace(/\n/g, '，'));
            setNextVisible('pay', false);
            return;
        }

        // Easy: pay enough is sufficient.
        // Medium/Hard/Expert: overpay goes to change page and must be validated there.
        state.paidFen = userMoneyFen;
        state.needReturnFen = Math.max(0, userMoneyFen - state.totalPriceFen);
        state.payFailCount = 0;

        setCheckoutMsg('pay', '核对成功！', 'success');
        speak('核对成功。');
        setNextVisible('pay', true);
    }

    function checkReturnResult() {
        const userReturnFen = sumCounterFen('return');
        const targetFen = state.needReturnFen;

        if (userReturnFen === targetFen) {
            state.returnFailCount = 0;
            setCheckoutMsg('return', '找零正确！', 'success');
            speak('找零正确。');
            setNextVisible('return', true);
            return;
        }

        state.returnFailCount += 1;
        let msg = '找零不正确，请再试试。';
        if (state.returnFailCount >= 2) {
            const diff = Math.abs(userReturnFen - targetFen);
            msg += `\n${userReturnFen > targetFen ? '多了' : '少了'}${fmtFen(diff)}！`;
        }
        setCheckoutMsg('return', msg, 'error');
        speak(msg.replace(/\n/g, '，'));
        setNextVisible('return', false);
    }

    function clearCounter(mode) {
        setCounterStore(mode, []);
        renderCounter(mode);
        setNextVisible(mode, false);
        if (mode === 'pay') {
            state.payFailCount = 0;
            setCheckoutMsg('pay', '请先把钱拖入左侧灰色区域。', null);
            return;
        }
        state.returnFailCount = 0;
        setCheckoutMsg('return', '请把找零拖入左侧灰色区域。', null);
    }

    function autoplayVideoForPage(page) {
        const videoMap = {
            page1: refs.bearVideo,
            page2: refs.roleVideo,
            page6: refs.successVideo
        };
        const target = videoMap[page] || null;

        // Pause all other video pages
        [refs.bearVideo, refs.roleVideo, refs.successVideo].forEach((video) => {
            if (video && video !== target) video.pause();
        });

        if (!target) return;

        // Always reset to the beginning so the video is ready to play from the start
        target.currentTime = 0;

        // If auto-read (TTS) is enabled, leave the video paused for manual play;
        // only auto-play when TTS is off.
        const ttsActive = window.voiceCore && localStorage.getItem('autoPlay') === 'on';
        if (ttsActive) return;

        const delay = page === 'page1' ? 2000 : 0;
        setTimeout(() => {
            // Guard: only play if the user is still on the same page
            if (state.page !== page) return;
            const playPromise = target.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // Silently ignore autoplay policy blocks
                });
            }
        }, delay);
    }

    function renderCashierPanels() {
        refs.payAmountText.textContent = fmtFen(state.totalPriceFen);
        refs.payInstruction.textContent = `当前需要支付，请将人民币拖入左侧灰色区域以支付。\n应付金额：${fmtFen(state.totalPriceFen)}`;

        refs.returnAmountText.textContent = fmtFen(state.needReturnFen);
        refs.returnInstruction.textContent = `当前需要找零，请将人民币拖入左侧灰色区域以获得找零。\n商品总价：${fmtFen(state.totalPriceFen)}｜你支付了：${fmtFen(state.paidFen)}`;

        refs.returnAmountMask.classList.toggle('hidden', !state.showReturnMask);
    }

    function setActivePage(page) {
        state.page = page;
        refs.page0.classList.toggle('active', page === 'page0');
        refs.page1.classList.toggle('active', page === 'page1');
        refs.page2.classList.toggle('active', page === 'page2');
        refs.page3.classList.toggle('active', page === 'page3');
        refs.page4.classList.toggle('active', page === 'page4');
        refs.page5.classList.toggle('active', page === 'page5');
        refs.page6.classList.toggle('active', page === 'page6');

        refs.mainTitle.textContent = {
            page0: '消费限额设置',
            page1: '欢迎来到熊伯伯超市',
            page2: `轮到${director.name}去购物啦！`,
            page3: '熊伯伯超市',
            page4: '收银台（支付）',
            page5: '收银台（找零）',
            page6: '购物成功啦！'
        }[page];

        refs.itemStrip.style.display = (page === 'page0' && level.requiresLimit) || page === 'page3' ? 'flex' : 'none';
        refs.resetCounterBtn.style.display = page === 'page4' || page === 'page5' ? 'inline-block' : 'none';

        if (page === 'page4') {
            state.payFailCount = 0;
            setCheckoutMsg('pay', '请先把钱拖入左侧灰色区域。', null);
            setNextVisible('pay', false);
        }
        if (page === 'page5') {
            state.returnFailCount = 0;
            setCheckoutMsg('return', '请把找零拖入左侧灰色区域。', null);
            setNextVisible('return', false);
        }

        refs.navbarItems.forEach((item) => item.classList.remove('active'));
        if (page === 'page0' && refs.navLimit) refs.navLimit.classList.add('active');
        if (page === 'page3') refs.navbarItems.find((n) => n.dataset.jump === 'page3')?.classList.add('active');
        if (page === 'page4' || page === 'page5') refs.navbarItems.find((n) => n.dataset.jump === 'page4')?.classList.add('active');

        renderStrip();
        renderLimitProcess();
        renderCashierPanels();
        autoplayVideoForPage(page);

        const voiceText = {
            page0: '请设置消费限额。',
            page1: '欢迎来到熊伯伯超市。',
            page2: `轮到${director.name}去购物了。`,
            page3: '开始选择商品并加入购物车。',
            page4: '进入收银台支付。',
            page5: '进入收银台找零。',
            page6: `你自己完成付钱了，真棒。`
        }[page];
        speak(voiceText);
    }

    function resetAll() {
        state.cart = {};
        state.totalPriceFen = 0;
        state.activeCategory = 'fruits';
        state.limitMode = 'manual';
        state.totalLimitFen = null;
        state.payCounterItems = [];
        state.returnCounterItems = [];
        state.payFailCount = 0;
        state.returnFailCount = 0;
        state.paidFen = 0;
        state.needReturnFen = 0;
        state.showReturnMask = true;

        seedGoods();
        renderLimitConfig();
        renderShop();
        clearCounter('pay');
        clearCounter('return');
        setActivePage(level.requiresLimit ? 'page0' : 'page1');
    }

    function bindEvents() {
        refs.closeWarningBtn.addEventListener('click', closeWarning);

        refs.navbarItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const jump = item.dataset.jump;
                if (jump === 'page0' && level.requiresLimit) setActivePage('page0');
                if (jump === 'page3') setActivePage('page3');
                if (jump === 'page4') setActivePage('page4');
            });
        });

        refs.confirmLimitBtn.addEventListener('click', () => {
            if (level.requiresLimit && state.limitMode !== 'none' && !Number.isFinite(state.totalLimitFen)) {
                speak('请先设置有效金额。');
                return;
            }
            setActivePage('page1');
        });

        refs.toPage2Btn.addEventListener('click', () => setActivePage('page2'));
        refs.toPage3Btn.addEventListener('click', () => setActivePage('page3'));
        refs.checkoutBtn.addEventListener('click', () => {
            clearCounter('pay');
            setActivePage('page4');
        });

        refs.payCheckBtn.addEventListener('click', checkPayResult);
        refs.payNextBtn.addEventListener('click', () => {
            const rule = getCurrentRule();
            if (!rule.needsReturnStepOnOverpay || state.needReturnFen <= 0) {
                setActivePage('page6');
                return;
            }
            clearCounter('return');
            setActivePage('page5');
        });

        refs.returnCheckBtn.addEventListener('click', checkReturnResult);
        refs.returnNextBtn.addEventListener('click', () => setActivePage('page6'));

        refs.toggleReturnMaskBtn.addEventListener('click', () => {
            state.showReturnMask = !state.showReturnMask;
            renderCashierPanels();
        });

        refs.restartBtn.addEventListener('click', resetAll);
        refs.resetCounterBtn.addEventListener('click', () => {
            if (state.page === 'page4') {
                clearCounter('pay');
                speak('支付柜台已重置。');
            } else if (state.page === 'page5') {
                clearCounter('return');
                speak('找零柜台已重置。');
            }
        });

        bindCounterDrop('pay');
        bindCounterDrop('return');
    }

    function initStaticAssets() {
        refs.bearVideo.src = '../../../assets/vedios/sundry/bear-uncle.mp4';
        refs.roleVideo.src = `../../../assets/vedios/payment/${director.video}.mp4`;
        refs.successVideo.src = `../../../assets/vedios/directors/${director.video}.mp4`;

        refs.rolePageText.textContent = `看看${director.name}怎么买东西。\n然后你来试试！`;
        refs.successText.textContent = `你自己完成付钱了！真棒！`;

        if (!level.requiresLimit && refs.navLimit) refs.navLimit.style.display = 'none';

        renderBank('pay');
        renderBank('return');
    }

    function init() {
        initStaticAssets();
        seedGoods();
        bindEvents();
        renderLimitConfig();
        renderShop();
        clearCounter('pay');
        clearCounter('return');
        setActivePage(state.page);
    }

    init();
});

