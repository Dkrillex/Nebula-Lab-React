import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist', // 输出目录（默认 dist，可修改如 'build'）
    assetsDir: 'assets', // 静态资源目录（默认 assets）
    sourcemap: false, // 是否生成 SourceMap（生产环境建议关闭，减小体积）
    // minify: 'terser', // 压缩工具（默认 terser，比 esbuild 压缩率更高）
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
    },
  },
});
