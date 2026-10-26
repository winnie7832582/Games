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
     ['count', 數]  已解鎖成就數
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
  A('la5', 'latte-art', '自由創作', '用自由創作拉一杯', ['sum', 'latte-art', 'free', 1]);
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
  function blank() { return { v: 1, s: {}, ach: {}, xp: 0, last: '', streak: 0, qday: '', q: [], qall: 0 }; }
  function load() {
    var p; try { p = JSON.parse(lsGet('__prog') || 'null'); } catch (e) { p = null; }
    if (!p || p.v !== 1) p = blank();
    p.s = p.s || {}; p.ach = p.ach || {}; p.q = p.q || [];
    return p;
  }
  function save(p) { lsSet('__prog', JSON.stringify(p)); }
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
    return false;
  }

  /* ================= 通知 ================= */
  var queue = [], showing = false, bannerEl = null;
  function ensureBanner() {
    if (bannerEl || !document.body) return;
    var st = document.createElement('style');
    st.textContent = '#gc-note{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 44px);transform:translate(-50%,-8px);opacity:0;z-index:2147483001;max-width:92vw;pointer-events:none;transition:opacity .2s,transform .2s;' +
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
        if (checkOne(p, a.c)) { p.ach[a.id] = Date.now(); addXp(p, a.xp, lines); lines.push('<b>成就解鎖</b>：' + esc(a.name) + '<small>' + esc(a.desc) + '　+' + a.xp + ' XP</small>'); again = true; }
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
        lines.push('<b>每日挑戰完成</b>：' + esc(d.text) + '<small>+' + QXP + ' XP</small>');
        var all = true; for (var k = 0; k < p.q.length; k++) if (!p.q[k].done) all = false;
        if (all) { p.qall = (p.qall || 0) + 1; addXp(p, QBONUS, lines); lines.push('<b>今日三個挑戰全部完成！</b><small>額外 +' + QBONUS + ' XP</small>'); }
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
      if (mode === 'report') s.plays = (s.plays || 0) + 1;
      for (k in metrics) {
        var v = metrics[k]; if (typeof v !== 'number' || isNaN(v)) continue;
        if (mode !== 'add') s.max[k] = Math.max(s.max[k] || 0, v);
        if (mode !== 'max') s.sum[k] = (s.sum[k] || 0) + v;
      }
      applyQuests(p, game, metrics, mode !== 'add', mode !== 'max', lines);
      evalAchs(p, lines);
      save(p);
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
    ACH: ACH, QUESTS: QUESTS,
    /* 給首頁使用：取得目前玩家的進度 */
    get: function () {
      var p = load(); touchDay(p); ensureQuests(p); save(p);
      var lv = levelOf(p.xp), cur = xpAt(lv), nxt = xpAt(lv + 1);
      var qs = p.q.map(function (q) { var d = questDef(q.id); return d ? { def: d, pr: Math.min(q.pr, d.target), done: q.done } : null; }).filter(Boolean);
      var last = {}; for (var g in p.s) last[g] = p.s[g].last || 0;
      return { level: lv, title: titleOf(lv), xp: p.xp, xpIn: p.xp - cur, xpNeed: nxt - cur, streak: p.streak || 0, quests: qs, ach: p.ach, qall: p.qall || 0, last: last };
    }
  };

  /* ================= 遊戲頁面的小工具 ================= */
  if (!IS_GAME) return;

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
    '#gc-bar a{color:inherit;text-decoration:none;display:flex;align-items:center;gap:4px;padding:8px 6px;border-radius:8px}' +
    '#gc-bar a:focus-visible{outline:2px solid #3B6EF5}' +
    '#gc-bar .who{margin-left:auto;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%}' +
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
    b.appendChild(a); b.appendChild(w); document.body.appendChild(b);
  }
  if (document.body) addBar(); else document.addEventListener('DOMContentLoaded', addBar);
})();
