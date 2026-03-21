document.addEventListener('DOMContentLoaded', () => {
    const APP = {
        wechat: { name: '微信', className: 'app-wechat' },
        alipay: { name: '支付宝', className: 'app-alipay' }
    };

    const state = {
        app: 'wechat',
        mode: 'scan',
        page: 1,
        amount: 0,
        phoneScene: 'wc-home',
        scanReady: false,
        password: ''
    };

    const drag = { active: false, sx: 0, sy: 0, bx: 0, by: 0, x: 0, y: 0 };

    const refs = {
        reader: document.getElementById('page-reader-text'),
        navbarItems: Array.from(document.querySelectorAll('#app-navbar .nav-item')),
        modeScanBtn: document.getElementById('mode-scan-btn'),
        modeCodeBtn: document.getElementById('mode-code-btn'),
        mainTitle: document.getElementById('main-title'),
        canvas: document.getElementById('ops-canvas'),
        page1: document.getElementById('page-1-method'),
        page2: document.getElementById('page-2-sim'),
        page3: document.getElementById('page-3-confirm'),
        page4: document.getElementById('page-4-success'),
        methodCards: Array.from(document.querySelectorAll('.method-card')),
        amount1: document.getElementById('target-amount-page1'),
        amount2: document.getElementById('target-amount-page2'),
        amount3: document.getElementById('target-amount-page3'),
        phone: document.getElementById('sim-phone'),
        phoneScreen: document.getElementById('sim-phone-screen'),
        simTip: document.getElementById('sim-tip'),
        qrTarget: document.getElementById('sim-fixed-qr'),
        scannerTarget: document.getElementById('sim-scanner'),
        passwordDots: Array.from(document.querySelectorAll('#password-dots span')),
        passwordKeypad: document.getElementById('password-keypad'),
        successNextBtn: document.getElementById('success-next-btn'),
        resetBtn: document.getElementById('reset-btn')
    };

    function setReaderText(text) {
        if (refs.reader) refs.reader.textContent = text || '';
    }

    function speakFeedback(text) {
        setReaderText(text);
        if (window.voiceCore) window.voiceCore.speakText(text);
    }

    function randomAmount() {
        // 0.01 - 200.00 with exactly 2 decimals.
        const fen = Math.floor(Math.random() * 20000) + 1;
        return fen / 100;
    }

    function fmt(amount) {
        return `¥${amount.toFixed(2)}`;
    }

    function setTip(text, level) {
        refs.simTip.textContent = text || '';
        refs.simTip.classList.remove('success', 'error');
        if (level) refs.simTip.classList.add(level);
    }

    function resetPhonePos() {
        drag.x = 0;
        drag.y = 0;
        refs.phone.style.transform = 'translate(0px, 0px)';
    }

    function homeSceneOf(app) {
        return app === 'wechat' ? 'wc-home' : 'ap-home';
    }

    function scanSceneOf(app) {
        return app === 'wechat' ? 'wc-scan' : 'ap-scan';
    }

    function codeSceneOf(app) {
        return app === 'wechat' ? 'wc-paycode' : 'ap-paycode';
    }

    function setPasswordDots() {
        refs.passwordDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < state.password.length);
        });
    }

    function switchPage(page) {
        state.page = page;
        refs.page1.classList.toggle('active', page === 1);
        refs.page2.classList.toggle('active', page === 2);
        refs.page3.classList.toggle('active', page === 3);
        refs.page4.classList.toggle('active', page === 4);

        if (page === 1) {
            refs.mainTitle.textContent = '选择支付软件';
            setReaderText(`当前金额是${fmt(state.amount)}，请选择微信或支付宝。`);
        } else if (page === 2) {
            refs.mainTitle.textContent = '手机操作模拟与扫码';
            setReaderText(`当前使用${APP[state.app].name}${state.mode === 'scan' ? '主动扫码' : '出示付款码'}。请完成手机入口操作并拖动手机完成扫码。`);
        } else if (page === 3) {
            refs.mainTitle.textContent = '付款确认';
            setReaderText(`金额已自动填入${fmt(state.amount)}。请输入六位支付密码完成支付。`);
        } else {
            refs.mainTitle.textContent = '支付完成';
            setReaderText('付钱成功了！请记住核对金额，金额一致就是正确，不一致要告诉大人。');
        }
    }

    function renderNavbar() {
        refs.navbarItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.app === state.app);
        });
    }

    function renderModeBar() {
        refs.modeScanBtn.classList.toggle('active', state.mode === 'scan');
        refs.modeCodeBtn.classList.toggle('active', state.mode === 'code');
    }

    function renderTargets() {
        refs.qrTarget.style.display = state.mode === 'scan' ? 'block' : 'none';
        refs.scannerTarget.style.display = state.mode === 'code' ? 'block' : 'none';
        refs.qrTarget.classList.remove('hit');
        refs.scannerTarget.classList.remove('hit');

        // Dynamic layering requested by product flow:
        // scan mode => merchant target under phone; code mode => merchant target above phone.
        const phoneZ = 20;
        refs.phone.style.zIndex = String(phoneZ);
        if (state.mode === 'scan') {
            refs.qrTarget.style.zIndex = '10';
            refs.scannerTarget.style.zIndex = '5';
        } else {
            refs.qrTarget.style.zIndex = '5';
            refs.scannerTarget.style.zIndex = '30';
        }
    }

    function renderAmountLabels() {
        const text = fmt(state.amount);
        if (refs.amount1) refs.amount1.textContent = '';
        if (refs.amount2) refs.amount2.textContent = `需要支付：${text}`;
        if (refs.amount3) refs.amount3.textContent = text;
    }

    function renderPhoneScene() {
        const app = state.app;
        let scene = state.phoneScene;
        if (app === 'wechat' && !scene.startsWith('wc-')) scene = homeSceneOf(app);
        if (app === 'alipay' && !scene.startsWith('ap-')) scene = homeSceneOf(app);
        state.phoneScene = scene;

        if (app === 'wechat') {
            refs.phoneScreen.innerHTML = `
                <div class="pp on" style="display:${scene === 'wc-home' || scene === 'wc-menu' ? 'flex' : 'none'}">
                    <div class="wch"><span class="wchi">☰</span><span class="wcht">微信</span><span class="wchi" data-phone-act="toggle-plus">＋</span></div>
                    <div class="pb" style="background:#ededed">
                        <div style="padding:7px 11px"><div style="background:#fff;border-radius:5px;padding:5px 9px"><span style="font-size:12px;color:#ccc">🔍 搜索</span></div></div>
                        <div class="wci"><div class="wav" style="background:#FFF3E0">🐻</div><div style="flex:1"><div style="font-size:13px;font-weight:500;color:#000">熊伯伯超市</div><div style="font-size:11px;color:#999">今天有特价商品～</div></div><div style="font-size:10px;color:#ccc">刚刚</div></div>
                        <div class="wci"><div class="wav" style="background:#E8F5E9">👨‍👩‍👧</div><div style="flex:1"><div style="font-size:13px;font-weight:500;color:#000">家庭群</div><div style="font-size:11px;color:#999">妈妈：今天乖乖的哦</div></div><div style="font-size:10px;color:#ccc">10:30</div></div>
                    </div>
                    <div class="plusmenu${scene === 'wc-menu' ? ' show' : ''}" data-phone-act="close-plus">
                        <div class="plusgrid" onclick="event.stopPropagation()">
                            <div class="plusi" data-phone-act="open-scan"><div class="plusi-ico" style="background:#2196F3">📷</div><span class="plusi-lbl">扫一扫</span></div>
                            <div class="plusi"><div class="plusi-ico" style="background:#9C27B0">💸</div><span class="plusi-lbl">转账</span></div>
                            <div class="plusi"><div class="plusi-ico" style="background:#FF5722">🎁</div><span class="plusi-lbl">红包</span></div>
                        </div>
                    </div>
                    <div class="wnav">
                        <div class="wni"><span style="font-size:20px">💬</span><span style="font-size:10px;color:#1AAD19">微信</span></div>
                        <div class="wni"><span style="font-size:20px">👥</span><span style="font-size:10px;color:#888">通讯录</span></div>
                        <div class="wni"><span style="font-size:20px">🔍</span><span style="font-size:10px;color:#888">发现</span></div>
                        <div class="wni" data-phone-act="open-me"><span style="font-size:20px">👤</span><span style="font-size:10px;color:#888">我</span></div>
                    </div>
                </div>

                <div class="pp" style="display:${scene === 'wc-scan' ? 'flex' : 'none'};background:transparent">
                    <div class="scan-hdr" style="background:transparent;padding-top:26px"><span style="color:#1AAD19;font-size:17px;cursor:pointer" data-phone-act="back-home">✕</span><span style="color:#1AAD19;font-size:15px;font-weight:500;flex:1;text-align:center">扫一扫</span><span style="color:#1AAD19">⚡</span></div>
                    <div class="svf"><div class="sframe"><div class="sc tl"></div><div class="sc tr"></div><div class="sc bl"></div><div class="sc br"></div><div class="scanline" style="background:linear-gradient(to right,transparent,#1AAD19,transparent);"></div></div><div class="scan-clicktip">拖动手机去对准右侧二维码</div></div>
                </div>

                <div class="pp" style="display:${scene === 'wc-me' ? 'flex' : 'none'}">
                    <div class="wch"><span style="width:22px"></span><span class="wcht">我</span><span style="width:22px"></span></div>
                    <div class="pb" style="background:#f0f0f0">
                        <div style="background:#fff;padding:14px 13px;display:flex;align-items:center;gap:10px;margin-bottom:7px"><div style="width:50px;height:50px;border-radius:7px;background:#EAF3DE;display:flex;align-items:center;justify-content:center;font-size:28px">🐱</div><div><div style="font-size:15px;font-weight:500;color:#000">小朋友</div><div style="font-size:11px;color:#999">微信号: xiaopengyou</div></div></div>
                        <div style="background:#fff;margin-bottom:7px"><div style="padding:11px 13px;border-bottom:0.5px solid #f0f0f0;display:flex;align-items:center;gap:9px;cursor:pointer" data-phone-act="open-code"><span style="font-size:19px">💳</span><span style="font-size:13px;flex:1;color:#000">付款码</span><span style="color:#ccc">›</span></div></div>
                    </div>
                    <div class="wnav">
                        <div class="wni" data-phone-act="back-home"><span style="font-size:20px">💬</span><span style="font-size:10px;color:#888">微信</span></div>
                        <div class="wni"><span style="font-size:20px">👥</span><span style="font-size:10px;color:#888">通讯录</span></div>
                        <div class="wni"><span style="font-size:20px">🔍</span><span style="font-size:10px;color:#888">发现</span></div>
                        <div class="wni"><span style="font-size:20px">👤</span><span style="font-size:10px;color:#1AAD19">我</span></div>
                    </div>
                </div>

                <div class="pp" style="display:${scene === 'wc-paycode' ? 'flex' : 'none'};background:#fff">
                    <div style="background:#1AAD19;padding:26px 13px 9px;display:flex;align-items:center"><span style="color:#fff;font-size:17px;cursor:pointer;width:22px" data-phone-act="open-me">‹</span><span style="color:#fff;font-size:15px;font-weight:500;flex:1;text-align:center">付款码</span><span style="width:22px"></span></div>
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:12px"><div style="font-size:12px;color:#999;margin-bottom:7px">向收款方展示此码</div><div class="pcbr" style="width:210px"></div><div class="pcqr"></div><div style="font-size:24px;font-weight:300;color:#333;margin:7px 0">¥<span>${state.amount.toFixed(2)}</span></div><div style="font-size:11px;color:#1AAD19;margin-bottom:13px">🔄 自动刷新中</div></div>
                </div>
            `;
        } else {
            refs.phoneScreen.innerHTML = `
                <div class="pp on" style="display:${scene === 'ap-home' ? 'flex' : 'none'};background:#f0f4f8">
                    <div class="aph"><span style="font-size:12px;color:rgba(255,255,255,0.8)">支付宝</span><div style="flex:1;margin:0 7px;background:rgba(255,255,255,0.2);border-radius:14px;padding:4px 9px"><span style="font-size:11px;color:rgba(255,255,255,0.8)">🔍 搜索</span></div><span style="color:#fff;font-size:17px">⚙️</span></div>
                    <div class="pb"><div class="apqg"><div class="apai" data-phone-act="open-scan"><div class="apai-ico" style="background:#E3F2FD">📷</div><span style="font-size:10px;color:#333">扫一扫</span></div><div class="apai" data-phone-act="open-code"><div class="apai-ico" style="background:#FFF3E0">💳</div><span style="font-size:10px;color:#333">付款码</span></div><div class="apai"><div class="apai-ico" style="background:#F3E5F5">💸</div><span style="font-size:10px;color:#333">转账</span></div><div class="apai"><div class="apai-ico" style="background:#E8F5E9">🏦</div><span style="font-size:10px;color:#333">充值</span></div><div class="apai"><div class="apai-ico" style="background:#FCEBD7">🎁</div><span style="font-size:10px;color:#333">红包</span></div><div class="apai"><div class="apai-ico" style="background:#E8EAF6">🏠</div><span style="font-size:10px;color:#333">缴费</span></div><div class="apai"><div class="apai-ico" style="background:#FCE4EC">🎫</div><span style="font-size:10px;color:#333">票务</span></div><div class="apai"><div class="apai-ico" style="background:#E0F7FA">🛒</div><span style="font-size:10px;color:#333">淘宝</span></div></div></div>
                    <div class="apnav"><div class="apni"><span style="font-size:20px">🏠</span><span style="font-size:10px;color:#1677FF">首页</span></div><div class="apni"><span style="font-size:20px">💰</span><span style="font-size:10px;color:#888">财富</span></div><div class="apni"><span style="font-size:20px">🛒</span><span style="font-size:10px;color:#888">生活</span></div><div class="apni"><span style="font-size:20px">👤</span><span style="font-size:10px;color:#888">我的</span></div></div>
                </div>

                <div class="pp" style="display:${scene === 'ap-scan' ? 'flex' : 'none'};background:transparent">
                    <div class="scan-hdr" style="background:transparent;padding-top:26px"><span style="color:#1677FF;font-size:17px;cursor:pointer" data-phone-act="back-home">✕</span><span style="color:#1677FF;font-size:15px;font-weight:500;flex:1;text-align:center">扫一扫</span><span style="color:#1677FF">⚡</span></div>
                    <div class="svf"><div class="sframe"><div class="sc tl"></div><div class="sc tr"></div><div class="sc bl"></div><div class="sc br"></div><div class="scanline" style="background:linear-gradient(to right,transparent,#1677FF,transparent);"></div></div><div class="scan-clicktip">拖动手机去对准右侧二维码</div></div>
                </div>

                <div class="pp" style="display:${scene === 'ap-paycode' ? 'flex' : 'none'};background:#fff">
                    <div style="background:#1677FF;padding:26px 13px 9px;display:flex;align-items:center"><span style="color:#fff;font-size:17px;cursor:pointer;width:22px" data-phone-act="back-home">‹</span><span style="color:#fff;font-size:15px;font-weight:500;flex:1;text-align:center">付款码</span><span style="width:22px"></span></div>
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:12px"><div style="font-size:12px;color:#999;margin-bottom:7px">向收款方展示此码</div><div class="pcbr" style="width:210px"></div><div class="pcqr" style="border-color:#1677FF22"></div><div style="font-size:24px;font-weight:300;color:#1677FF;margin:7px 0">¥<span>${state.amount.toFixed(2)}</span></div><div style="font-size:11px;color:#1677FF;margin-bottom:13px">🔄 自动刷新中</div></div>
                </div>
            `;
        }

        refs.phoneScreen.querySelectorAll('[data-phone-act]').forEach((btn) => {
            btn.addEventListener('click', () => handlePhoneAction(btn.dataset.phoneAct));
        });

        refs.phoneScreen.querySelectorAll('.pcbr').forEach((el) => {
            let bars = '';
            for (let i = 0; i < 60; i += 1) {
                const flex = Math.random() > 0.5 ? 2 : 1;
                const color = Math.random() > 0.3 ? '#1a1a1a' : '#fff';
                bars += `<div style="flex:${flex};background:${color};border-radius:1px;height:100%"></div>`;
            }
            el.innerHTML = bars;
        });

        refs.phoneScreen.querySelectorAll('.pcqr').forEach((el) => {
            let cells = '';
            for (let i = 0; i < 100; i += 1) {
                const dark = Math.random() > 0.5;
                cells += `<div style="background:${dark ? '#1a1a1a' : '#fff'};border-radius:1px"></div>`;
            }
            el.style.display = 'grid';
            el.style.gridTemplateColumns = 'repeat(10,1fr)';
            el.style.gap = '1px';
            el.style.padding = '7px';
            el.innerHTML = cells;
        });
    }

    function isPhoneReadyForDrag() {
        if (state.mode === 'scan') return state.phoneScene === scanSceneOf(state.app);
        return state.phoneScene === codeSceneOf(state.app);
    }

    function handlePhoneAction(action) {
        if (state.page !== 2) return;
        if (action === 'back-home') {
            state.phoneScene = homeSceneOf(state.app);
            state.scanReady = false;
            renderPhoneScene();
            setTip('已返回主页，请重新找到支付入口。', null);
            return;
        }

        if (action === 'toggle-plus' && state.app === 'wechat') {
            state.phoneScene = state.phoneScene === 'wc-menu' ? 'wc-home' : 'wc-menu';
            renderPhoneScene();
            setTip('微信扫一扫在右上角＋里。', null);
            return;
        }

        if (action === 'close-plus' && state.app === 'wechat' && state.phoneScene === 'wc-menu') {
            state.phoneScene = 'wc-home';
            renderPhoneScene();
            return;
        }

        if (action === 'open-me' && state.app === 'wechat') {
            state.phoneScene = 'wc-me';
            renderPhoneScene();
            setTip('在“我”页面中可找到付款码。', null);
            return;
        }

        if (action === 'open-scan') {
            if (state.mode !== 'scan') {
                setTip('当前模式是出示付款码，请先切换模式。', 'error');
                speakFeedback('当前模式不是主动扫码。');
                return;
            }
            state.phoneScene = scanSceneOf(state.app);
            state.scanReady = false;
            renderPhoneScene();
            setTip('入口正确！拖动手机去对准右侧二维码。', 'success');
            speakFeedback('入口正确，拖动手机去对准右侧二维码。');
            return;
        }

        if (action === 'open-code') {
            if (state.mode !== 'code') {
                setTip('当前模式是主动扫码，请先切换模式。', 'error');
                speakFeedback('当前模式不是出示付款码。');
                return;
            }
            state.phoneScene = codeSceneOf(state.app);
            state.scanReady = false;
            renderPhoneScene();
            setTip('入口正确！把手机拖到扫码器前面。', 'success');
            speakFeedback('入口正确，把手机拖到扫码器前面。');
        }
    }

    function getPoint(e) {
        if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    function overlap(a, b, margin = 20) {
        return !(a.right < b.left + margin || a.left > b.right - margin || a.bottom < b.top + margin || a.top > b.bottom - margin);
    }

    function containsRect(outer, inner, pad = 0) {
        return inner.left >= outer.left + pad
            && inner.right <= outer.right - pad
            && inner.top >= outer.top + pad
            && inner.bottom <= outer.bottom - pad;
    }

    function overlapRatio(a, b) {
        const left = Math.max(a.left, b.left);
        const right = Math.min(a.right, b.right);
        const top = Math.max(a.top, b.top);
        const bottom = Math.min(a.bottom, b.bottom);
        if (right <= left || bottom <= top) return 0;
        const intersection = (right - left) * (bottom - top);
        const bArea = Math.max(1, (b.right - b.left) * (b.bottom - b.top));
        return intersection / bArea;
    }

    function onDragCheck() {
        if (state.page !== 2 || !isPhoneReadyForDrag() || state.scanReady) return;
        const pRect = refs.phone.getBoundingClientRect();

        if (state.mode === 'scan') {
            const merchQrEl = refs.qrTarget.querySelector('#sim-merch-qr');
            const qrCoreEl = refs.qrTarget.querySelector('.target-core');
            const qrCore = (merchQrEl || qrCoreEl).getBoundingClientRect();
            const scanFrame = refs.phoneScreen.querySelector('.sframe');
            const frameRect = scanFrame ? scanFrame.getBoundingClientRect() : null;
            const inFrame = frameRect ? containsRect(frameRect, qrCore, 6) : false;
            const strongOverlap = frameRect ? overlapRatio(frameRect, qrCore) >= 0.9 : overlap(pRect, qrCore, 10);
            if (inFrame || strongOverlap) {
                refs.qrTarget.classList.add('hit');
                setTip('扫码成功！进入付款确认页面。', 'success');
                speakFeedback('扫码成功，进入付款确认页面。');
                state.scanReady = true;
                setTimeout(() => switchPage(3), 250);
            }
        } else {
            const scannerBody = refs.scannerTarget.getBoundingClientRect();
            const scannerCore = refs.scannerTarget.querySelector('.target-core').getBoundingClientRect();
            if (overlap(pRect, scannerBody, 12) || overlap(pRect, scannerCore, 16)) {
                refs.scannerTarget.classList.add('hit');
                setTip('被扫码成功！进入付款确认页面。', 'success');
                speakFeedback('被扫码成功，进入付款确认页面。');
                state.scanReady = true;
                setTimeout(() => switchPage(3), 250);
            }
        }
    }

    function bindPhoneDrag() {
        const start = (e) => {
            if (state.page !== 2) return;
            e.preventDefault();
            const p = getPoint(e);
            drag.active = true;
            drag.sx = p.x;
            drag.sy = p.y;
            drag.bx = drag.x;
            drag.by = drag.y;
        };

        const move = (e) => {
            if (!drag.active) return;
            e.preventDefault();
            const p = getPoint(e);
            drag.x = drag.bx + (p.x - drag.sx);
            drag.y = drag.by + (p.y - drag.sy);
            refs.phone.style.transform = `translate(${drag.x}px, ${drag.y}px)`;
            onDragCheck();
        };

        const end = () => { drag.active = false; };

        refs.phone.addEventListener('mousedown', start);
        refs.phone.addEventListener('touchstart', start, { passive: false });
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('mouseup', end);
        document.addEventListener('touchend', end);
    }

    function handlePasswordKey(key) {
        if (state.page !== 3) return;

        if (key === 'cancel') {
            state.password = '';
            setPasswordDots();
            speakFeedback('已取消输入密码。');
            return;
        }

        if (key === 'del') {
            state.password = state.password.slice(0, -1);
            setPasswordDots();
            return;
        }

        if (state.password.length >= 6) return;
        state.password += key;
        setPasswordDots();

        if (state.password.length === 6) {
            speakFeedback('密码输入完成，支付成功。');
            setTimeout(() => switchPage(4), 220);
        }
    }

    function resetAll() {
        state.page = 1;
        state.mode = 'scan';
        state.phoneScene = homeSceneOf(state.app);
        state.scanReady = false;
        state.password = '';
        state.amount = randomAmount();
        setPasswordDots();
        setTip('', null);
        render();
        switchPage(1);
        speakFeedback('已重新开始线上支付模拟练习。');
    }

    function bindEvents() {
        refs.navbarItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const app = item.dataset.app;
                if (!APP[app]) return;
                state.app = app;
                state.phoneScene = homeSceneOf(app);
                state.scanReady = false;
                resetPhonePos();
                render();
                if (state.page === 2) {
                    setTip('已切换支付软件，请重新找到正确入口。', null);
                    setReaderText(`已切换到${APP[app].name}，请继续完成${state.mode === 'scan' ? '主动扫码' : '出示付款码'}。`);
                }
            });
        });

        refs.modeScanBtn.addEventListener('click', () => {
            state.mode = 'scan';
            state.phoneScene = homeSceneOf(state.app);
            state.scanReady = false;
            resetPhonePos();
            render();
            if (state.page === 2) {
                setTip('已切换为主动扫码，请重新找到扫一扫入口。', null);
                speakFeedback('已切换为主动扫码模式。');
            }
        });

        refs.modeCodeBtn.addEventListener('click', () => {
            state.mode = 'code';
            state.phoneScene = homeSceneOf(state.app);
            state.scanReady = false;
            resetPhonePos();
            render();
            if (state.page === 2) {
                setTip('已切换为出示付款码，请重新找到付款码入口。', null);
                speakFeedback('已切换为出示付款码模式。');
            }
        });

        refs.methodCards.forEach((btn) => {
            btn.addEventListener('click', () => {
                const method = btn.dataset.method;
                if (!APP[method]) return;
                state.app = method;
                state.phoneScene = homeSceneOf(method);
                state.scanReady = false;
                resetPhonePos();
                render();
                switchPage(2);
                setTip(`已进入${APP[method].name}模拟，请先找到${state.mode === 'scan' ? '扫一扫' : '付款码'}入口。`, null);
            });
        });

        refs.passwordKeypad.querySelectorAll('[data-pwd]').forEach((btn) => {
            btn.addEventListener('click', () => handlePasswordKey(btn.dataset.pwd));
        });

        refs.successNextBtn.addEventListener('click', () => {
            resetAll();
        });

        refs.resetBtn.addEventListener('click', () => {
            resetAll();
        });
    }

    function render() {
        renderNavbar();
        renderModeBar();
        renderTargets();
        renderAmountLabels();
        renderPhoneScene();
        refs.canvas.classList.remove('app-wechat', 'app-alipay');
        refs.canvas.classList.add(APP[state.app].className);
    }

    function init() {
        bindEvents();
        bindPhoneDrag();
        resetAll();
    }

    init();
});

