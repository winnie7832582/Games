/* ============================================================
   遊戲合集設定檔：更版時只需要改這個檔案
   1. 把 version 改成新的號碼（例如 1.0.0 → 1.1.0）
   2. 在 changelog 最上面加一筆更新說明
   3. 新增遊戲時，把 html 放進 games 資料夾，再在 games 清單加一筆
   ============================================================ */
self.GC_CONFIG = {
  title: '小遊戲合集',
  author: 'hua',
  year: 2026,
  version: '1.2.2',
  changelog: [
    { v: '1.2.2', date: '2026-10-25', notes: ['轉移碼匯入：開頭變成小寫 gc1: 或全形符號也能正確辨識'] },
    { v: '1.2.1', date: '2026-10-25', notes: ['「關於與更新」的關閉按鈕移到最上方，和危險區分開'] },
    { v: '1.2.0', date: '2026-10-25', notes: ['毛孩小屋：新增守宮，夜行性、吃昆蟲、需要幫忙蛻皮', '一杯好咖啡：每次開店的客人、豆子、口味、奶種和拉花都會不一樣', '搖搖茶舖：開店前可以選擇失誤次數（1 到 10 次）', '轉移碼改善：複製更穩定，匯入失敗時會說明原因', '首頁底部加上作者與版權資訊'] },
    { v: '1.1.5', date: '2026-10-25', notes: ['巷口咖啡館：修正劇情選完選項後卡住的問題'] },
    { v: '1.1.4', date: '2026-10-25', notes: ['拉一杯花：評分改看愛心的尖角和凹口，一團亂的形狀不會再拿高分', '「快速一劃」要夠快、從圓心劃過才算數，劃失敗會即時提示'] },
    { v: '1.1.3', date: '2026-10-25', notes: ['所有遊戲：在手機上長按不會再跳出文字選取', '拉一杯花：杯子太空時不會倒出看不見的奶泡，提示也會正確顯示'] },
    { v: '1.1.2', date: '2026-10-25', notes: ['拉一杯花：輔助線方向改成跟目標圖一致', '愛心和鬱金香改成由上往下劃，提示和教學一起更新'] },
    { v: '1.1.1', date: '2026-10-25', notes: ['拉一杯花：奶泡改落在指尖上方，不會被手指擋住', '高處注入倒到一半會自動停', '杯子變慢滿，拉花時間更充裕', '新增輔助線和「快速一劃」提示'] },
    { v: '1.1.0', date: '2026-10-25', notes: ['新增遊戲：三味廚房'] },
    { v: '1.0.0', date: '2026-10-25', notes: ['第一版上線：八款遊戲', '支援多個玩家設定檔', '可以匯出、匯入進度，換裝置接著玩'] }
  ],
  games: [
    { id: 'sanwei-kitchen', file: 'games/sanwei-kitchen.html', name: '三味廚房',   desc: '舒芙蕾、蛋包飯、蚵仔煎，三道菜即時料理', icon: '🍳', color: '#E07A2F' },
    { id: 'souffle',      file: 'games/souffle.html',      name: '舒芙蕾',     desc: '六個步驟做出一個高挺的舒芙蕾', icon: '🍮', color: '#F2B632' },
    { id: 'bubble-tea',   file: 'games/bubble-tea.html',   name: '搖搖茶舖',   desc: '兩分鐘內手忙腳亂做手搖飲',     icon: '🧋', color: '#E5483A' },
    { id: 'cafe',         file: 'games/cafe.html',         name: '一杯好咖啡', desc: '每天四位客人，點單都不一樣', icon: '☕', color: '#8B5E3C' },
    { id: 'latte-art',    file: 'games/latte-art.html',    name: '拉一杯花',   desc: '從圓形練到愛心、鬱金香、葉子', icon: '🤍', color: '#2F6FDB' },
    { id: 'night-market', file: 'games/night-market.html', name: '夜市人生',   desc: '三十天經營夜市小攤',           icon: '🏮', color: '#D93A2F' },
    { id: 'chef-cards',   file: 'games/chef-cards.html',   name: '主廚牌局',   desc: '料理卡牌冒險，征服十二位評審', icon: '🃏', color: '#2E8B57' },
    { id: 'pet-house',    file: 'games/pet-house.html',    name: '毛孩小屋',   desc: '貓、狗、兔子或守宮，用真實時間照顧',       icon: '🐾', color: '#2A9D8F' },
    { id: 'corner-cafe',  file: 'games/corner-cafe.html',  name: '巷口咖啡館', desc: '經營咖啡館，也許還會談戀愛',   icon: '💌', color: '#D35D7A' }
  ]
};
