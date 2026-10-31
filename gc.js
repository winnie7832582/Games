/* 遊戲合集共用模組
   1. 存檔：每款遊戲的存檔會自動存進「目前選擇的玩家」底下，不同玩家互不影響。
   2. 成就、每日挑戰、玩家等級：遊戲在結算時呼叫 GC.report / GC.max / GC.add，
      這裡負責記錄、判斷、跳出通知。首頁也讀這裡的資料來顯示。
   想新增或修改成就、每日挑戰，只要改下面的 ACH 和 QUESTS 兩份清單。 */
(function () {
  'use strict';
  var scr = document.currentScript;
  var src = (scr && scr.getAttribute('src')) || '';
  var IS_GAME = /^\.\.\//.test(src);
  var CUR = 'gc:current';

  /* ================= 錯誤紀錄（給「回報問題」用）與裝置設定 ================= */
  var EKEY = 'gc:errlog';
  function logErr(msg, src) {
    try { var a = JSON.parse(localStorage.getItem(EKEY) || '[]'); a.unshift({ t: Date.now(), p: location.pathname.split('/').pop() || 'index.html', m: String(msg).slice(0, 300), s: src || '' }); localStorage.setItem(EKEY, JSON.stringify(a.slice(0, 30))); } catch (e) {}
  }
  window.addEventListener('error', function (e) { if (e && e.message) logErr(e.message, (e.filename || '').split('/').pop() + ':' + e.lineno + ':' + e.colno); });
  window.addEventListener('unhandledrejection', function (e) { var r = e && e.reason; logErr('Promise：' + (r && r.message ? r.message : r)); });
  function setting(k, d) { try { var v = localStorage.getItem('gc:' + k); return v === null ? d : v; } catch (e) { return d; } }
  if (setting('vib', '1') === '0') { try { navigator.vibrate = function () { return false; }; } catch (e) {} }
  if (setting('rm', '0') === '1') {
    try { var mm0 = window.matchMedia.bind(window); window.matchMedia = function (q) { if (/prefers-reduced-motion/.test(q)) return { matches: true, media: q, onchange: null, addListener: function () {}, removeListener: function () {}, addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () { return false; } }; return mm0(q); }; } catch (e) {}
    try { var rs = document.createElement('style'); rs.textContent = '*,*::before,*::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important}'; document.head.appendChild(rs); } catch (e) {}
  }

  function curPid() { try { return localStorage.getItem(CUR) || 'guest'; } catch (e) { return 'guest'; } }
  function ns(k) { return 'gc:p:' + curPid() + ':' + k; }
  function lsGet(k) { try { return localStorage.getItem(ns(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(ns(k), String(v)); return true; } catch (e) { return false; } }

  window.GCStore = {
    getItem: function (k) { return lsGet(k); },
    setItem: function (k, v) { if (!lsSet(k, v)) alert('裝置空間不足，進度可能沒有存起來。可以到合集首頁匯出備份。'); },
    removeItem: function (k) { try { localStorage.removeItem(ns(k)); } catch (e) {} }
  };

  /* ================= 成就清單 ================= */
  /* 條件格式：
     ['max', 遊戲, 指標, 數值]   該指標曾經達到過的最高值 >= 數值
     ['sum', 遊戲, 指標, 數值]   該指標累計 >= 數值
     ['plays', 遊戲, 次數]       完成的次數 >= 次數
     ['gamesPlayed', 數]  玩過幾款遊戲   ['streak', 數]  連續遊玩天數   ['questAll', 數]  全勤天數
     ['count', 數]  已解鎖成就數   ['own', 數]  收藏商店買過的件數
     條件可以用陣列包起來表示「全部都要符合」 */
  var ACH = [];
  function A(id, game, name, desc, cond, hard) { ACH.push({ id: id, game: game, name: name, desc: desc, c: cond, xp: hard ? 50 : 20, hard: !!hard }); }
  A('sf1', 'souffle', '第一個舒芙蕾', '完成一次舒芙蕾', ['plays', 'souffle', 1]);
  A('sf2', 'souffle', '蓬鬆柔軟', '舒芙蕾拿到 70 分以上', ['max', 'souffle', 'score', 70]);
  A('sf3', 'souffle', '米其林甜點主廚', '舒芙蕾拿到 90 分以上', ['max', 'souffle', 'score', 90], 1);
  A('sw1', 'sanwei-kitchen', '開火了', '完成一道三味廚房的料理', ['plays', 'sanwei-kitchen', 1]);
  A('sw2', 'sanwei-kitchen', '三味俱全', '舒芙蕾、蛋包飯、蚵仔煎都做過', [['max', 'sanwei-kitchen', 'dish_souffle', 1], ['max', 'sanwei-kitchen', 'dish_omurice', 1], ['max', 'sanwei-kitchen', 'dish_oajian', 1]]);
  A('sw3', 'sanwei-kitchen', '職人水準', '任一道菜拿到 85 分以上', ['max', 'sanwei-kitchen', 'score', 85]);
  A('sw4', 'sanwei-kitchen', '三星收藏家', '累計拿到 5 次三顆星', ['sum', 'sanwei-kitchen', 'stars3', 5], 1);
  A('bt1', 'bubble-tea', '開店大吉', '完成一次搖搖茶舖的營業', ['plays', 'bubble-tea', 1]);
  A('bt2', 'bubble-tea', '手腳俐落', '單次營業額 $500 以上', ['max', 'bubble-tea', 'money', 500]);
  A('bt3', 'bubble-tea', '完美主義', '單次做出 12 杯完美飲料', ['max', 'bubble-tea', 'perfect', 12]);
  A('bt4', 'bubble-tea', '排隊名店', '單次營業額 $1000 以上', ['max', 'bubble-tea', 'money', 1000], 1);
  A('bt5', 'bubble-tea', '一心一意', '只留 1 次失誤機會，營業額還是 $300 以上', ['max', 'bubble-tea', 'hardMoney', 300], 1);
  A('cf1', 'cafe', '第一杯', '做完一杯咖啡', ['plays', 'cafe', 1]);
  A('cf2', 'cafe', '好喝！', '做出一杯 80 分以上', ['max', 'cafe', 'cup', 80]);
  A('cf3', 'cafe', '拉花師', '拿鐵拿到 80 分以上', ['max', 'cafe', 'latte', 80]);
  A('cf4', 'cafe', '咖啡成癮', '累計做 20 杯咖啡', ['plays', 'cafe', 20]);
  A('cf5', 'cafe', '手沖職人', '手沖拿到 90 分以上', ['max', 'cafe', 'pour', 90], 1);
  A('cf6', 'cafe', '冠軍咖啡師', '四杯平均 85 分以上', ['max', 'cafe', 'avg', 85], 1);
  A('la1', 'latte-art', '第一朵花', '完成一次拉花', ['plays', 'latte-art', 1]);
  A('la2', 'latte-art', '愛心誕生', '愛心課拿到 70 分以上', ['max', 'latte-art', 's_heart', 70]);
  A('la3', 'latte-art', '鬱金香盛開', '三層鬱金香拿到 70 分以上', ['max', 'latte-art', 's_tulip', 70]);
  A('la4', 'latte-art', '葉子飄落', '葉子課拿到 70 分以上', ['max', 'latte-art', 's_leaf', 70]);
  A('la5', 'latte-art', '熟能生巧', '完成 10 杯拉花', ['plays', 'latte-art', 10]);
  A('la6', 'latte-art', '拉花大師', '八堂課全部拿到三顆星', ['max', 'latte-art', 'totalStars', 24], 1);
  A('nm1', 'night-market', '第一晚', '完成第一個晚上的營業', ['plays', 'night-market', 1]);
  A('nm2', 'night-market', '賺錢了', '單晚淨利 $1500 以上', ['max', 'night-market', 'dayProfit', 1500]);
  A('nm3', 'night-market', '服務大眾', '累計服務 300 位客人', ['sum', 'night-market', 'served', 300]);
  A('nm4', 'night-market', '小有積蓄', '手上現金到 $20000', ['max', 'night-market', 'cash', 20000]);
  A('nm5', 'night-market', '三十天通關', '平安經營滿三十天', ['max', 'night-market', 'finished', 1], 1);
  A('nm6', 'night-market', '單晚大賺', '單晚淨利 $4000 以上', ['max', 'night-market', 'dayProfit', 4000], 1);
  A('cc1', 'chef-cards', '評審滿意', '通過第一位評審', ['max', 'chef-cards', 'round', 1]);
  A('cc2', 'chef-cards', '台北征服', '通過台北的主廚評審', ['max', 'chef-cards', 'round', 3]);
  A('cc3', 'chef-cards', '台南征服', '通過台南的主廚評審', ['max', 'chef-cards', 'round', 6]);
  A('cc4', 'chef-cards', '香港征服', '通過香港的主廚評審', ['max', 'chef-cards', 'round', 9]);
  A('cc5', 'chef-cards', '一道菜破千', '單道菜拿到 1000 分以上', ['max', 'chef-cards', 'dish', 1000]);
  A('cc6', 'chef-cards', '傳說主廚', '通過全部十二位評審', ['max', 'chef-cards', 'win', 1], 1);
  A('cc7', 'chef-cards', '一道菜破五千', '單道菜拿到 5000 分以上', ['max', 'chef-cards', 'dish', 5000], 1);
  A('ph1', 'pet-house', '帶回家', '領養一隻毛孩', ['max', 'pet-house', 'adopted', 1]);
  A('ph2', 'pet-house', '貼心照顧', '累計餵食 30 次', ['sum', 'pet-house', 'fed', 30]);
  A('ph3', 'pet-house', '學會把戲', '教會毛孩一個把戲', ['max', 'pet-house', 'tricks', 1]);
  A('ph4', 'pet-house', '陪伴一週', '一起生活滿 7 天', ['max', 'pet-house', 'days', 7]);
  A('ph5', 'pet-house', '愛上爬蟲', '養過一隻守宮', ['max', 'pet-house', 'sp_gecko', 1]);
  A('ph6', 'pet-house', '最好的朋友', '親密度到 Lv6', ['max', 'pet-house', 'bond', 6], 1);
  A('ph7', 'pet-house', '把戲大師', '教會毛孩四個把戲', ['max', 'pet-house', 'tricks', 4], 1);
  A('cn1', 'corner-cafe', '開張大吉', '經營咖啡館的第一天', ['sum', 'corner-cafe', 'days', 1]);
  A('cn2', 'corner-cafe', '第一個結局', '看到任一個結局', ['max', 'corner-cafe', 'endings', 1]);
  A('cn3', 'corner-cafe', '戀愛進行中', '走到任一個戀愛結局', ['sum', 'corner-cafe', 'love', 1]);
  A('cn4', 'corner-cafe', '結局收藏家', '解鎖 6 個結局', ['max', 'corner-cafe', 'endings', 6]);
  A('cn5', 'corner-cafe', '情定咖啡館', '四位角色的戀愛結局都看過', [['max', 'corner-cafe', 'end_love-yuan', 1], ['max', 'corner-cafe', 'end_love-qing', 1], ['max', 'corner-cafe', 'end_love-kai', 1], ['max', 'corner-cafe', 'end_love-lin', 1]], 1);
  A('cn6', 'corner-cafe', '全結局', '解鎖全部 15 個結局', ['max', 'corner-cafe', 'endings', 15], 1);
A('sf4', 'souffle', '濃郁巧克力', '巧克力口味拿到 70 分以上', ['max', 'souffle', 'choc', 70]);
  A('sf5', 'souffle', '抹茶職人', '抹茶口味拿到 80 分以上', ['max', 'souffle', 'matcha', 80], 1);
  A('sf6', 'souffle', '逆境烘焙', '遇到特殊條件，還是拿到 80 分以上', ['max', 'souffle', 'hard', 80]);
  A('sw5', 'sanwei-kitchen', '蛋炒飯上桌', '做出蛋炒飯', ['max', 'sanwei-kitchen', 'dish_friedrice', 1]);
  A('sw6', 'sanwei-kitchen', '四味俱全', '四道料理都做過', [['max', 'sanwei-kitchen', 'dish_souffle', 1], ['max', 'sanwei-kitchen', 'dish_omurice', 1], ['max', 'sanwei-kitchen', 'dish_oajian', 1], ['max', 'sanwei-kitchen', 'dish_friedrice', 1]]);
  A('sw7', 'sanwei-kitchen', '職人挑戰', '職人版任一道菜拿到 70 分以上', ['max', 'sanwei-kitchen', 'pro', 70], 1);
  A('bt6', 'bubble-tea', '貴賓接待', '單次營業服務 2 位 VIP', ['max', 'bubble-tea', 'vip', 2]);
  A('bt7', 'bubble-tea', '一次兩杯', '單次營業完成 3 張雙杯訂單', ['max', 'bubble-tea', 'multi', 3]);
  A('cf7', 'cafe', '大賽選手', '參加一次咖啡大賽', ['max', 'cafe', 'contestDone', 1]);
  A('cf8', 'cafe', '咖啡大賽冠軍', '在咖啡大賽拿到第一名', ['max', 'cafe', 'contestWin', 1], 1);
  A('la7', 'latte-art', '天鵝', '天鵝課拿到 70 分以上', ['max', 'latte-art', 's_swan', 70]);
  A('la8', 'latte-art', '玫瑰綻放', '玫瑰課拿到 70 分以上', ['max', 'latte-art', 's_rose', 70]);
  A('la9', 'latte-art', '葉心合一', '葉子加愛心拿到 70 分以上', ['max', 'latte-art', 's_leafheart', 70]);
  A('la10', 'latte-art', '客人都滿意', '客人指定平均 80 分以上', ['max', 'latte-art', 'orderAvg', 80]);
  A('la11', 'latte-art', '限時達人', '限時挑戰兩分鐘拉出 8 杯以上', ['max', 'latte-art', 'timedCups', 8], 1);
  A('nm7', 'night-market', '四種攤位', '四種攤位類型都開過', [['max', 'night-market', 'stall_fry', 1], ['max', 'night-market', 'stall_drink', 1], ['max', 'night-market', 'stall_snack', 1], ['max', 'night-market', 'stall_sweet', 1]]);
  A('nm8', 'night-market', '商場如戰場', '遇到對面開攤的競爭對手', ['max', 'night-market', 'rival', 1]);
  A('nm9', 'night-market', '無限經營', '無限模式撐到第 40 天', ['max', 'night-market', 'endlessDay', 40], 1);
  A('cc8', 'chef-cards', '挑戰階級', '通關任一難度階級', ['max', 'chef-cards', 'ascWin', 1]);
  A('cc9', 'chef-cards', '最高階級', '通關階級 3 以上', ['max', 'chef-cards', 'ascWin', 4], 1);
  A('cc10', 'chef-cards', '今日牌局', '完成一次今日固定牌局的第一位評審', ['max', 'chef-cards', 'daily', 1]);
  A('ph8', 'pet-house', '倉鼠主人', '養過一隻倉鼠', ['max', 'pet-house', 'sp_hamster', 1]);
  A('ph9', 'pet-house', '夢想莊園', '把小屋擴建到最大', ['max', 'pet-house', 'room', 3]);
  A('ph10', 'pet-house', '展覽新手', '參加一次寵物展覽', ['sum', 'pet-house', 'shows', 1]);
  A('ph11', 'pet-house', '展覽冠軍', '在寵物展覽拿到第一名', ['max', 'pet-house', 'champion', 1], 1);
  A('cn7', 'corner-cafe', '麻糬的位子', '走到亦辰的戀愛結局', ['max', 'corner-cafe', 'end_love-yichen', 1], 1);
  A('cn8', 'corner-cafe', '轉角的兩間店', '走到若蘭的戀愛結局', ['max', 'corner-cafe', 'end_love-ruolan', 1], 1);
  A('cn9', 'corner-cafe', '再玩一輪', '用繼承的成長開始新的一輪', ['max', 'corner-cafe', 'inherit', 1]);
  A('fm1', 'farm', '第一次收成', '收成第一個作物', ['sum', 'farm', 'harvest', 1]);
  A('fm2', 'farm', '菜園主人', '累計收成 50 個作物', ['sum', 'farm', 'harvest', 50]);
  A('fm3', 'farm', '擴建農田', '田地擴建到 9 塊', ['max', 'farm', 'plots', 9]);
  A('fm4', 'farm', '自動化農場', '買齊灑水器、稻草人和肥料', ['max', 'farm', 'upgrades', 3]);
  A('fm5', 'farm', '訂單達人', '累計完成 10 張村民訂單', ['sum', 'farm', 'orders', 10]);
  A('fm6', 'farm', '農場等級 5', '小菜園升到 Lv5', ['max', 'farm', 'level', 5]);
  A('fm7', 'farm', '什麼都種', '七種作物都收成過', [['max', 'farm', 'k_cabbage', 1], ['max', 'farm', 'k_radish', 1], ['max', 'farm', 'k_tomato', 1], ['max', 'farm', 'k_corn', 1], ['max', 'farm', 'k_strawberry', 1], ['max', 'farm', 'k_pumpkin', 1], ['max', 'farm', 'k_sunflower', 1]], 1);
  A('fm8', 'farm', '小富翁', '賣菜和交貨累計賺到 3000 金幣', ['sum', 'farm', 'earned', 3000]);
  A('ph12', 'pet-house', '毛孩家族', '同時養兩隻毛孩', ['max', 'pet-house', 'pets', 2]);
  A('ph13', 'pet-house', '熱鬧的家', '同時養四隻毛孩', ['max', 'pet-house', 'pets', 4], 1);
  A('cn10', 'corner-cafe', '店裡的小插曲', '遇到 10 次隨機小事件', ['sum', 'corner-cafe', 'rand', 10]);
  A('fm9', 'farm', '除草達人', '累計拔掉 20 次雜草', ['sum', 'farm', 'weeds', 20]);
  A('fm10', 'farm', '捕蟲高手', '累計抓到 10 隻蟲', ['sum', 'farm', 'pests', 10]);
  A('x8', '', '收藏家', '收藏商店買到 5 件商品', ['own', 5]);
  A('x9', '', '蒐集控', '收藏商店買到 15 件商品', ['own', 15], 1);
  A('x1', '', '全明星', '十款遊戲都玩過', ['gamesPlayed', 10]);
  A('x2', '', '三天連續', '連續三天都有玩', ['streak', 3]);
  A('x3', '', '每日全勤', '一天完成三個每日挑戰', ['questAll', 1]);
  A('x4', '', '成就獵人', '解鎖 15 個成就', ['count', 15]);
  A('x5', '', '一週連續', '連續七天都有玩', ['streak', 7], 1);
  A('x6', '', '挑戰達人', '七天完成全部三個每日挑戰', ['questAll', 7], 1);
  A('x7', '', '成就大師', '解鎖 60 個成就', ['count', 60], 1);

  /* ================= 每日挑戰清單 ================= */
  /* type: 'max' 單次達到、'sum' 今天累計。每天依日期從裡面抽 3 個不同遊戲的，全世界同一天抽到一樣的 */
  var QUESTS = [
    { id: 'q-sf', game: 'souffle', metric: 'score', type: 'max', target: 70, text: '「舒芙蕾」遊戲做到 70 分以上' },
    { id: 'q-sw', game: 'sanwei-kitchen', metric: 'score', type: 'max', target: 70, text: '三味廚房任一道菜 70 分以上' },
    { id: 'q-bt', game: 'bubble-tea', metric: 'money', type: 'max', target: 300, text: '搖搖茶舖單次營業額 $300' },
    { id: 'q-bt2', game: 'bubble-tea', metric: 'perfect', type: 'max', target: 6, text: '搖搖茶舖做出 6 杯完美飲料' },
    { id: 'q-cf', game: 'cafe', metric: 'cup', type: 'max', target: 75, text: '一杯好咖啡做出 75 分以上的一杯' },
    { id: 'q-la', game: 'latte-art', metric: 'score', type: 'max', target: 70, text: '拉一杯花拿到 70 分以上' },
    { id: 'q-nm', game: 'night-market', metric: 'dayProfit', type: 'max', target: 500, text: '夜市人生單晚淨利 $500' },
    { id: 'q-nm2', game: 'night-market', metric: 'served', type: 'sum', target: 25, text: '夜市人生今天服務 25 位客人' },
    { id: 'q-cc', game: 'chef-cards', metric: 'judge', type: 'sum', target: 2, text: '主廚牌局今天通過 2 位評審' },
    { id: 'q-ph', game: 'pet-house', metric: 'fed', type: 'sum', target: 3, text: '毛孩小屋餵毛孩 3 次' },
    { id: 'q-ph2', game: 'pet-house', metric: 'played', type: 'sum', target: 1, text: '毛孩小屋陪毛孩玩一次' },
    { id: 'q-cn', game: 'corner-cafe', metric: 'days', type: 'sum', target: 1, text: '巷口咖啡館經營一天' },
    { id: 'q-fm', game: 'farm', metric: 'harvest', type: 'sum', target: 6, text: '小菜園收成 6 個作物' },
    { id: 'q-fm2', game: 'farm', metric: 'orders', type: 'sum', target: 1, text: '小菜園完成一張村民訂單' },
    { id: 'q-la2', game: 'latte-art', metric: 'orderAvg', type: 'max', target: 70, text: '拉一杯花的「客人指定」平均 70 分以上' }
  ];
  var QXP = 30, QBONUS = 60;



  /* ================= 音效 ================= */
  /* 全部遊戲共用一個開關（存在這台裝置上）。音效都是即時合成，不用另外下載檔案。 */
  var SKEY = 'gc:sound';
  function soundOn() { try { return localStorage.getItem(SKEY) !== '0'; } catch (e) { return true; } }
  var AC = null;
  function ac() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { AC = new C(); } catch (e) { return null; } }
    if (AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    if (!MG) { MG = AC.createGain(); MG.gain.value = vol(); MG.connect(AC.destination); }
    return AC;
  }
  var MG = null;
  function vol() { var v = parseFloat(setting('vol', '0.8')); return isNaN(v) ? 0.8 : Math.max(0, Math.min(1, v)); }
  function out() { ac(); return MG; }
  function tone(f, d, type, vol, delay, f2) {
    var a = ac(); if (!a) return; var t = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(out()); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d, vol, freq, delay) {
    var a = ac(); if (!a) return; var t = a.currentTime + (delay || 0);
    var n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), ch = b.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = a.createBufferSource(); src.buffer = b; var fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = freq || 1200; fl.Q.value = 0.8;
    var g = a.createGain(); g.gain.value = vol || 0.08; src.connect(fl); fl.connect(g); g.connect(out()); src.start(t);
  }
  var SFX = {
    tap: function () { tone(620, 0.035, 'triangle', 0.03); },
    pop: function () { tone(520, 0.07, 'sine', 0.08, 0, 900); },
    good: function () { tone(660, 0.08, 'triangle', 0.07); tone(880, 0.11, 'triangle', 0.07, 0.07); },
    great: function () { [660, 880, 1175].forEach(function (f, i) { tone(f, 0.11, 'triangle', 0.07, i * 0.07); }); },
    bad: function () { tone(330, 0.12, 'sawtooth', 0.035); tone(247, 0.16, 'sawtooth', 0.035, 0.1); },
    coin: function () { tone(988, 0.06, 'square', 0.025); tone(1319, 0.12, 'square', 0.025, 0.06); },
    whoosh: function () { noise(0.22, 0.09, 1600); },
    pour: function () { noise(0.35, 0.05, 700); },
    drip: function () { tone(1200, 0.06, 'sine', 0.05, 0, 600); },
    ding: function () { tone(1568, 0.5, 'sine', 0.06); tone(2093, 0.4, 'sine', 0.03, 0.02); },
    purr: function () { tone(110, 0.25, 'sine', 0.05, 0, 95); },
    fanfare: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.14, 'triangle', 0.07, i * 0.1); }); },
    level: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.1, 'square', 0.03, i * 0.06); }); },
    crack: function () { noise(0.05, 0.16, 3000); tone(180, 0.06, 'square', 0.03, 0.01, 90); },
    splash: function () { noise(0.3, 0.1, 900); tone(300, 0.15, 'sine', 0.04, 0, 120); },
    plop: function () { tone(260, 0.09, 'sine', 0.09, 0, 520); },
    bubble: function () { tone(400 + Math.random() * 300, 0.06, 'sine', 0.05, 0, 900); },
    clink: function () { tone(2400, 0.12, 'sine', 0.04); tone(3100, 0.1, 'sine', 0.03, 0.03); },
    sprinkle: function () { for (var i = 0; i < 4; i++) noise(0.03, 0.05, 5000 + i * 600, i * 0.03); },
    sparkle: function () { [1568, 1976, 2349].forEach(function (f, i) { tone(f, 0.12, 'sine', 0.035, i * 0.05); }); },
    bell: function () { tone(1318, 0.35, 'sine', 0.06); tone(1760, 0.3, 'sine', 0.035, 0.05); },
    seal: function () { tone(500, 0.06, 'square', 0.03, 0, 250); noise(0.15, 0.06, 2500, 0.04); },
    swish: function () { noise(0.14, 0.06, 2200); },
    tick: function () { tone(1400, 0.02, 'square', 0.02); },
    flip: function () { noise(0.05, 0.08, 3500); },
    shuffle: function () { for (var i = 0; i < 5; i++) noise(0.04, 0.05, 3000, i * 0.04); },
    boing: function () { tone(220, 0.18, 'sine', 0.07, 0, 660); },
    thud: function () { tone(120, 0.1, 'sine', 0.09, 0, 60); noise(0.06, 0.05, 400); },
    grow: function () { tone(440, 0.18, 'sine', 0.04, 0, 880); },
    alarm: function () { tone(880, 0.12, 'square', 0.03); tone(660, 0.12, 'square', 0.03, 0.14); tone(880, 0.12, 'square', 0.03, 0.28); },
    blip: function () { tone(760 + Math.random() * 120, 0.025, 'triangle', 0.018); },
    door: function () { tone(1046, 0.25, 'sine', 0.05); tone(1318, 0.3, 'sine', 0.04, 0.12); },
    zzz: function () { tone(220, 0.4, 'sine', 0.03, 0, 180); },
    munch: function () { for (var i = 0; i < 3; i++) noise(0.05, 0.07, 900, i * 0.11); },
    meow: function () { tone(700, 0.28, 'sawtooth', 0.025, 0, 480); tone(520, 0.2, 'sine', 0.03, 0.12, 760); },
    bark: function () { tone(260, 0.09, 'sawtooth', 0.05, 0, 180); noise(0.08, 0.05, 700); tone(240, 0.09, 'sawtooth', 0.045, 0.16, 170); },
    squeak: function () { tone(1800, 0.06, 'sine', 0.04, 0, 2600); tone(2000, 0.05, 'sine', 0.035, 0.08, 2800); },
    chirp: function () { tone(1200, 0.07, 'sine', 0.035, 0, 1700); },
    gong: function () { tone(196, 1.0, 'sine', 0.06); tone(392, 0.8, 'sine', 0.025); },
    heart: function () { tone(880, 0.07, 'sine', 0.04); tone(1175, 0.09, 'sine', 0.04, 0.06); },
    cash: function () { tone(1568, 0.05, 'square', 0.025); tone(2093, 0.18, 'square', 0.025, 0.05); noise(0.05, 0.04, 6000, 0.02); }
  };
  /* 持續音：按住倒茶、煮珍珠、磨豆、蒸奶、烤箱、油鍋等，開始時 GC.loop(名稱, true)、結束時 GC.loop(名稱, false)。
     每種持續音由「底噪」加上隨機的小顆粒聲（水滴、氣泡、劈啪聲）組成，聽起來比較像真的。
     GC.loopParam(名稱, {...}) 可以即時改變聲音，例如打奶泡時依噴嘴位置切換 zone: 'roll' | 'stretch' | 'air'。 */
  var LDEF = {
    pour: { f: 900, q: 0.8, v: 0.045, g: { t: 'drop', p: 0.18 } },
    stream: { f: 1400, q: 0.7, v: 0.03, g: { t: 'drop', p: 0.12 } },
    boil: { f: 260, q: 1.2, v: 0.035, tr: 5, g: { t: 'bubble', p: 0.4 } },
    sizzle: { f: 4200, q: 0.4, v: 0.025, tr: 9, g: { t: 'crackle', p: 0.55 } },
    steam: { custom: 'steam' },
    grind: { f: 520, q: 2, v: 0.045, tr: 14, g: { t: 'crunch', p: 0.7 } },
    hiss: { f: 1700, q: 0.7, v: 0.035, g: { t: 'drop', p: 0.05 } },
    scrub: { f: 2000, q: 1, v: 0.035, tr: 8, g: { t: 'crackle', p: 0.15 } },
    stir: { f: 700, q: 1.4, v: 0.03, tr: 3, g: { t: 'scrape', p: 0.18 } },
    oven: { f: 160, q: 3, v: 0.05, tr: 0.7, g: { t: 'tick', p: 0.02 } },
    rain: { f: 1200, q: 0.4, v: 0.022, g: { t: 'drop', p: 0.35 } },
    crowd: { f: 450, q: 0.6, v: 0.02, tr: 0.4, g: { t: 'murmur', p: 0.04 } }
  };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function grain(t, k) {
    k = k || 1;
    if (t === 'drop') tone(rnd(900, 1700), rnd(0.03, 0.06), 'sine', 0.025 * k, 0, rnd(300, 600));
    else if (t === 'bubble') tone(rnd(160, 420), rnd(0.04, 0.08), 'sine', 0.045 * k, 0, rnd(500, 900));
    else if (t === 'crackle') noise(rnd(0.006, 0.016), 0.06 * k, rnd(3500, 7000));
    else if (t === 'crunch') noise(rnd(0.012, 0.03), 0.05 * k, rnd(900, 2200));
    else if (t === 'scrape') noise(rnd(0.05, 0.1), 0.025 * k, rnd(500, 900));
    else if (t === 'tick') tone(rnd(1800, 2200), 0.015, 'square', 0.008 * k);
    else if (t === 'murmur') tone(rnd(180, 320), rnd(0.12, 0.25), 'triangle', 0.012 * k, 0, rnd(160, 300));
    else if (t === 'chirp') noise(rnd(0.008, 0.02), 0.07 * k, rnd(4500, 8000));
    else if (t === 'sputter') { noise(rnd(0.03, 0.07), 0.08 * k, rnd(500, 1100)); if (Math.random() < 0.5) tone(rnd(250, 500), 0.05, 'sine', 0.05 * k, 0, rnd(700, 1100)); }
    else if (t === 'gurgle') tone(rnd(110, 220), rnd(0.06, 0.12), 'sine', 0.03 * k, 0, rnd(160, 280));
  }
  var LOOPS = {}, NBUF = null;
  function nbuf(a) { if (!NBUF) { var n = a.sampleRate * 2; NBUF = a.createBuffer(1, n, a.sampleRate); var ch = NBUF.getChannelData(0); for (var i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1; } return NBUF; }
  function layer(a, type, f, q) { var src = a.createBufferSource(); src.buffer = nbuf(a); src.loop = true; src.loopStart = Math.random(); var fl = a.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; var g = a.createGain(); g.gain.value = 0.0001; src.connect(fl); fl.connect(g); g.connect(out()); src.start(); return { src: src, fl: fl, g: g }; }
  var STEAM = { roll: { hf: 2200, hv: 0.022, rv: 0.05, gt: 'gurgle', gp: 0.12 }, stretch: { hf: 4200, hv: 0.04, rv: 0.02, gt: 'chirp', gp: 0.75 }, air: { hf: 1400, hv: 0.05, rv: 0.025, gt: 'sputter', gp: 0.45 } };
  function setSteam(L, zone, temp) {
    var a = ac(), z = STEAM[zone] || STEAM.roll, warm = Math.max(0, Math.min(1, ((temp || 20) - 20) / 50));
    L.layers[0].fl.frequency.setTargetAtTime(z.hf * (1 - warm * 0.25), a.currentTime, 0.08);
    L.layers[0].g.gain.setTargetAtTime(z.hv, a.currentTime, 0.08);
    L.layers[1].g.gain.setTargetAtTime(z.rv * (0.7 + warm * 0.6), a.currentTime, 0.12);
    L.gt = z.gt; L.gp = z.gp;
  }
  function loop(id, on) {
    var L = LOOPS[id];
    if (!on || !soundOn()) {
      if (L) { try { var a0 = ac(); L.layers.forEach(function (ly) { ly.g.gain.setTargetAtTime(0.0001, a0.currentTime, 0.05); ly.src.stop(a0.currentTime + 0.3); if (ly.lfo) ly.lfo.stop(a0.currentTime + 0.3); }); } catch (e) {} if (L.timer) clearInterval(L.timer); delete LOOPS[id]; }
      return;
    }
    if (L || !LDEF[id]) return;
    var a = ac(); if (!a) return; var d = LDEF[id];
    L = { layers: [], gt: null, gp: 0 };
    if (d.custom === 'steam') {
      L.layers.push(layer(a, 'bandpass', 2200, 0.5)); L.layers.push(layer(a, 'lowpass', 320, 0.7)); setSteam(L, 'roll', 20);
    } else {
      var ly = layer(a, 'bandpass', d.f, d.q); ly.g.gain.setTargetAtTime(d.v, a.currentTime, 0.06);
      if (d.tr) { var lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = d.tr; lg.gain.value = d.v * 0.45; lfo.connect(lg); lg.connect(ly.g.gain); lfo.start(); ly.lfo = lfo; }
      L.layers.push(ly); if (d.g) { L.gt = d.g.t; L.gp = d.g.p; }
    }
    L.timer = setInterval(function () { if (!LOOPS[id] || !L.gt) return; if (Math.random() < L.gp) grain(L.gt); }, 30);
    LOOPS[id] = L;
  }
  function loopParam(id, o) {
    var L = LOOPS[id]; if (!L || !o) return;
    if (id === 'steam') { if (o.zone !== L.zone || Math.abs((o.temp || 0) - (L.temp || 0)) > 3) { L.zone = o.zone; L.temp = o.temp; setSteam(L, o.zone, o.temp); } }
    else { if (o.gp != null) L.gp = o.gp; if (o.gt) L.gt = o.gt; }
  }
  function stopLoops() { for (var k in LOOPS) loop(k, false); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopLoops(); });

  /* ================= 背景音樂 ================= */
  /* 歌放在根目錄的 audio 資料夾。先用 fetch 抓成 blob 再播（離線也能播，iPhone 的 Service Worker 也不會擋）。
     同一個 audio 元素一直換歌，第一次點畫面時才開始播（瀏覽器規定）。音量走和音效同一個總音量，再乘上 MUS_LEVEL。 */
  var MUS_FILES = { 'latte-art': 'audio/bgm-latte-art.mp3', 'cafe': 'audio/bgm-cafe.mp3', 'cafe-contest': 'audio/bgm-cafe-contest.mp3', 'night-market': 'audio/bgm-night-market.mp3' };
  var MUS_LEVEL = 0.4;
  var MU = { el: null, want: null, cur: null, blobs: {}, loading: {}, paused: false, gain: null };
  var MBASE = (function () { try { return new URL(src, location.href).href.replace(/[^\/]*$/, ''); } catch (e) { return ''; } })();
  var SIL = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
  /* 在首頁的遊戲框（iframe）裡開的遊戲：音樂交給首頁播，這樣點卡片那一下就能讓音樂一進遊戲就響 */
  var HOST = null; try { if (window.parent !== window && window.parent.GC && window.parent.GC.openGame) HOST = window.parent.GC; } catch (e) { HOST = null; }
  function musicOn() { return setting('music', '1') !== '0'; }
  function musLoad(id) {
    if (!MUS_FILES[id] || MU.blobs[id] || MU.loading[id]) return;
    MU.loading[id] = true;
    try {
      fetch(MBASE + MUS_FILES[id]).then(function (r) { if (!r.ok) throw new Error('audio ' + r.status); return r.blob(); })
        .then(function (b) { MU.blobs[id] = URL.createObjectURL(b); })
        .catch(function () {})
        .then(function () { delete MU.loading[id]; musApply(); });
    } catch (e) { delete MU.loading[id]; }
  }
  function musApply() {
    if (HOST) { try { HOST.__pause(MU.paused); } catch (e) {} return; }
    var el = MU.el; if (!el) return;
    var go = MU.want && musicOn() && !MU.paused && !document.hidden && MU.blobs[MU.want];
    if (!go) { var waiting = MU.want && musicOn() && !MU.paused && !document.hidden && !MU.blobs[MU.want]; if (!el.paused && !waiting) { try { el.pause(); } catch (e) {} } return; }
    if (MU.cur !== MU.want) { el.src = MU.blobs[MU.want]; MU.cur = MU.want; try { el.currentTime = 0; } catch (e) {} }
    if (el.paused) { try { var p = el.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  }
  function musKick() {
    if (!MU.el) {
      var el = new Audio(); el.loop = true; el.preload = 'auto'; MU.el = el;
      var a = ac();
      try { var s = a.createMediaElementSource(el); MU.gain = a.createGain(); MU.gain.gain.value = MUS_LEVEL; s.connect(MU.gain); MU.gain.connect(MG); }
      catch (e) { el.volume = MUS_LEVEL; }
      if (!(MU.want && MU.blobs[MU.want])) { try { el.src = SIL; MU.cur = '__sil'; var sp0 = el.play(); if (sp0 && sp0.catch) sp0.catch(function () {}); } catch (e) {} }
    } else ac();
    musApply();
  }
  ['pointerdown', 'touchstart', 'mousedown', 'click', 'touchend', 'keydown'].forEach(function (t) { document.addEventListener(t, function () { if (HOST) { try { HOST.__kick(); } catch (e) {} return; } if (MU.want && musicOn() && (!MU.el || MU.el.paused || (AC && AC.state !== 'running'))) musKick(); }, true); });
  document.addEventListener('visibilitychange', function () { musApply(); });
  /* 換頁（返回、進入別的頁面、重新整理）時先切斷音樂；從上一頁快取回來時再接著播 */
  function musCut() { if (HOST) return; MU.last = MU.want || MU.last; MU.want = null; try { if (MU.el) MU.el.pause(); } catch (e) {} }
  document.addEventListener('click', function (e) { var a = e.target && e.target.closest && e.target.closest('a[href]'); if (HOST && a && /(^|\/)index\.html$/.test(a.getAttribute('href') || '')) { e.preventDefault(); try { HOST.__close(); } catch (x) {} return; } if (a && !/^#|^javascript:/i.test(a.getAttribute('href') || '') && a.target !== '_blank') musCut(); }, true);
  window.addEventListener('pagehide', musCut);
  window.addEventListener('pageshow', function (e) { if (e.persisted && MU.last) { MU.want = MU.last; musApply(); } });
  function bgm(id) { if (HOST) { try { HOST.__bgm(id); } catch (e) {} return; } MU.want = id && MUS_FILES[id] ? id : null; if (MU.want) { musLoad(MU.want); if (!MU.el && musicOn()) { try { musKick(); } catch (e) {} } else musApply(); } else musApply(); }
  function bgmPreload(id) { if (HOST) { try { HOST.__preload(id); } catch (e) {} return; } musLoad(id); }
  /* 首頁：音樂遊戲用全螢幕框開啟（點卡片的手勢可以直接啟動音樂） */
  var FRAME_RE = /^games\/(latte-art|cafe|night-market)\.html(\?.*)?$/, framed = false;
  function gameClose() {
    var f = document.getElementById('gc-game'); if (!f) return;
    if (history.state && history.state.gcGame) { history.back(); return; }
    gameCleanup();
  }
  function gameCleanup() {
    var f = document.getElementById('gc-game'); if (f) f.remove();
    MU.want = null; MU.last = null; MU.paused = false; try { if (MU.el) MU.el.pause(); } catch (e) {}
    window.removeEventListener('popstate', gameCleanup); framed = false;
    try { location.reload(); } catch (e) {}
  }
  function openGame(file) {
    if (framed) return; framed = true;
    var m = /games\/([\w-]+)\.html/.exec(file), id = m && m[1];
    if (id && MUS_FILES[id]) { MU.want = id; musLoad(id); if (musicOn()) { try { musKick(); } catch (e) {} } }
    var f = document.createElement('iframe'); f.id = 'gc-game'; f.setAttribute('allow', 'autoplay; fullscreen'); f.setAttribute('title', '遊戲');
    f.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;border:0;z-index:99998;background:#fff';
    f.src = file; document.body.appendChild(f);
    try { history.pushState({ gcGame: 1 }, ''); window.addEventListener('popstate', gameCleanup); } catch (e) {}
  }
  if (!/\/games\//.test(location.pathname)) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href') || ''; if (!FRAME_RE.test(h)) return;
      e.preventDefault(); openGame(h);
    }, true);
  }
  var lastS = {};
  function sfx(n) { if (!soundOn()) return; var now = Date.now(); if (lastS[n] && now - lastS[n] < 45) return; lastS[n] = now; try { SFX[n] && SFX[n](); } catch (e) {} }
  document.addEventListener('pointerdown', function () { if (soundOn()) ac(); }, true);

  /* ================= 收藏品與限時活動 ================= */
  /* slot: glaze 杯緣色、petacc 毛孩配件、farmdeco 農場裝飾、title 稱號。theme 有值的是限時商品，只在活動期間可以買 */
  var COLL = [
    { id: 'glaze_rose', slot: 'glaze', n: '玫瑰粉杯緣', price: 60, val: '#D9607F' },
    { id: 'glaze_mint', slot: 'glaze', n: '薄荷綠杯緣', price: 60, val: '#2FA58A' },
    { id: 'glaze_black', slot: 'glaze', n: '墨黑杯緣', price: 80, val: '#2B2B33' },
    { id: 'glaze_gold', slot: 'glaze', n: '金邊杯緣', price: 120, val: '#D4A017' },
    { id: 'glaze_fire', slot: 'glaze', n: '煙火紅杯緣', price: 90, val: '#E4572E', theme: 'newyear' },
    { id: 'glaze_sakura', slot: 'glaze', n: '櫻花粉杯緣', price: 90, val: '#F29CB7', theme: 'sakura' },
    { id: 'glaze_ice', slot: 'glaze', n: '冰藍杯緣', price: 90, val: '#59C3EA', theme: 'summer' },
    { id: 'pet_crown', slot: 'petacc', n: '小王冠', price: 120, d: '毛孩小屋的配件' },
    { id: 'pet_wreath', slot: 'petacc', n: '花環', price: 90, d: '毛孩小屋的配件' },
    { id: 'pet_witch', slot: 'petacc', n: '魔女帽', price: 100, d: '毛孩小屋的配件', theme: 'halloween' },
    { id: 'pet_santa', slot: 'petacc', n: '聖誕帽', price: 100, d: '毛孩小屋的配件', theme: 'xmas' },
    { id: 'pet_redhat', slot: 'petacc', n: '福氣帽', price: 100, d: '毛孩小屋的配件', theme: 'cny' },
    { id: 'farm_windmill', slot: 'farmdeco', n: '風車', price: 150, d: '小菜園的裝飾' },
    { id: 'farm_pond', slot: 'farmdeco', n: '水景', price: 150, d: '小菜園的裝飾（田邊的小水塘造景，不能釣魚）' },
    { id: 'farm_flowers', slot: 'farmdeco', n: '花圃', price: 100, d: '小菜園的裝飾' },
    { id: 'farm_pumpkin', slot: 'farmdeco', n: '南瓜燈', price: 80, d: '小菜園的裝飾', theme: 'halloween' },
    { id: 'farm_tree', slot: 'farmdeco', n: '聖誕樹', price: 100, d: '小菜園的裝飾', theme: 'xmas' },
    { id: 'farm_sakura', slot: 'farmdeco', n: '櫻花樹', price: 100, d: '小菜園的裝飾', theme: 'sakura' },
    { id: 'farm_lantern', slot: 'farmdeco', n: '紅燈籠', price: 100, d: '小菜園的裝飾', theme: 'cny' },
    { id: 'farm_moon', slot: 'farmdeco', n: '中秋月亮', price: 100, d: '小菜園的裝飾', theme: 'midautumn' },
    { id: 'title_chef', slot: 'title', n: '料理小達人', price: 60 },
    { id: 'title_farmer', slot: 'title', n: '菜園主人', price: 60 },
    { id: 'title_barista', slot: 'title', n: '拉花職人', price: 60 },
    { id: 'title_ghost', slot: 'title', n: '萬聖夜遊者', price: 70, theme: 'halloween' },
    { id: 'title_xmas', slot: 'title', n: '聖誕小幫手', price: 70, theme: 'xmas' },
    { id: 'title_newyear', slot: 'title', n: '跨年倒數王', price: 70, theme: 'newyear' },
    { id: 'title_summer', slot: 'title', n: '夏日冰飲王', price: 70, theme: 'summer' },
    { id: 'title_cny', slot: 'title', n: '團圓大廚', price: 70, theme: 'cny' },
    { id: 'title_moon', slot: 'title', n: '賞月達人', price: 70, theme: 'midautumn' }
  ];
  /* 限時活動：m 是每年固定的 [開始月, 開始日, 結束月, 結束日]；abs 是只有某一年的日期（農曆節日）。
     活動期間：所有獲得的幣 ×1.5；累計完成 10 局、25 局可領獎勵；限時商品可以購買。 */
  var THEMES = [
    { id: 'halloween', n: '萬聖夜祭', m: [10, 24, 11, 1], d: '南瓜、魔女和糖果的夜晚。小菜園的南瓜賣得更貴。', farm: { pumpkin: 1.5 } },
    { id: 'xmas', n: '聖誕市集', m: [12, 18, 12, 28], d: '冬天的市集亮起來了。小菜園的草莓賣得更貴。', farm: { strawberry: 1.4 } },
    { id: 'newyear', n: '跨年煙火', m: [12, 29, 1, 3], d: '倒數完，新的一年開始。' },
    { id: 'cny', n: '春節團圓', abs: ['2027-02-03', '2027-02-14'], d: '紅燈籠掛起來，大家回家團圓。小菜園的玉米賣得更貴。', farm: { corn: 1.4 } },
    { id: 'sakura', n: '櫻花祭', m: [3, 20, 3, 31], d: '花瓣飄進咖啡杯裡。' },
    { id: 'summer', n: '夏日冰飲祭', m: [7, 15, 8, 15], d: '冰涼的飲料最受歡迎。' },
    { id: 'midautumn', n: '中秋賞月', abs: ['2027-09-10', '2027-09-18'], d: '月亮很圓，適合在菜園賞月。' }
  ];
  function themeSpan(t, y) { if (t.abs) return [t.abs[0], t.abs[1]]; var a = y + '-' + ('0' + t.m[0]).slice(-2) + '-' + ('0' + t.m[1]).slice(-2), ey = t.m[2] < t.m[0] ? y + 1 : y, b = ey + '-' + ('0' + t.m[2]).slice(-2) + '-' + ('0' + t.m[3]).slice(-2); return [a, b]; }
  function activeTheme() {
    var now = new Date(), t0 = today();
    for (var i = 0; i < THEMES.length; i++) { var t = THEMES[i]; var ys = t.abs ? [0] : [now.getFullYear() - 1, now.getFullYear()]; for (var j = 0; j < ys.length; j++) { var sp = themeSpan(t, ys[j]); if (t0 >= sp[0] && t0 <= sp[1]) return { t: t, from: sp[0], to: sp[1] }; } }
    return null;
  }
  function collDef(id) { for (var i = 0; i < COLL.length; i++) if (COLL[i].id === id) return COLL[i]; return null; }
  var TH_MS = [[10, 60], [25, 120]];

  /* ================= 等級 ================= */
  var TITLES = [[1, '新手店員'], [2, '見習廚師'], [3, '小店老闆'], [4, '街頭人氣王'], [5, '人氣主廚'], [6, '美食達人'], [8, '名店店長'], [10, '傳說店長']];
  function levelOf(xp) { return 1 + Math.floor(Math.sqrt(xp / 40)); }
  function xpAt(l) { return 40 * (l - 1) * (l - 1); }
  function titleOf(l) { var t = TITLES[0][1]; for (var i = 0; i < TITLES.length; i++) if (l >= TITLES[i][0]) t = TITLES[i][1]; return t; }

  /* ================= 進度資料 ================= */
  function dstr(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function today() { return dstr(new Date()); }
  function yesterday() { var d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); }
  function rng(seedStr) { var h = 1779033703 ^ seedStr.length; for (var i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  function pickQuests(day) {
    var r = rng('gc-' + day), pool = QUESTS.slice(), out = [], used = {};
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    for (var k = 0; k < pool.length && out.length < 3; k++) { if (!used[pool[k].game]) { used[pool[k].game] = 1; out.push(pool[k]); } }
    return out;
  }
  function blank() { return { v: 1, s: {}, ach: {}, xp: 0, last: '', streak: 0, qday: '', q: [], qall: 0, wallet: 0, own: {}, eq: {}, th: null, dc: { day: '', n: 0 } }; }
  function load() {
    var p; try { p = JSON.parse(lsGet('__prog') || 'null'); } catch (e) { p = null; }
    if (!p || p.v !== 1) p = blank();
    p.s = p.s || {}; p.ach = p.ach || {}; p.q = p.q || [];
    p.wallet = p.wallet || 0; p.own = p.own || {}; p.eq = p.eq || {}; p.dc = p.dc || { day: '', n: 0 }; p.pan = p.pan || {};
    return p;
  }
  function save(p) { lsSet('__prog', JSON.stringify(p)); }
  /* 共用倉庫：各遊戲做出來的東西放這裡，其他遊戲可以拿去用 */
  var PANTRY = {
    pickle: { n: '醃蘿蔔', from: 'farm' },
    ketchup: { n: '番茄醬', from: 'farm' },
    jam: { n: '草莓果醬', from: 'farm' },
    egg: { n: '雞蛋', from: 'farm' },
    fish: { n: '吳郭魚', from: 'farm' },
    milkfish: { n: '虱目魚', from: 'farm' }
  };
  function ensureQuests(p) {
    var t = today();
    if (p.qday !== t) { p.qday = t; p.q = pickQuests(t).map(function (d) { return { id: d.id, pr: 0, done: false }; }); }
  }
  function touchDay(p) {
    var t = today();
    if (p.last === t) return;
    p.streak = (p.last === yesterday()) ? (p.streak || 0) + 1 : 1;
    p.last = t;
  }
  function gs(p, g) { return p.s[g] || (p.s[g] = { plays: 0, max: {}, sum: {} }); }
  function questDef(id) { for (var j = 0; j < QUESTS.length; j++) if (QUESTS[j].id === id) return QUESTS[j]; return null; }

  function checkOne(p, c) {
    if (Array.isArray(c[0])) { for (var i = 0; i < c.length; i++) if (!checkOne(p, c[i])) return false; return true; }
    var t = c[0], g, s;
    if (t === 'max') { s = p.s[c[1]]; return !!s && (s.max[c[2]] || 0) >= c[3]; }
    if (t === 'sum') { s = p.s[c[1]]; return !!s && (s.sum[c[2]] || 0) >= c[3]; }
    if (t === 'plays') { s = p.s[c[1]]; return !!s && (s.plays || 0) >= c[2]; }
    if (t === 'gamesPlayed') { var n = 0; for (g in p.s) { var x = p.s[g]; if ((x.plays || 0) > 0 || Object.keys(x.max).length || Object.keys(x.sum).length) n++; } return n >= c[1]; }
    if (t === 'streak') return (p.streak || 0) >= c[1];
    if (t === 'questAll') return (p.qall || 0) >= c[1];
    if (t === 'count') return Object.keys(p.ach).length >= c[1];
    if (t === 'own') return Object.keys(p.own || {}).length >= c[1];
    return false;
  }

  /* ================= 通知 ================= */
  var queue = [], showing = false, bannerEl = null;
  function ensureBanner() {
    if (bannerEl || !document.body) return;
    var st = document.createElement('style');
    st.textContent = '#gc-note{position:fixed;left:50%;top:var(--gc-note-top,calc(env(safe-area-inset-top,0px) + 44px));bottom:var(--gc-note-bottom,auto);transform:translate(-50%,-8px);opacity:0;z-index:2147483001;max-width:92vw;pointer-events:none;transition:opacity .2s,transform .2s;' +
      'background:#1F2A37;color:#FFF;border:2px solid #F2C14E;border-radius:14px;padding:9px 14px;font:700 14px/1.45 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.3)}' +
      '#gc-note.on{opacity:1;transform:translate(-50%,0)}#gc-note small{display:block;font-weight:500;opacity:.8}#gc-note b{color:#F2C14E}' +
      '@media (prefers-reduced-motion:reduce){#gc-note{transition:none}}';
    document.head.appendChild(st);
    bannerEl = document.createElement('div'); bannerEl.id = 'gc-note'; bannerEl.setAttribute('role', 'status'); bannerEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(bannerEl);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function notify(html) { queue.push(html); pump(); }
  function pump() {
    if (showing || !queue.length) return;
    if (!document.body) { document.addEventListener('DOMContentLoaded', pump); return; }
    ensureBanner(); showing = true;
    bannerEl.innerHTML = queue.shift(); bannerEl.classList.add('on');
    setTimeout(function () { bannerEl.classList.remove('on'); setTimeout(function () { showing = false; pump(); }, 260); }, 2800);
  }

  /* ================= 對外函式 ================= */
  function earn(p, n) {
    var th = activeTheme(); if (th) n = Math.round(n * 1.5);
    p.wallet = (p.wallet || 0) + n; return n;
  }
  function addXp(p, n, lines) {
    var before = levelOf(p.xp); p.xp += n; var after = levelOf(p.xp);
    if (after > before) lines.push('<b>升級！</b> Lv' + after + ' ' + esc(titleOf(after)));
  }
  function evalAchs(p, lines) {
    var again = true, guard = 0;
    while (again && guard++ < 4) {
      again = false;
      for (var i = 0; i < ACH.length; i++) {
        var a = ACH[i];
        if (p.ach[a.id]) continue;
        if (checkOne(p, a.c)) { p.ach[a.id] = Date.now(); addXp(p, a.xp, lines); var cn = earn(p, a.hard ? 30 : 10); lines.push('<b>成就解鎖</b>：' + esc(a.name) + '<small>' + esc(a.desc) + '　+' + a.xp + ' XP　+' + cn + ' 幣</small>'); again = true; }
      }
    }
  }
  function applyQuests(p, game, metrics, useMax, useSum, lines) {
    ensureQuests(p);
    for (var i = 0; i < p.q.length; i++) {
      var q = p.q[i]; if (q.done) continue;
      var d = questDef(q.id);
      if (!d || d.game !== game) continue;
      var v = metrics[d.metric]; if (typeof v !== 'number') continue;
      if (d.type === 'max') { if (!useMax) continue; q.pr = Math.max(q.pr, v); }
      else { if (!useSum) continue; q.pr += v; }
      if (q.pr >= d.target) {
        q.done = true; addXp(p, QXP, lines);
        var qc = earn(p, 15); lines.push('<b>每日挑戰完成</b>：' + esc(d.text) + '<small>+' + QXP + ' XP　+' + qc + ' 幣</small>');
        var all = true; for (var k = 0; k < p.q.length; k++) if (!p.q[k].done) all = false;
        if (all) { p.qall = (p.qall || 0) + 1; addXp(p, QBONUS, lines); var bc = earn(p, 30); lines.push('<b>今日三個挑戰全部完成！</b><small>額外 +' + QBONUS + ' XP　+' + bc + ' 幣</small>'); }
      }
    }
  }
  function record(game, metrics, mode) {
    try {
      if (!game || !metrics) return;
      var p = load(), lines = [];
      touchDay(p); ensureQuests(p);
      var s = gs(p, game), k;
      s.last = Date.now();
      if (mode === 'report') {
        s.plays = (s.plays || 0) + 1;
        var tday = today(); if (p.dc.day !== tday) p.dc = { day: tday, n: 0 };
        if (p.dc.n < 15) { var tc = Math.min(1, 15 - p.dc.n); p.dc.n += tc; earn(p, tc); }
        var at = activeTheme(); if (at) { if (!p.th || p.th.id !== at.t.id || p.th.from !== at.from) p.th = { id: at.t.id, from: at.from, plays: 0, claimed: {} }; p.th.plays++; }
      }
      for (k in metrics) {
        var v = metrics[k]; if (typeof v !== 'number' || isNaN(v)) continue;
        if (mode !== 'add') s.max[k] = Math.max(s.max[k] || 0, v);
        if (mode !== 'max') s.sum[k] = (s.sum[k] || 0) + v;
      }
      applyQuests(p, game, metrics, mode !== 'add', mode !== 'max', lines);
      evalAchs(p, lines);
      save(p);
      if (lines.length) sfx(lines.join('').indexOf('升級') >= 0 ? 'level' : 'great'); else if (mode === 'report') sfx('fanfare');
      for (var i = 0; i < lines.length; i++) notify(lines[i]);
    } catch (e) {}
  }

  window.GC = {
    /* 一局結束：次數 +1，並記錄各項成績 */
    report: function (game, metrics) { record(game, metrics, 'report'); },
    /* 只記錄「最高紀錄」，不增加次數（適合常駐型的遊戲） */
    max: function (game, metrics) { record(game, metrics, 'max'); },
    /* 累加某個數量，例如餵食次數 */
    add: function (game, metric, n) { var m = {}; m[metric] = typeof n === 'number' ? n : 1; record(game, m, 'add'); },
    ACH: ACH, QUESTS: QUESTS, COLL: COLL, THEMES: THEMES,
    sfx: sfx, soundOn: soundOn, bgm: bgm, bgmPreload: bgmPreload,
    openGame: openGame, __bgm: bgm, __preload: bgmPreload, __close: gameClose,
    __pause: function (v) { MU.paused = !!v; if (!MU.el && MU.want && musicOn()) { try { musKick(); } catch (e) {} } else musApply(); },
    __kick: function () { if (MU.want && musicOn() && (!MU.el || MU.el.paused || (AC && AC.state !== 'running'))) { try { musKick(); } catch (e) {} } }, musicOn: musicOn, loop: loop, loopParam: loopParam, stopLoops: stopLoops,
    settings: function () { return { sound: soundOn(), music: musicOn(), vol: vol(), vib: setting('vib', '1') !== '0', rm: setting('rm', '0') === '1' }; },
    setVolume: function (v) { v = Math.max(0, Math.min(1, v)); try { localStorage.setItem('gc:vol', String(v)); } catch (e) {} if (MG) MG.gain.value = v; },
    setSetting: function (k, on) { try { localStorage.setItem('gc:' + k, on ? '1' : '0'); } catch (e) {} if (k === 'music') { musApply(); try { window.dispatchEvent(new CustomEvent('gc-music', { detail: !!on })); } catch (e) {} } },
    errors: function () { try { return JSON.parse(localStorage.getItem(EKEY) || '[]'); } catch (e) { return []; } },
    clearErrors: function () { try { localStorage.removeItem(EKEY); } catch (e) {} },
    setSound: function (on) { try { localStorage.setItem(SKEY, on ? '1' : '0'); } catch (e) {} if (on) { ac(); sfx('pop'); } else stopLoops(); try { window.dispatchEvent(new CustomEvent('gc-sound', { detail: !!on })); } catch (e) {} },
    own: function (id) { return !!load().own[id]; },
    eq: function (slot) { var p = load(), id = p.eq[slot]; return id && p.own[id] ? id : null; },
    val: function (slot) { var id = this.eq(slot), d = id && collDef(id); return d ? d.val : null; },
    ownedIn: function (slot) { var p = load(); return COLL.filter(function (c) { return c.slot === slot && p.own[c.id]; }).map(function (c) { return c.id; }); },
    theme: function () { var a = activeTheme(); if (!a) return null; return { id: a.t.id, n: a.t.n, d: a.t.d, from: a.from, to: a.to, farm: a.t.farm || {} }; },
    earn: function (n) { var p = load(); var g = earn(p, n); save(p); return g; },
    /* 小菜園等遊戲直接用共用幣：give 加幣（不吃活動加成）、pay 付款（不夠就回傳 false） */
    give: function (n) { var p = load(); p.wallet = (p.wallet || 0) + Math.max(0, Math.round(n)); save(p); return p.wallet; },
    pay: function (n) { var p = load(); n = Math.round(n); if ((p.wallet || 0) < n) return false; p.wallet -= n; save(p); return true; },
    wallet: function () { return load().wallet || 0; },
    pantry: function () { var p = load(), o = {}; for (var k in p.pan) if (p.pan[k] > 0) o[k] = p.pan[k]; return o; },
    pantryName: function (id) { return PANTRY[id] ? PANTRY[id].n : id; },
    stock: function (id, n) { var p = load(); n = Math.max(0, Math.round(n || 1)); p.pan[id] = (p.pan[id] || 0) + n; save(p); return p.pan[id]; },
    take: function (id, n) { var p = load(); n = Math.max(0, Math.round(n || 1)); if ((p.pan[id] || 0) < n) return false; p.pan[id] -= n; if (!p.pan[id]) delete p.pan[id]; save(p); return true; },
    buy: function (id) {
      var p = load(), d = collDef(id); if (!d) return { ok: false, msg: '找不到這個商品' };
      if (p.own[id]) return { ok: false, msg: '已經擁有了' };
      var a = activeTheme(); if (d.theme && !(a && a.t.id === d.theme)) return { ok: false, msg: '這是限時商品，活動期間才能買' };
      if ((p.wallet || 0) < d.price) return { ok: false, msg: '幣不夠' };
      p.wallet -= d.price; p.own[id] = 1; if (d.slot === 'glaze' || d.slot === 'title') p.eq[d.slot] = id; save(p); return { ok: true };
    },
    equip: function (slot, id) { var p = load(); if (id && !p.own[id]) return; if (id) p.eq[slot] = id; else delete p.eq[slot]; save(p); },
    claim: function (n) {
      var p = load(), a = activeTheme(); if (!a || !p.th || p.th.id !== a.t.id) return { ok: false };
      var ms = null; for (var i = 0; i < TH_MS.length; i++) if (TH_MS[i][0] === n) ms = TH_MS[i];
      if (!ms || p.th.plays < n || p.th.claimed[n]) return { ok: false };
      p.th.claimed[n] = 1; var g = earn(p, ms[1]); save(p); return { ok: true, coins: g };
    },
    /* 給首頁使用：取得目前玩家的進度 */
    get: function () {
      var p = load(); touchDay(p); ensureQuests(p); save(p);
      var lv = levelOf(p.xp), cur = xpAt(lv), nxt = xpAt(lv + 1);
      var qs = p.q.map(function (q) { var d = questDef(q.id); return d ? { def: d, pr: Math.min(q.pr, d.target), done: q.done } : null; }).filter(Boolean);
      var last = {}; for (var g in p.s) last[g] = p.s[g].last || 0;
      var th = activeTheme(), tid = p.eq.title && p.own[p.eq.title] ? collDef(p.eq.title) : null, tinfo = null;
      if (th) { var ths = p.th && p.th.id === th.t.id && p.th.from === th.from ? p.th : { plays: 0, claimed: {} }; tinfo = { id: th.t.id, n: th.t.n, d: th.t.d, from: th.from, to: th.to, plays: ths.plays, claimed: ths.claimed, ms: TH_MS }; }
      return { wallet: p.wallet || 0, theme: tinfo, level: lv, title: tid ? tid.n : titleOf(lv), xp: p.xp, xpIn: p.xp - cur, xpNeed: nxt - cur, streak: p.streak || 0, quests: qs, ach: p.ach, qall: p.qall || 0, last: last };
    }
  };

  /* ================= 遊戲頁面的小工具 ================= */
  if (!IS_GAME) return;

  /* ================= 通用暫停（限時遊戲） ================= */
  var GNAME = location.pathname.split('/').pop().replace(/\.html$/, '');
  var PAUSABLE = { 'night-market': 1, 'cafe': 1, 'latte-art': 1, 'souffle': 1, 'sanwei-kitchen': 1 };
  var CAN_PAUSE = !!PAUSABLE[GNAME], paused = false, rafQ = [], held = {};
  var oRAF = window.requestAnimationFrame.bind(window);
  if (CAN_PAUSE) window.requestAnimationFrame = function (cb) { if (paused) { rafQ.push(cb); return 0; } return oRAF(cb); };
  document.addEventListener('pointerdown', function (e) { held[e.pointerId] = e.target; }, true);
  document.addEventListener('pointerup', function (e) { delete held[e.pointerId]; }, true);
  document.addEventListener('pointercancel', function (e) { delete held[e.pointerId]; }, true);
  function releaseHeld() {
    Object.keys(held).forEach(function (id) { var el = held[id]; if (!el || (el.closest && (el.closest('#gc-bar') || el.closest('#gc-pause')))) return;
      ['pointerup', 'pointercancel'].forEach(function (t) { try { el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: +id })); window.dispatchEvent(new PointerEvent(t, { pointerId: +id })); } catch (e) {} }); });
    held = {};
  }
  function pauseGame(silent) {
    if (!CAN_PAUSE || paused) return; paused = true; releaseHeld(); stopLoops(); MU.paused = true; musApply();
    var ov = document.getElementById('gc-pause'); if (ov && silent !== true) { ov.hidden = false; setTimeout(function () { try { document.getElementById('gc-resume').focus(); } catch (e) {} }, 30); }
  }
  function resumeGame() {
    if (!paused) return; paused = false; MU.paused = false; musApply(); var ov = document.getElementById('gc-pause'); if (ov) ov.hidden = true;
    var q = rafQ; rafQ = []; q.forEach(function (cb) { oRAF(cb); }); sfx('pop');
  }
  if (CAN_PAUSE) {
    document.addEventListener('visibilitychange', function () { if (document.hidden) pauseGame(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && paused) { e.preventDefault(); resumeGame(); } else if ((e.key === 'p' || e.key === 'P') && !/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) { paused ? resumeGame() : pauseGame(); } });
  }
  window.GC.pause = function () { pauseGame(); }; window.GC.resume = resumeGame; window.GC.isPaused = function () { return paused; };

  /* ================= 新手教學（每款第一次玩自動出現，返回列的「？」可以重看） ================= */
  var TOURS = {
    'sanwei-kitchen': [
      { t: '挑一道菜', d: '四道菜，每張卡片下面可以選普通版或職人版。', el: '#dishList' },
      { t: '跟著每一步做', d: '每一步開始前會說明怎麼操作：按住、畫圈、來回撒，時機和力道都會算分。' },
      { t: '看成品', d: '做完會看到成品和每一步的分數，可以再做一次挑戰更高分。' },
      { t: '隨時暫停', d: '做菜時上方有暫停按鈕，這個「？」可以重看說明。', el: '#gc-help' }
    ],
    'souffle': [
      { t: '先選口味', d: '原味、巧克力、抹茶，每次的條件都不一樣。', el: '#flavs' },
      { t: '六個步驟', d: '從分蛋到出爐，每一步開始前都有說明，照著用手指操作。', el: '#start' },
      { t: '撒糖粉', d: '出爐後用手指在上方左右刷兩下撒糖粉，撒好就上桌。' },
      { t: '膨越高分越高', d: '每一步都會影響最後膨起的高度。做的時候上方可以暫停。', el: '#gc-help' }
    ],
    'bubble-tea': [
      { t: '營業兩分鐘', d: '客人點什麼就做什麼。客人生氣的次數用完會提早打烊，這裡可以調。', el: '.lives' },
      { t: '照順序做', d: '茶倒到八分滿，糖和冰照次數加，珍珠要先煮，放太久會變硬。' },
      { t: '封膜出餐', d: '封膜後點客人就能出餐。按鈕分成茶底、加料、動作三區。' },
      { t: '店舖', d: '點數可以升級設備、學新飲料、請常客。連續做對還有連擊加成。', el: '#shop-open' }
    ],
    'cafe': [
      { t: '四位客人', d: '每次開店有四位客人，豆子、口味、奶種和拉花都不一樣。', el: '#start' },
      { t: '一步一步沖', d: '磨豆、控溫、萃取、打奶泡、拉花，每一步上方都有提示。' },
      { t: '聽聲音打奶泡', d: '噴嘴埋深是低沉的滾動聲，靠近奶面會嘶嘶響，照聲音調整位置。' },
      { t: '咖啡大賽', d: '四杯平均 70 分以上，就能跟五位對手比賽。', el: '#contest' }
    ],
    'latte-art': [
      { t: '從課程開始', d: '八堂課從圓形練到天鵝，每堂課開始前都有技巧說明。', el: '#m-levels' },
      { t: '先注入再拉花', d: '按住「高處注入」倒到一半，再用手指按在杯面推出奶泡。' },
      { t: '目標和輔助線', d: '右上角是目標圖，杯面的虛線是輔助線，不需要時可以關掉。' },
      { t: '更多玩法', d: '客人指定和限時挑戰會出題，作品集會留下你拉過的花。', el: '#m-order' }
    ],
    'night-market': [
      { t: '三十天夜市', d: '從巷尾小攤開始，三十天內闖出名號，之後還有無限模式。', el: '#b-new' },
      { t: '開攤前準備', d: '選地點、看天氣備料、訂價錢。備太多會剩，太少會賣光。' },
      { t: '營業中', d: '客人等太久會走掉，點爐子可以加快出餐。' },
      { t: '升級與研發', d: '賺的錢可以升級攤車、研發新菜、請幫手。' }
    ],
    'chef-cards': [
      { t: '選食材上菜', d: '每位評審有目標分數。從手牌選 1 到 5 張上菜，分數是「美味 × 倍率」。' },
      { t: '換牌', d: '手牌不好可以換牌。上菜和換牌的次數都有限。' },
      { t: '一路旅行', d: '過關後到市場買廚具、升級食譜，征服四座城市。' },
      { t: '完整規則', d: '料理組合和分數都寫在「怎麼玩」裡。', el: '#b-how' }
    ],
    'pet-house': [
      { t: '真實時間', d: '毛孩會餓、會髒、會想你，你不在的時候時間也照樣在走。' },
      { t: '照顧牠', d: '下方按鈕可以餵食、清潔、玩耍、睡覺，條變紅就要注意。', el: '.acts' },
      { t: '摸摸牠', d: '用手指在牠身上來回摸，心情和親密度會增加；點一下會告訴你牠想要什麼。' },
      { t: '還有更多', d: '「玩耍」裡可以帶牠出門散步；「更多」有商店、把戲、日記本。' }
    ],
    'corner-cafe': [
      { t: '三十天', d: '外婆留下的咖啡館，三十天內讓它重新熱鬧起來。' },
      { t: '每一天', d: '白天開店招呼客人，其他時間可以去見想認識的人。精神用完就要休息。' },
      { t: '熟客點單', d: '熟客會說「老樣子」、想換口味，或交給你決定，記住他們的喜好。' },
      { t: '十五種結局', d: '結局圖鑑會給還沒解鎖的結局線索。可以玩十五天短篇，看過的劇情能快轉。', el: '#b-gal' }
    ],
    'farm': [
      { t: '真實時間種菜', d: '作物照真實時間長大，關掉遊戲也會繼續長。先送你 4 包小白菜種子，3 分鐘就能收成。' },
      { t: '種植和澆水', d: '點「種植」選種子，再點空的田。田要澆水才會長，水乾了就會停。', el: '#tools' },
      { t: '雜草和蟲', d: '偶爾會長雜草、跑出蟲，點一下就清掉，不處理收成會變少。按住田地可以看這塊田的狀態，也能直接在那裡澆水或收成。', el: '#seedbar' },
      { t: '訂單和農舍', d: '村民大約 20 分鐘來一位，每個人有喜歡的作物。農舍可以蓋雞舍、挖池塘，雞蛋和魚可以拿到其他遊戲用。上方的天氣圖示可以看明天的天氣。', el: '#b-kit' }
    ]
  };
  var TOUR_KEY = '__tour:' + GNAME, tourEl = null, tourI = 0, tourPaused = false, tourSteps = null;
  function tourCss() {
    return '#gc-tour{position:fixed;inset:0;z-index:2147483003;font:500 15px/1.55 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}' +
      '#gc-tour .gt-dim{position:absolute;inset:0;background:rgba(15,18,24,.62)}#gc-tour.has-hole .gt-dim{background:transparent}' +
      '#gc-tour .gt-hole{position:absolute;border-radius:14px;box-shadow:0 0 0 200vmax rgba(15,18,24,.62);outline:3px solid #FFD66B;outline-offset:2px;pointer-events:none;transition:all .25s ease}' +
      '#gc-tour .gt-card{position:absolute;left:12px;right:12px;margin:0 auto;max-width:340px;background:#FFFDF8;color:#1F2A37;border-radius:18px;padding:16px 16px 12px;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:top .25s ease}' +
      '#gc-tour .gt-n{font-size:12px;color:#8A93A0;letter-spacing:.05em}#gc-tour .gt-t{display:block;font-size:17px;font-weight:700;margin:2px 0 4px}#gc-tour .gt-d{margin:0;color:#3A4452}' +
      '#gc-tour .gt-dots{display:flex;gap:5px;margin:12px 0 10px}#gc-tour .gt-dots i{width:7px;height:7px;border-radius:50%;background:#D5D9E0}#gc-tour .gt-dots i.on{background:#3B6EF5;width:18px;border-radius:4px}' +
      '#gc-tour .gt-btns{display:flex;gap:8px;align-items:center}#gc-tour button{border:0;font:inherit;cursor:pointer;border-radius:12px;padding:11px 14px;min-height:44px}' +
      '#gc-tour .gt-skip{background:transparent;color:#5B6472;margin-right:auto}#gc-tour .gt-prev{background:#EEF1F5;color:#1F2A37}#gc-tour .gt-next{background:#1F2A37;color:#fff;font-weight:700;min-width:96px}' +
      '#gc-tour button:focus-visible{outline:3px solid #3B6EF5;outline-offset:2px}' +
      '@media (prefers-color-scheme:dark){#gc-tour .gt-card{background:#222833;color:#E8EDF4}#gc-tour .gt-d{color:#C3CBD6}#gc-tour .gt-prev{background:#333B48;color:#E8EDF4}#gc-tour .gt-next{background:#E8EDF4;color:#1F2A37}#gc-tour .gt-skip{color:#A9B3C1}#gc-tour .gt-dots i{background:#4A5260}}' +
      '@media (prefers-reduced-motion:reduce){#gc-tour .gt-hole,#gc-tour .gt-card{transition:none}}';
  }
  function tourTarget(sel) {
    if (!sel) return null; var el = null; try { el = document.querySelector(sel); } catch (e) {}
    if (!el) return null; var r = el.getBoundingClientRect(), vh = window.innerHeight, vw = window.innerWidth;
    if (r.width < 4 || r.height < 4 || r.bottom < 40 || r.top > vh - 20 || r.right < 0 || r.left > vw) return null;
    var cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return null;
    return { l: Math.max(4, r.left - 6), t: Math.max(4, r.top - 6), r: Math.min(vw - 4, r.right + 6), b: Math.min(vh - 4, r.bottom + 6) };
  }
  function tourPlace() {
    if (!tourEl) return; var s = tourSteps[tourI], card = tourEl.querySelector('.gt-card'), hole = tourEl.querySelector('.gt-hole');
    var R = tourTarget(s.el), vh = window.innerHeight, ch = card.offsetHeight, top0 = 46;
    tourEl.classList.toggle('has-hole', !!R); hole.hidden = !R;
    if (!R) { card.style.top = Math.max(top0, (vh - ch) / 2) + 'px'; return; }
    hole.style.left = R.l + 'px'; hole.style.top = R.t + 'px'; hole.style.width = (R.r - R.l) + 'px'; hole.style.height = (R.b - R.t) + 'px';
    var below = vh - R.b - 14, above = R.t - 14 - top0;
    card.style.top = (below >= ch || below >= above ? Math.min(R.b + 14, vh - ch - 10) : Math.max(top0, R.t - 14 - ch)) + 'px';
  }
  function tourRender() {
    var s = tourSteps[tourI], n = tourSteps.length, last = tourI === n - 1, dots = '';
    for (var i = 0; i < n; i++) dots += '<i' + (i === tourI ? ' class="on"' : '') + '></i>';
    tourEl.querySelector('.gt-card').innerHTML = '<span class="gt-n">玩法說明 ' + (tourI + 1) + ' / ' + n + '</span><b class="gt-t" id="gt-t">' + esc(s.t) + '</b><p class="gt-d">' + esc(s.d) + '</p><div class="gt-dots" aria-hidden="true">' + dots + '</div>' +
      '<div class="gt-btns"><button type="button" class="gt-skip">' + (last ? '關閉' : '略過') + '</button>' + (tourI ? '<button type="button" class="gt-prev">上一步</button>' : '') + '<button type="button" class="gt-next">' + (last ? '開始玩' : '下一步') + '</button></div>';
    tourPlace(); try { tourEl.querySelector('.gt-next').focus({ preventScroll: true }); } catch (e) {}
  }
  function tourClose() {
    if (!tourEl) return; tourEl.remove(); tourEl = null; lsSet(TOUR_KEY, '1');
    window.removeEventListener('resize', tourPlace);
    if (tourPaused) { tourPaused = false; resumeGame(); }
  }
  function openTour() {
    tourSteps = TOURS[GNAME]; if (!tourSteps || tourEl) return;
    if (CAN_PAUSE && !paused && document.querySelector('.screen.on:not(#title):not(#home)')) { pauseGame(true); tourPaused = true; }
    var bp = document.getElementById('b-pause'), bpo = document.getElementById('pause');
    if (bp && bp.offsetParent && bpo && bpo.hidden) try { bp.click(); } catch (e) {}
    if (!document.getElementById('gc-tour-css')) { var st2 = document.createElement('style'); st2.id = 'gc-tour-css'; st2.textContent = tourCss(); document.head.appendChild(st2); }
    tourEl = document.createElement('div'); tourEl.id = 'gc-tour'; tourEl.setAttribute('role', 'dialog'); tourEl.setAttribute('aria-modal', 'true'); tourEl.setAttribute('aria-labelledby', 'gt-t');
    tourEl.innerHTML = '<div class="gt-dim"></div><div class="gt-hole" hidden></div><div class="gt-card" aria-live="polite"></div>';
    document.body.appendChild(tourEl); tourI = 0;
    tourEl.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return; sfx('tap');
      if (b.classList.contains('gt-skip')) tourClose();
      else if (b.classList.contains('gt-prev')) { tourI = Math.max(0, tourI - 1); tourRender(); }
      else if (b.classList.contains('gt-next')) { if (tourI >= tourSteps.length - 1) tourClose(); else { tourI++; tourRender(); } }
    });
    tourEl.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); tourClose(); } });
    window.addEventListener('resize', tourPlace);
    tourRender();
  }
  window.GC.tour = openTour;

  function touch() {
    try {
      var mk = ns('__meta'), m = JSON.parse(localStorage.getItem(mk) || '{}');
      var g = location.pathname.split('/').pop().replace(/\.html$/, '');
      m.games = m.games || {}; m.games[g] = { last: Date.now() }; m.lastGame = g;
      localStorage.setItem(mk, JSON.stringify(m));
    } catch (e) {}
  }
  touch();

  var name = '訪客';
  try { var ps = JSON.parse(localStorage.getItem('gc:profiles') || '[]'); for (var i = 0; i < ps.length; i++) if (ps[i].id === curPid()) name = ps[i].name; } catch (e) {}
  var css = ':root{padding-top:calc(env(safe-area-inset-top,0px) + 36px) !important}' +
    '#gc-bar{position:fixed;left:0;right:0;top:0;z-index:2147483000;height:calc(env(safe-area-inset-top,0px) + 36px);padding:env(safe-area-inset-top,0px) 10px 0;display:flex;align-items:center;gap:8px;' +
    'font:500 14px/1 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;background:rgba(250,250,252,.92);color:#1F2A37;border-bottom:1px solid rgba(0,0,0,.08);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}' +
    '#gc-bar a{color:inherit;text-decoration:none;display:flex;align-items:center;gap:4px;padding:8px 6px;border-radius:8px;white-space:nowrap;flex:none}' +
    '#gc-bar .snd{white-space:nowrap;flex:none}@media (max-width:400px){#gc-bar #gc-pz span,#gc-bar #gc-pz ~ .snd:not(#gc-help) span{display:none}}' +
    '#gc-bar a:focus-visible{outline:2px solid #3B6EF5}' +
    '#gc-bar .snd{display:flex;align-items:center;gap:4px;margin-left:0;border:0;background:transparent;color:inherit;font:inherit;font-size:13px;padding:6px 8px;border-radius:8px;cursor:pointer;opacity:.8}' +
    '#gc-bar .snd:focus-visible{outline:2px solid #3B6EF5}' +
    '#gc-bar > a + .snd{margin-left:auto}#gc-bar #gc-mp{margin-left:auto}#gc-bar #gc-mp + .snd{margin-left:0}#gc-bar #gc-help{font-weight:700;font-size:16px;min-width:32px;justify-content:center;padding:6px 4px}' +
    '#gc-pause{position:fixed;inset:0;z-index:2147483002;display:flex;align-items:center;justify-content:center;background:rgba(20,22,28,.6);padding:24px}#gc-pause[hidden]{display:none}' +
    '#gc-pause .gp-card{width:100%;max-width:320px;background:#FFFDF8;color:#1F2A37;border-radius:20px;padding:22px 18px;text-align:center;display:flex;flex-direction:column;gap:10px;font:500 15px/1.5 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}' +
    '#gc-pause b{font-size:1.4rem}#gc-pause span{color:#5B6472}' +
    '#gc-pause button{border:0;border-radius:14px;padding:14px;background:#1F2A37;color:#fff;font:inherit;font-size:1.05rem;font-weight:700;cursor:pointer}' +
    '#gc-pause a{color:#3B6EF5;text-decoration:none;padding:8px}' +
    '#gc-pause button:focus-visible,#gc-pause a:focus-visible{outline:3px solid #3B6EF5;outline-offset:2px}' +
    '@media (prefers-color-scheme:dark){#gc-pause .gp-card{background:#222833;color:#E8EDF4}#gc-pause span{color:#A9B3C1}#gc-pause button{background:#E8EDF4;color:#1F2A37}}' +
    '#gc-bar .who{margin-left:4px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%}' +
    '@media (prefers-color-scheme:dark){#gc-bar{background:rgba(22,26,34,.92);color:#E8EDF4;border-bottom-color:rgba(255,255,255,.08)}}' +
    'html,body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}input,textarea{-webkit-user-select:text;user-select:text}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.addEventListener('selectstart', function (e) { var t = e.target && e.target.tagName; if (t !== 'INPUT' && t !== 'TEXTAREA') e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { var t = e.target && e.target.tagName; if (t !== 'INPUT' && t !== 'TEXTAREA' && t !== 'A') e.preventDefault(); });
  function addBar() {
    if (document.getElementById('gc-bar')) return;
    var b = document.createElement('div'); b.id = 'gc-bar';
    var a = document.createElement('a'); a.href = '../index.html'; a.textContent = '‹ 遊戲合集';
    var w = document.createElement('span'); w.className = 'who'; w.textContent = '玩家：' + name;
    var sp = document.createElement('button'); sp.type = 'button'; sp.className = 'snd';
    var paint = function () { var on = soundOn(); sp.setAttribute('aria-label', on ? '音效開著，點一下關閉' : '音效關著，點一下打開'); sp.setAttribute('aria-pressed', String(on));
      sp.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' + (on ? '<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>' : '<path d="M17 9l5 6M22 9l-5 6"/>') + '</svg><span>' + (on ? '音效' : '靜音') + '</span>'; };
    paint(); sp.addEventListener('click', function () { window.GC.setSound(!soundOn()); });
    window.addEventListener('gc-sound', paint);
    var mp = null;
    if (GNAME === 'latte-art' || GNAME === 'cafe' || GNAME === 'night-market') {
      mp = document.createElement('button'); mp.type = 'button'; mp.className = 'snd'; mp.id = 'gc-mp';
      var paintM = function () { var on = musicOn(); mp.setAttribute('aria-label', on ? '音樂開著，點一下關閉' : '音樂關著，點一下打開'); mp.setAttribute('aria-pressed', String(on)); mp.style.opacity = on ? '' : '.5';
        mp.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="16.5" cy="16" r="2.5" fill="currentColor"/>' + (on ? '' : '<path d="M3 3l18 18"/>') + '</svg><span>' + (on ? '音樂' : '音樂關') + '</span>'; };
      paintM(); mp.addEventListener('click', function () { window.GC.setSetting('music', !musicOn()); });
      window.addEventListener('gc-music', paintM);
    }
    b.appendChild(a);
    if (CAN_PAUSE) {
      var pz = document.createElement('button'); pz.type = 'button'; pz.className = 'snd'; pz.id = 'gc-pz'; pz.setAttribute('aria-label', '暫停遊戲');
      pz.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg><span>暫停</span>';
      pz.addEventListener('click', pauseGame); b.appendChild(pz);
      var ov = document.createElement('div'); ov.id = 'gc-pause'; ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', '暫停中');
      ov.innerHTML = '<div class="gp-card"><b>暫停中</b><span>時間停住了，回來時會從剛才的地方繼續。</span><button type="button" id="gc-resume">繼續</button><a href="../index.html">回到遊戲合集</a></div>';
      document.body.appendChild(ov); document.getElementById('gc-resume').addEventListener('click', resumeGame);
    }
    if (TOURS[GNAME]) { var hp = document.createElement('button'); hp.type = 'button'; hp.className = 'snd'; hp.id = 'gc-help'; hp.setAttribute('aria-label', '玩法說明'); hp.textContent = '？'; hp.addEventListener('click', openTour); b.appendChild(hp); }
    if (mp) b.appendChild(mp);
    b.appendChild(sp); b.appendChild(w); document.body.appendChild(b);
    if (TOURS[GNAME] && !lsGet(TOUR_KEY)) setTimeout(function () { if (!document.hidden && !tourEl) openTour(); }, 700);
    // automatic sounds: tapping buttons, and good / bad messages
    document.addEventListener('click', function (e) { if (window.GC_OWN_SFX) return; var t = e.target.closest && e.target.closest('button'); if (!t || t.disabled || t.closest('#gc-bar')) return; sfx('tap'); }, true);
    var watched = document.querySelectorAll('#toast, .toast');
    for (var k = 0; k < watched.length; k++) (function (el) {
      new MutationObserver(function () { if (window.GC_OWN_SFX) return; var c = ' ' + el.className + ' '; if (c.indexOf(' show ') < 0 && c.indexOf(' on ') < 0) return; if (c.indexOf(' good ') >= 0) sfx('good'); else if (c.indexOf(' bad ') >= 0) sfx('bad'); }).observe(el, { attributes: true, attributeFilter: ['class'], childList: true, characterData: true, subtree: true });
    })(watched[k]);
  }
  if (document.body) addBar(); else document.addEventListener('DOMContentLoaded', addBar);
})();
