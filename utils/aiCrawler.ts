
import { SEOConfig, defaultSEOConfig } from './seo';

export interface AICrawlerConfig {
  enableAI: boolean;
  aiDescription?: string;
  aiTitle?: string;
  contentSummary?: string; // 专为 AI 生成的简短摘要
  knowledgeGraph?: { // 补充知识图谱信息
    entityType: string;
    entityName: string;
    relatedTopics: string[];
  };
}

/**
 * AI 爬虫专用 Meta 标签更新
 * 针对 Google SGE, ChatGPT, Bing Chat 等优化
 */
export const updateAICrawlerTags = (config: SEOConfig, aiConfig: AICrawlerConfig) => {
  if (!aiConfig.enableAI) return;

  const setMeta = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 1. AI 专用描述 (如有) - 这是一个假设的标签，部分 AI 可能会优先读取特定前缀
  // 目前大部分 AI 仍然主要依赖 description 和 og:description
  // 但我们可以添加语义化更强的标签
  
  if (aiConfig.aiDescription) {
    setMeta('ai-description', aiConfig.aiDescription);
    // 同时作为备用 description
    if (!config.description) {
        setMeta('description', aiConfig.aiDescription);
    }
  }

  // 2. 允许 AI 索引
  setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. 声明内容来源 (如果是 AI 生成的，建议标注)
  setMeta('generator', 'Nebula Lab AI Platform');

  // 4. 添加语义标记 (Semantic Tags)
  // 这不是标准 meta，但在 HTML 结构中，应使用 <article>, <section> 等语义化标签
  // 这里我们主要处理 head 部分

  // 5. Google 专用：nosnippet 可以在这里控制，但我们通常希望被索引
};

/**
 * 生成适合 AI 阅读的纯文本摘要
 * 用于注入到页面的隐藏部分或特定 meta 中，帮助 LLM 快速抓取核心信息
 */
export const generateAIReadMe = (config: SEOConfig, aiConfig: AICrawlerConfig): string => {
  return `
    Title: ${aiConfig.aiTitle || config.title}
    Summary: ${aiConfig.contentSummary || config.description || defaultSEOConfig.description}
    Keywords: ${(config.keywords || defaultSEOConfig.keywords).join(', ')}
    Type: ${config.type || defaultSEOConfig.type}
    Topics: ${aiConfig.knowledgeGraph?.relatedTopics.join(', ') || ''}
  `.trim();
};

