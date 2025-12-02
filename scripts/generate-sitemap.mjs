
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://ai-nebula.com'; // 替换为实际域名

// 核心路由配置
const routes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/create', priority: 0.9, changefreq: 'daily' },
  { path: '/create/textToImage', priority: 0.8, changefreq: 'weekly' },
  { path: '/create/imgToVideo', priority: 0.8, changefreq: 'weekly' },
  { path: '/create/digitalHuman', priority: 0.8, changefreq: 'weekly' },
  { path: '/create/voiceClone', priority: 0.8, changefreq: 'weekly' },
  { path: '/models', priority: 0.7, changefreq: 'daily' },
  { path: '/pricing', priority: 0.8, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
];

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
    .map((route) => {
      return `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    })
    .join('\n')}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public'); // 源代码中的 public
  const distDir = path.resolve(__dirname, '../lab');      // 构建输出目录

  // 写入 public 目录（用于开发和下次构建）
  if (fs.existsSync(publicDir)) {
      fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
      console.log('✅ Sitemap generated in public directory');
  }
  
  // 如果构建目录存在，也写入（用于当前构建流程后处理）
  if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
      console.log('✅ Sitemap generated in dist directory');
  }
};

generateSitemap();

