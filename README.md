<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15QpWFCQCPVCEsL9Z-yzdVgh7KtX6NZAt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 版本更新检测配置

系统支持自动检测新版本并提示用户刷新。

### 环境变量配置

在 `.env` 文件中可配置：

- `VITE_APP_CHECK_UPDATES_INTERVAL`: 版本检测间隔（分钟），默认 1 分钟。
- `VITE_APP_VERSION`: 由构建系统自动注入（基于 package.json）。

### 部署说明

版本检测依赖 `ETag` 或 `Last-Modified` 响应头。请确保 Nginx 或 CDN 配置正确返回这些头部信息。
