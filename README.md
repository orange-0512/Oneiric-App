# Oneiric - React Native iOS App

這是一個使用 React Native (Expo) 開發的 iOS 夢境記錄應用程式。

## 📱 專案結構

```
oneiric-app/
├── App.js              # 主應用程式（頁面導航）
├── WelcomePage.js      # 歡迎頁面 1
├── WelcomePage2.js     # 歡迎頁面 2
├── ButtonStyle.js      # 按鈕組件
├── package.json        # 依賴配置
├── app.json           # Expo 配置
└── babel.config.js    # Babel 配置
```

## 🚀 安裝步驟

由於網路連線問題，請手動安裝依賴：

### 1. 進入專案目錄
```bash
cd /Users/orange/.gemini/antigravity/scratch/oneiric-app
```

### 2. 安裝依賴
```bash
npm install
```

如果 npm 有問題，可以嘗試：
```bash
# 清除 npm 快取
npm cache clean --force

# 或使用 yarn
yarn install
```

### 3. 啟動開發伺服器
```bash
npm start
```

### 4. 在 iOS 模擬器中執行
```bash
npm run ios
```

## 📋 前置需求

- **Node.js** (已安裝 ✅)
- **Xcode** (用於 iOS 模擬器)
- **Expo Go App** (可選，用於實體裝置測試)

## 🎨 主要功能

- ✅ 兩頁歡迎流程
- ✅ 頁面導航
- ✅ 符合 Figma 設計
- ✅ 原生 iOS 組件

## 🔧 與網頁版的差異

| 網頁版 | React Native |
|--------|--------------|
| `<div>` | `<View>` |
| `<p>`, `<h1>` | `<Text>` |
| `<button>` | `<TouchableOpacity>` |
| CSS classes | StyleSheet |
| Tailwind CSS | StyleSheet.create() |

## 📱 下一步

1. 安裝依賴
2. 測試 iOS 模擬器
3. 新增更多頁面
4. 準備上架 App Store

## ⚠️ 注意事項

目前網路連線有問題，無法自動安裝依賴。請確認：
- 網路連線正常
- 沒有 proxy 設定問題
- npm registry 可以訪問
