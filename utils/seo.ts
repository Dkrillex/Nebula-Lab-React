
export interface SEOConfig {
    title: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
}

export interface AIConfig {
    summary?: string;
    highlights?: string[];
    generatedBy?: string;
}

export const defaultSEOConfig = {
    title: 'Nebula Lab - AI 创作平台',
    description: 'Nebula Lab 是一个先进的 AI 创作平台，提供文本生成图片、视频生成、数字人、声音克隆等多种 AI 工具，助您释放无限创意。',
    keywords: ['AI', '人工智能', '创作平台', 'Nebula Lab', 'AI绘画', 'AI视频', '数字人', '声音克隆'],
    type: 'website',
    siteName: 'Nebula Lab',
    twitterHandle: '@NebulaLab', // 假设的 Twitter 账号
};

/**
 * 生成结构化数据 (JSON-LD)
 */
export const generateStructuredData = (config: SEOConfig, aiConfig?: AIConfig) => {
    const baseData = {
        '@context': 'https://schema.org',
        '@type': config.type === 'article' ? 'Article' : 'WebSite',
        name: config.title,
        description: config.description || defaultSEOConfig.description,
        url: config.url || window.location.href,
        image: config.image,
        author: {
            '@type': 'Organization',
            name: defaultSEOConfig.siteName,
        },
        publisher: {
            '@type': 'Organization',
            name: defaultSEOConfig.siteName,
            logo: {
                '@type': 'ImageObject',
                url: `${window.location.origin}/img/lab.png`,
            },
        },
        datePublished: config.publishedTime,
        dateModified: config.modifiedTime,
    };

    // AI 增强数据
    if (aiConfig) {
        return {
            ...baseData,
            abstract: aiConfig.summary, // 非标准 Schema，但有助于 AI 理解
            keywords: config.keywords?.join(', '),
            about: aiConfig.highlights?.map(highlight => ({
                '@type': 'Thing',
                name: highlight
            }))
        };
    }

    return baseData;
};

/**
 * 设置页面 Meta 标签
 * 注意：在 SPA 中，这通常用于客户端更新，
 * 但对于 SEO，预渲染（Prerender）时执行此代码更为重要。
 */
export const updateMetaTags = (config: SEOConfig) => {
    // 更新标题
    document.title = `${config.title} | ${defaultSEOConfig.siteName}`;

    // 辅助函数：设置或创建 meta 标签
    const setMeta = (name: string, content: string, attribute = 'name') => {
        let element = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attribute, name);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // 基础 Meta
    setMeta('description', config.description || defaultSEOConfig.description);
    setMeta('keywords', (config.keywords || defaultSEOConfig.keywords).join(', '));
    setMeta('author', config.author || defaultSEOConfig.siteName);

    // Open Graph
    setMeta('og:title', config.title, 'property');
    setMeta('og:description', config.description || defaultSEOConfig.description, 'property');
    setMeta('og:type', config.type || defaultSEOConfig.type, 'property');
    setMeta('og:url', config.url || window.location.href, 'property');
    if (config.image) {
        setMeta('og:image', config.image, 'property');
    }
    setMeta('og:site_name', defaultSEOConfig.siteName, 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:site', defaultSEOConfig.twitterHandle);
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.description || defaultSEOConfig.description);
    if (config.image) {
        setMeta('twitter:image', config.image);
    }

    // 更新 Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', config.url || window.location.href);
};

/**
 * 注入 JSON-LD
 */
export const injectJSONLD = (data: any) => {
    const scriptId = 'seo-json-ld';
    let script = document.getElementById(scriptId);

    if (script) {
        script.remove();
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
};
