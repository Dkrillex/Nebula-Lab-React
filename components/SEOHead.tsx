
import React, { useEffect } from 'react';
import { 
  SEOConfig, 
  updateMetaTags, 
  generateStructuredData, 
  injectJSONLD, 
  defaultSEOConfig 
} from '../utils/seo';
import { 
  AICrawlerConfig, 
  updateAICrawlerTags 
} from '../utils/aiCrawler';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  aiConfig?: Partial<AICrawlerConfig>;
  children?: React.ReactNode;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type,
  author,
  publishedTime,
  modifiedTime,
  aiConfig,
}) => {
  useEffect(() => {
    const config: SEOConfig = {
      title: title || defaultSEOConfig.title,
      description: description || defaultSEOConfig.description,
      keywords: keywords || defaultSEOConfig.keywords,
      image: image,
      url: url || window.location.href,
      type: type || 'website',
      author: author,
      publishedTime,
      modifiedTime,
    };

    const aiCrawlerConfig: AICrawlerConfig = {
      enableAI: true,
      aiTitle: title,
      aiDescription: description, // 可以专门为 AI 设置不同的描述
      contentSummary: description,
      ...aiConfig
    };

    // 1. 更新基础 SEO Meta 标签
    updateMetaTags(config);

    // 2. 更新 AI 爬虫专用标签
    updateAICrawlerTags(config, aiCrawlerConfig);

    // 3. 生成并注入结构化数据
    const structuredData = generateStructuredData(config, {
        summary: aiCrawlerConfig.contentSummary,
        highlights: keywords
    });
    injectJSONLD(structuredData);

    // 清理函数（可选，例如离开页面时恢复默认标题，但单页应用通常会被新页面的 SEOHead 覆盖）
    return () => {
      // 可以在这里做一些清理工作
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, aiConfig]);

  return null; // 此组件不渲染任何 DOM 元素，只操作 Head
};

export default SEOHead;
