# 婚禮網站上線準備

目前尚未連接 GitHub，也尚未公開網站。

## 推薦的上線方式

1. 在 **`wedding-site` 這個資料夾**建立獨立的 GitHub repository。不要在上一層 `1114帷昱子涵證婚` 建 repository；上一層含原始婚紗照、PDF 和試算表。
2. 先在本機執行 `python verify_publish.py`。它會檢查三頁的相對連結、檔名大小寫、26 張相片，以及首頁與流程頁的教會地圖網址。
3. 建立 GitHub repository 後，將 `wedding-site` 的內容提交到 `main`。`.gitignore` 會排除本機預覽截圖。
4. 在 repository 的 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
5. 在 **Actions → Publish wedding invitation → Run workflow** 手動發布。現在的工作流程只接受手動啟動，單純上傳或推送檔案不會自動公開網站。
6. 部署成功後，網址通常是 `https://<帳號>.github.io/<repository>/`。請用手機實際開啟，檢查三頁、26 張照片、地圖與倒數。

工作流程只發布 `dist/`：其中包含網頁與壓縮後的 WebP 照片。原始 JPG、PDF、試算表和本機截圖都不在部署範圍內。相本照片製作腳本 `build_gallery_assets.py` 是本機更新照片時使用；GitHub 上線時不需要原始 JPG，也不會執行該腳本。

## 已知注意事項

- **公開性：** GitHub Pages 網站通常可由任何知道網址的人瀏覽，照片也可被開啟或下載。即使付費方案允許從 private repository 發布，網站本身仍可能是公開的。網址不等於密碼。
- **資料夾位置：** GitHub Pages 的專案網址含 repository 路徑。現有頁面與照片都使用 `./` 相對路徑，部署到 `/<repository>/` 仍應正常。請勿改成以 `/assets/...` 開頭的根目錄路徑。
- **原始檔太大：** 上一層 PDF 超過 GitHub 一般 Git 的 100 MiB 單檔限制；也不需要把原始婚紗照推上去。只用這個 `wedding-site` 資料夾建庫。
- **地圖：** 教會使用 Google Maps 的公開搜尋網址；五個停車場是 Google Maps 短連結。連結在 2026-10-14 均可開啟，但停車場名稱、營業狀態與步行時間可能變動，婚禮前應再確認。
- **倒數：** 目標寫成 `2026-11-14T09:30:00+08:00`，即台灣時間。訪客不論在何時區，倒數都指向同一時刻；但若訪客裝置的時間設定錯誤，畫面也會跟著偏差。
- **分享預覽：** LINE 等聊天軟體使用的完整 Open Graph 圖片網址，必須等實際 GitHub Pages 網址確定後再設定並測試。公開前也應確認網站標題、照片與地址都是希望親友看到的內容。

參考：[GitHub Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[GitHub Pages 自訂工作流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)。
