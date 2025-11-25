import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import Prerender from '@prerenderer/rollup-plugin';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isBuild = command === 'build';

  // 在构建时输出环境信息
  if (isBuild) {
    console.log('\n🚀 构建配置信息:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 构建模式: ${isProduction ? '✅ 生产环境 (production)' : '⚠️  开发环境 (development)'}`);
    console.log(`🌐 环境变量: ${env.VITE_APP_ENV || mode}`);
    console.log(`📝 应用标题: ${env.VITE_APP_TITLE || 'Nebula Lab'}`);
    console.log(`🔗 API 基础路径: ${env.VITE_API_BASE_URL || (isProduction ? '/prod-api' : '/dev-api')}`);
    console.log(`🔒 加密功能: ${env.VITE_ENABLE_ENCRYPT !== 'false' ? '✅ 启用' : '❌ 禁用'}`);
    console.log(`🐛 调试模式: ${env.VITE_DEBUG === 'true' ? '✅ 启用' : '❌ 禁用'}`);
    console.log(`📂 输出目录: lab/`);
    console.log(`🔄 预渲染路由: /, /create`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 预渲染配置 - 仅在生产构建时启用
  const prerenderPlugin = isProduction && isBuild
    ? Prerender({
        routes: ['/', '/create'], // 需要预渲染的路由
        renderer: new PuppeteerRenderer({
          // 等待页面渲染完成的条件
          renderAfterTime: 3000, // 等待 3 秒确保页面完全加载
          // Puppeteer 启动选项
          launchOptions: {
            headless: true,
            // 使用系统已安装的 Chrome（macOS 默认路径）
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          },
        }),
        postProcess(renderedRoute) {
          // 后处理：注入预渲染标记，便于调试
          renderedRoute.html = renderedRoute.html.replace(
            '</head>',
            `<meta name="prerender-status" content="prerendered" />\n</head>`
          );
          // 移除可能导致问题的脚本状态
          renderedRoute.html = renderedRoute.html.replace(
            /<script type="application\/json" id="__PRERENDER_STATE__">.*?<\/script>/gs,
            ''
          );
        },
      })
    : null;

  return {
    plugins: [
      react(),
      prerenderPlugin, // 预渲染插件（生产构建时启用）
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    // 定义全局常量，可在代码中使用
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || mode),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_PRODUCTION__: JSON.stringify(isProduction),
    },
    esbuild: {
      // 生产环境移除 console 和 debugger
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    build: {
      outDir: 'lab', // 输出目录（默认 dist，可修改如 'build'）
      assetsDir: 'assets', // 静态资源目录（默认 assets）
      sourcemap: isProduction ? false : true, // 生产环境关闭 SourceMap，减小体积
      minify: isProduction ? 'esbuild' : false, // 生产环境启用压缩（使用 esbuild，更快）
      rollupOptions: {
        // 代码分割配置（按需拆分第三方库如 react/react-dom）
        output: {
          manualChunks: {
            react: ['react', 'react-dom'], // 将 react 相关库拆分为独立 chunk
            // utils: ['lodash', 'axios'], // 自定义第三方库拆分
          },
        },
      },
    },
    server: {
      port: 5666,
      proxy: {
        '/dev-api': {
          // target: 'http://34.96.210.20:8080',
          // target: 'http://localhost:8080',
          target: 'https://ai-nebula.com/prod-api',
          // target: 'http://34.96.210.20:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
        },
        '/prod-api': {
          // 生产环境代理配置（如果需要）
          // target: 'https://your-production-api.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/prod-api/, ''),
        },
        '/ph-api/rank': {
          target: 'https://artificialanalysis.ai/api/v2/data/llms/models',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ph-api\/rank/, ''),
        },
      },
    },
  };
});
