# 小遊戲合集

© 2026 hua　版權所有

九款可以在手機和電腦上玩的小遊戲。支援多個玩家、匯出匯入存檔，也可以安裝成 App 離線玩。

## 遊戲清單

| 遊戲 | 檔案 | 類型 |
|---|---|---|
| 三味廚房 | `games/sanwei-kitchen.html` | 即時料理：舒芙蕾、蛋包飯、蚵仔煎 |
| 舒芙蕾 | `games/souffle.html` | 即時料理：六個步驟做出一個舒芙蕾 |
| 搖搖茶舖 | `games/bubble-tea.html` | 限時經營：兩分鐘做手搖飲，可選擇失誤次數 |
| 一杯好咖啡 | `games/cafe.html` | 手沖與拿鐵，每次的客人和點單都不一樣 |
| 拉一杯花 | `games/latte-art.html` | 拿鐵拉花課程、自由創作與作品集 |
| 夜市人生 | `games/night-market.html` | 三十天夜市攤位經營 |
| 主廚牌局 | `games/chef-cards.html` | 料理卡牌冒險，十二位評審 |
| 毛孩小屋 | `games/pet-house.html` | 用真實時間照顧貓、狗、兔子或守宮 |
| 巷口咖啡館 | `games/corner-cafe.html` | 咖啡館經營與戀愛養成，十一種結局 |

## 資料夾內容

| 檔案 | 用途 |
|---|---|
| `index.html` | 合集首頁：選玩家、選遊戲、備份與轉移、關於與更新 |
| `config.js` | **更版時一定要改的檔案**：版本號、更新紀錄、遊戲清單、作者與年份 |
| `gc.js` | 共用模組：分玩家存檔、遊戲頂部的返回列、防止長按跳出文字選取 |
| `sw.js` | 離線快取與自動更新，不用改 |
| `manifest.webmanifest` | 安裝成 App 的設定 |
| `icons/` | App 圖示 |
| `games/` | 所有遊戲 |
| `LICENSE` | 授權聲明 |
| `README.md` | 這份說明 |

## 第一次上傳到 GitHub Pages

### 用電腦

1. 登入 github.com，右上角「+」→「New repository」，名稱例如 `games`，選 **Public**，按「Create repository」。
2. 點「uploading an existing file」，把資料夾**裡面的所有檔案和資料夾**拖進去（不是拖資料夾本身），按「Commit changes」。
3. 到「Settings」→「Pages」，Source 選「Deploy from a branch」，Branch 選 `main`、資料夾選 `/ (root)`，按「Save」。
4. 等一到兩分鐘，Pages 頁面上方會出現網址，例如 `https://你的帳號.github.io/games/`。

### 用 iPhone

GitHub App 可以建立 repository、修改文字檔，但不能上傳檔案，也不能開 Pages，這兩件事要用 Safari。

1. 在「檔案」App 點壓縮檔，自動解壓縮。
2. 用 Safari 打開 github.com，點網址列左邊的「大小」圖示，選「要求桌面版網站」。
3. 手機一次只能選檔案、不能選資料夾，所以要分三次上傳：
   - **最外層**：點「uploading an existing file」，多選所有最外層的檔案，按「Commit changes」。
   - **games 資料夾**：「Add file」→「Create new file」，檔名輸入 `games/a.txt`，內容隨便打一個字，Commit。再點進 `games` →「Add file」→「Upload files」，多選所有遊戲檔，Commit。
   - **icons 資料夾**：用同樣的方法建立 `icons/a.txt`，再把圖示傳進去。
4. 「Settings」→「Pages」照電腦版第 3 步設定。

> 免費帳號的 GitHub Pages 必須是 Public，代表程式碼別人看得到。玩家的存檔不會上傳，只存在他們自己的裝置裡。

## 更版（每次更新都照這三步）

1. 換掉或修改要更新的檔案。上傳時同名檔案會直接覆蓋。
2. 打開 `config.js`：
   - 把 `version` 改成新號碼，例如 `'1.2.1'` → `'1.2.2'`。
   - 在 `changelog` 最上面加一筆：`{ v: '1.2.2', date: '2026-11-01', notes: ['修正了什麼', '新增了什麼'] },`
3. 上傳改過的檔案，按「Commit changes」。

玩家下次打開合集，上方會出現「有新版本可以更新」，點一下就完成，存檔不受影響，接著還會顯示這次的更新內容。

> **一定要改 version。** 沒改的話，已經安裝成 App 的玩家會一直用到舊版。

### 小改動直接在網頁或 App 改

在 GitHub 點開檔案 → 鉛筆圖示（App 是右上角選單的「Edit File」）→ 修改 →「Commit changes」。改完一樣要記得改 `config.js` 的版本號。

### 查看或還原舊版本

repository 的「Commits」會列出每一次上傳，點進去可以看改了什麼。要還原時，把舊版檔案下載下來再上傳一次即可。

## 修改作者、年份與標題

都在 `config.js` 最上面：

```js
title: '小遊戲合集',
author: 'hua',
year: 2026,
```

首頁底部會顯示「© 年份 作者　版權所有　版本號」。如果要改成每年自動更新年份，把 `year` 那行刪掉即可。

## 新增一款遊戲

1. 遊戲的 html 放進 `games/`。
2. 在該 html 的 `</head>` 前加一行：`<script src="../gc.js"></script>`
3. 把遊戲裡的 `localStorage.getItem / setItem / removeItem`，全部改成 `GCStore.getItem / setItem / removeItem`，存檔才會分玩家存放。
4. 在 `config.js` 的 `games` 清單加一筆（id、file、name、desc、icon、color），並改版本號。

## 玩家說明（可以直接轉傳）

- **iPhone**：用 Safari 打開網址（在 LINE 裡請點右上角選「用 Safari 開啟」）→ 點分享 →「加入主畫面」，之後都從主畫面圖示打開。從 Safari 和從圖示打開是兩份不同的存檔。
- **Windows**：用 Edge 或 Chrome 打開，點網址列右側的「安裝」圖示。
- **多個玩家**：首頁右上角點名字，可以新增、切換、改名、刪除玩家。
- **換裝置**：首頁「備份與轉移」→ 匯出存檔檔案或複製轉移碼 → 在新裝置的同一個地方匯入，可以選擇新增成新玩家，或覆蓋目前的玩家。
  - 轉移碼適合用訊息傳，但不包含「拉一杯花」作品集的照片。
  - 要連照片一起搬，請用存檔檔案。
- **備份**：iPhone 很久沒打開的網站資料可能會被系統清掉，建議偶爾匯出備份。

## 授權

本合集的程式碼、圖像與文字內容著作權屬於 hua，詳見 `LICENSE`。歡迎免費遊玩與分享連結；未經同意，請勿複製、修改、重新發布或用於商業用途。
