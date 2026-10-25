/* 遊戲合集共用存檔模組：每款遊戲都會先載入這個檔案。
   遊戲裡的存檔會自動存進「目前選擇的玩家」底下，不同玩家互不影響。 */
(function () {
  'use strict';
  var CUR = 'gc:current';
  var pid = null;
  try { pid = localStorage.getItem(CUR); } catch (e) {}
  if (!pid) pid = 'guest';
  function ns(k) { return 'gc:p:' + pid + ':' + k; }
  function touch() {
    try {
      var mk = ns('__meta'), m = JSON.parse(localStorage.getItem(mk) || '{}');
      var g = location.pathname.split('/').pop().replace(/\.html$/, '');
      m.games = m.games || {}; m.games[g] = { last: Date.now() }; m.lastGame = g;
      localStorage.setItem(mk, JSON.stringify(m));
    } catch (e) {}
  }
  window.GCStore = {
    getItem: function (k) { try { return localStorage.getItem(ns(k)); } catch (e) { return null; } },
    setItem: function (k, v) { try { localStorage.setItem(ns(k), String(v)); } catch (e) { alert('裝置空間不足，進度可能沒有存起來。可以到合集首頁匯出備份。'); } },
    removeItem: function (k) { try { localStorage.removeItem(ns(k)); } catch (e) {} }
  };
  touch();

  /* 頂部返回列 */
  var name = '訪客';
  try { var ps = JSON.parse(localStorage.getItem('gc:profiles') || '[]'); for (var i = 0; i < ps.length; i++) if (ps[i].id === pid) name = ps[i].name; } catch (e) {}
  var css = ':root{padding-top:calc(env(safe-area-inset-top,0px) + 36px) !important}' +
    '#gc-bar{position:fixed;left:0;right:0;top:0;z-index:2147483000;height:calc(env(safe-area-inset-top,0px) + 36px);padding:env(safe-area-inset-top,0px) 10px 0;display:flex;align-items:center;gap:8px;' +
    'font:500 14px/1 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;background:rgba(250,250,252,.92);color:#1F2A37;border-bottom:1px solid rgba(0,0,0,.08);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}' +
    '#gc-bar a{color:inherit;text-decoration:none;display:flex;align-items:center;gap:4px;padding:8px 6px;border-radius:8px}' +
    '#gc-bar a:focus-visible{outline:2px solid #3B6EF5}' +
    '#gc-bar .who{margin-left:auto;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%}' +
    '@media (prefers-color-scheme:dark){#gc-bar{background:rgba(22,26,34,.92);color:#E8EDF4;border-bottom-color:rgba(255,255,255,.08)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function addBar() {
    if (document.getElementById('gc-bar')) return;
    var b = document.createElement('div'); b.id = 'gc-bar';
    var a = document.createElement('a'); a.href = '../index.html'; a.textContent = '‹ 遊戲合集';
    var w = document.createElement('span'); w.className = 'who'; w.textContent = '玩家：' + name;
    b.appendChild(a); b.appendChild(w); document.body.appendChild(b);
  }
  if (document.body) addBar(); else document.addEventListener('DOMContentLoaded', addBar);
})();
