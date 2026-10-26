# 婚禮網站

正式網址：<https://weiyyu.github.io/ryan-joy-wedding/>

公開儲存庫：<https://github.com/weiyyu/ryan-joy-wedding>

## 更新網站

在這個 `wedding-site` 資料夾修改 `dist/` 內的網頁與素材。提交並推送到 `main` 後，GitHub Actions 會先檢查檔案與倒數，再自動發布 `dist/`。也可以到儲存庫的 Actions 頁面手動執行 **Publish wedding invitation**。

更新相本照片時，先執行 `python build_gallery_assets.py`，確認 26 張照片與縮圖都已重建；接著更新 `dist/gallery.js`、`dist/gallery.html` 與首頁相本連結中的相片版本參數，讓訪客立即取得新版素材。原始 JPG 不會上傳。

更新道路指引照片時，在上一層的 `道路指引/庫倫街` 或 `道路指引/橡木桶` 更換編號 JPG；同編號的 `_箭頭.jpg` 只作為方向參考。執行 `python build_directions_assets.py` 後，網站會使用轉正並壓縮的無箭頭 WebP，箭頭位置與文字由 `dist/directions.js` 繪製。更新後也要遞增 `dist/directions.js` 與網頁連結的版本參數，以免訪客讀到快取。

發布前可在本機執行：

```powershell
python verify_publish.py
node verify_time.js
```

`verify_publish.py` 會檢查各頁的相對連結、檔名大小寫、26 張相本照片、14 張道路指引照片、教會地圖網址與部署檔案大小。`verify_time.js` 會檢查台灣時間的倒數邊界。

只在 `wedding-site` 建立和更新 Git 儲存庫。上一層 `1114帷昱子涵證婚` 含原始婚紗照、PDF 和試算表，沒有推送到 GitHub。公開網站僅部署 `dist/`，其中的 26 張相片是壓縮後、移除 EXIF 的 WebP 檔。`build_gallery_assets.py` 僅供本機重新產生相片使用。

## 上線檢查與限制

- 首頁、流程、相本與道路指引都使用相對路徑，可在 GitHub Pages 的 `ryan-joy-wedding` 子路徑開啟。
- 教會導航使用 Google Maps 上標示 B2 地址的火把教會地點連結；網站顯示的證婚樓層為 B1。五個停車場使用 Google Maps 短連結。營業狀態與步行時間可能變動，婚禮前請再確認。
- 倒數目標是 `2026-11-14T09:30:00+08:00`。訪客裝置時間錯誤時，畫面倒數也會偏差。
- 照片與網站皆公開可見，也可被下載。分享預覽使用網站內的婚紗照；LINE 等服務可能快取舊預覽，更新後不一定立即刷新。

參考：[GitHub Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[GitHub Pages 自訂工作流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)。
