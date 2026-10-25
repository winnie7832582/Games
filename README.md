# 小遊戲合集

八款手機、電腦都能玩的小遊戲，支援多個玩家設定檔、匯出匯入存檔，可以安裝成 App 離線玩。

## 資料夾內容

| 檔案 | 用途 |
|---|---|
| `index.html` | 合集首頁：選玩家、選遊戲、備份與轉移、更新 |
| `config.js` | **更版時唯一需要改的檔案**：版本號、更新紀錄、遊戲清單 |
| `gc.js` | 共用存檔模組，每款遊戲都會載入，讓存檔分玩家存放 |
| `sw.js` | 離線快取與自動更新，不用改 |
| `manifest.webmanifest` | 安裝成 App 的設定 |
| `icons/` | App 圖示 |
| `games/` | 八款遊戲 |

## 第一次上傳到 GitHub Pages

1. 到 github.com 註冊並登入。
2. 右上角「+」→「New repository」。名稱例如 `games`，選 **Public**，按「Create repository」。
3. 在新頁面點「uploading an existing file」，把這個資料夾**裡面的所有檔案和資料夾**（不是資料夾本身）拖進去，按「Commit changes」。
4. 到該 repository 的「Settings」→ 左側「Pages」。
5. 「Build and deployment」的 Source 選「Deploy from a branch」，Branch 選 `main`、資料夾選 `/ (root)`，按「Save」。
6. 等一到兩分鐘，重新整理 Pages 頁面，上方會出現網址，例如 `https://你的帳號.github.io/games/`。
7. 把這個網址分享給朋友就完成了。

> 免費帳號的 GitHub Pages 需要 Public repository，代表程式碼別人看得到；玩家的存檔不會上傳，只存在他們自己的裝置裡。

## 更版（每次更新都照這三步）

1. 換掉或修改要更新的檔案（例如 `games/` 裡的某款遊戲）。
2. 打開 `config.js`：
   - 把 `version` 改成新號碼，例如 `'1.0.0'` → `'1.1.0'`。
   - 在 `changelog` 最上面加一筆：`{ v: '1.1.0', date: '2026-11-01', notes: ['修正了什麼', '新增了什麼'] },`
3. 到 GitHub repository →「Add file」→「Upload files」，把改過的檔案拖進去（同名會覆蓋），按「Commit changes」。

玩家下次打開合集，上方會出現「有新版本可以更新」，點一下就更新完成，存檔不受影響。

> **一定要改 version**。沒改的話，已經安裝的玩家會繼續用舊版的離線快取。

### 在網頁上直接改

小改動可以不用重新上傳：在 GitHub 點開檔案 → 右上角鉛筆圖示 → 修改 →「Commit changes」。改完一樣要記得改 `config.js` 的版本號。

### 想看或還原舊版本

repository 的「Commits」會列出每一次上傳。點進去可以看改了什麼；要還原時，把舊版檔案下載下來重新上傳即可。

## 新增一款遊戲

1. 遊戲的 html 放進 `games/`。
2. 在該 html 的 `</head>` 前加一行：`<script src="../gc.js"></script>`
3. 遊戲裡存檔用的 `localStorage.getItem / setItem / removeItem`，全部改成 `GCStore.getItem / setItem / removeItem`。
4. 在 `config.js` 的 `games` 清單加一筆，並改版本號。

## 給玩家的說明

- **iPhone**：用 Safari 打開網址 → 點分享 →「加入主畫面」，之後都從主畫面圖示打開。從 Safari 和從圖示打開是兩份不同的存檔。
- **Windows**：用 Edge 或 Chrome 打開 → 網址列右側的「安裝」圖示。
- **多個玩家**：首頁右上角點名字，可以新增、切換、改名、刪除玩家。
- **換裝置**：首頁「備份與轉移」→ 匯出存檔檔案（或複製轉移碼）→ 在新裝置同一個地方匯入。
- **備份**：iPhone 很久沒打開的網站資料可能被系統清掉，建議偶爾匯出備份。
