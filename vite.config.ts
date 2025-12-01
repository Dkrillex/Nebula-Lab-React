import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Prerender from '@prerenderer/rollup-plugin';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 package.json 获取版本号
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production' || mode.includes('production');
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
    console.log(`🔄 预渲染路由: /, /create, /privacy, /pricing, /models, /models-intro`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 预渲染配置 - 仅在生产构建时启用
  const prerenderPlugin = isProduction && isBuild
    ? Prerender({
      // 扩展预渲染路由，覆盖所有公开的静态页面
      routes: ['/', '/create', '/privacy', '/pricing', '/models', '/models-intro'],
      renderer: new PuppeteerRenderer({
        // 等待页面渲染完成的条件
        renderAfterTime: 3000, // 等待 3 秒确保页面完全加载
        // Puppeteer 启动选项
        launchOptions: {
          headless: true,
          // 移除硬编码路径，增强兼容性(Puppeteer 会自动查找或下载)
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          args: ['--no-sandbox', '--disable-setuid-sandbox'], // 增加 CI 环境兼容性
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

      // 构建分析
      isBuild && visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),

      // Gzip 压缩 (标准压缩，兼容性好)
      isBuild && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // > 10kb 的文件才压缩
        deleteOriginFile: false, // 保留源文件
        verbose: true,
      }),

      // Brotli 压缩 (高压缩比，现代浏览器支持)
      isBuild && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false,
        verbose: true,
      }),

      // 图片压缩配置
      isBuild && viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 20,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }),
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
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
    esbuild: {
      // 生产环境移除 console 和 debugger
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    build: {
      outDir: 'lab', // 输出目录（默认 dist，可修改如 'build'）
      assetsDir: 'assets', // 静态资源目录（默认 assets）
      emptyOutDir: true, // 构建前清空输出目录，避免残留旧文件
      sourcemap: isProduction ? false : true, // 生产环境关闭 SourceMap，减小体积
      minify: isProduction ? 'esbuild' : false, // 生产环境启用压缩（使用 esbuild，更快）
      target: 'es2015', // 兼容性目标
      cssCodeSplit: true, // 启用 CSS 代码拆分
      reportCompressedSize: false, // 关闭 gzip 压缩大小报告，提高构建速度
      chunkSizeWarningLimit: 1500, // 调整 chunk 大小警告阈值 (kB)
      rollupOptions: {
        // 代码分割配置（按需拆分第三方库如 react/react-dom）
        output: {
          manualChunks: (id) => {
            // 将 node_modules 中的库拆分
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('three') || id.includes('@types/three')) {
                return 'three-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'ui-icons';
              }
              if (id.includes('cropperjs') || id.includes('react-cropper')) {
                return 'image-utils';
              }
              if (id.includes('zustand') || id.includes('immer')) {
                return 'state-mgmt';
              }
              // 其他第三方库统一打包
              return 'vendor';
            }
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
