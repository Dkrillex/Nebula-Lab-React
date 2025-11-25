
import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { AIModel } from '../../../types';

// 静态模型数据
const STATIC_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI 最新多模态旗舰模型，支持文本、图像、音频输入',
    provider: 'OpenAI',
    contextLength: 128000,
    inputPrice: 2.5,
    outputPrice: 10,
    isNew: true,
    isFree: false,
    tags: ['chat', 'vision', 'reasoning'],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: '轻量级多模态模型，性价比高',
    provider: 'OpenAI',
    contextLength: 128000,
    inputPrice: 0.15,
    outputPrice: 0.6,
    isNew: true,
    isFree: false,
    tags: ['chat', 'vision'],
  },
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    description: 'Anthropic 最新旗舰模型，强大的推理和编码能力',
    provider: 'Anthropic',
    contextLength: 200000,
    inputPrice: 3,
    outputPrice: 15,
    isNew: true,
    isFree: false,
    tags: ['chat', 'code', 'reasoning'],
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: '平衡性能与成本的优秀选择',
    provider: 'Anthropic',
    contextLength: 200000,
    inputPrice: 3,
    outputPrice: 15,
    isFree: false,
    tags: ['chat', 'code'],
  },
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    description: '快速响应，适合简单任务',
    provider: 'Anthropic',
    contextLength: 200000,
    inputPrice: 0.8,
    outputPrice: 4,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google 最新多模态模型，支持实时交互',
    provider: 'Google',
    contextLength: 1000000,
    inputPrice: 0.075,
    outputPrice: 0.3,
    isNew: true,
    isFree: false,
    tags: ['chat', 'vision', 'audio'],
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: '超长上下文窗口，适合文档分析',
    provider: 'Google',
    contextLength: 2000000,
    inputPrice: 1.25,
    outputPrice: 5,
    isFree: false,
    tags: ['chat', 'vision'],
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: '国产高性价比对话模型',
    provider: 'DeepSeek',
    contextLength: 64000,
    inputPrice: 0.14,
    outputPrice: 0.28,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: '专注代码生成与理解',
    provider: 'DeepSeek',
    contextLength: 64000,
    inputPrice: 0.14,
    outputPrice: 0.28,
    isFree: false,
    tags: ['code'],
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    description: '阿里通义千问旗舰模型',
    provider: 'Alibaba',
    contextLength: 32000,
    inputPrice: 2.4,
    outputPrice: 9.6,
    isFree: false,
    tags: ['chat', 'reasoning'],
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    description: '通义千问进阶版，平衡性能与成本',
    provider: 'Alibaba',
    contextLength: 131072,
    inputPrice: 0.8,
    outputPrice: 2,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'qwen-turbo',
    name: 'Qwen Turbo',
    description: '通义千问快速版，响应迅速',
    provider: 'Alibaba',
    contextLength: 131072,
    inputPrice: 0.3,
    outputPrice: 0.6,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    description: 'Meta 开源大模型，性能强劲',
    provider: 'Meta',
    contextLength: 128000,
    inputPrice: 0.59,
    outputPrice: 0.79,
    isNew: true,
    isFree: false,
    tags: ['chat', 'code'],
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    description: '轻量级开源模型，部署灵活',
    provider: 'Meta',
    contextLength: 128000,
    inputPrice: 0.05,
    outputPrice: 0.08,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    description: 'Mistral 旗舰模型，欧洲领先',
    provider: 'Mistral',
    contextLength: 128000,
    inputPrice: 2,
    outputPrice: 6,
    isFree: false,
    tags: ['chat', 'reasoning'],
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    description: '高效紧凑，适合边缘部署',
    provider: 'Mistral',
    contextLength: 32000,
    inputPrice: 0.2,
    outputPrice: 0.6,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'yi-large',
    name: 'Yi Large',
    description: '零一万物旗舰模型',
    provider: '01.AI',
    contextLength: 32000,
    inputPrice: 3,
    outputPrice: 9,
    isFree: false,
    tags: ['chat', 'reasoning'],
  },
  {
    id: 'moonshot-v1-128k',
    name: 'Moonshot v1 128K',
    description: '月之暗面长上下文模型',
    provider: 'Moonshot',
    contextLength: 128000,
    inputPrice: 0.84,
    outputPrice: 0.84,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'glm-4-plus',
    name: 'GLM-4 Plus',
    description: '智谱 AI 旗舰模型',
    provider: 'Zhipu',
    contextLength: 128000,
    inputPrice: 1,
    outputPrice: 1,
    isFree: false,
    tags: ['chat', 'code'],
  },
  {
    id: 'hunyuan-pro',
    name: 'Hunyuan Pro',
    description: '腾讯混元大模型',
    provider: 'Tencent',
    contextLength: 32000,
    inputPrice: 3,
    outputPrice: 9,
    isFree: false,
    tags: ['chat'],
  },
  {
    id: 'ernie-4.0',
    name: 'ERNIE 4.0',
    description: '百度文心一言 4.0',
    provider: 'Baidu',
    contextLength: 8192,
    inputPrice: 4,
    outputPrice: 12,
    isFree: false,
    tags: ['chat', 'reasoning'],
  },
  {
    id: 'spark-4.0-ultra',
    name: 'Spark 4.0 Ultra',
    description: '讯飞星火认知大模型',
    provider: 'iFlytek',
    contextLength: 128000,
    inputPrice: 2.1,
    outputPrice: 2.1,
    isFree: false,
    tags: ['chat'],
  },
];

interface ModelListProps {
  t: {
    explore: string;
    searchPlaceholder: string;
    headers: {
      model: string;
      context: string;
      inputCost: string;
      outputCost: string;
    };
    noResults: string;
    free: string;
    new: string;
  };
}

const ModelList: React.FC<ModelListProps> = ({ t }) => {
  const [search, setSearch] = useState('');

  const filteredModels = useMemo(() => {
    const lower = search.toLowerCase();
    return STATIC_MODELS.filter(m => 
      m.name.toLowerCase().includes(lower) || 
      m.provider.toLowerCase().includes(lower) ||
      m.id.toLowerCase().includes(lower) ||
      m.description.toLowerCase().includes(lower)
    );
  }, [search]);

  const formatPrice = (price: number) => {
    if (price === 0) return t.free;
    return `$${price.toFixed(2)}`;
  };

  const formatContext = (ctx: number) => {
    if (ctx === 0) return '-'; // API might not provide context
    if (ctx >= 1000000) return `${ctx / 1000000}M`;
    if (ctx >= 1000) return `${ctx / 1000}k`;
    return ctx.toString();
  };

  return (
    <div className="container mx-auto px-4 pb-24">
      <div className="rounded-xl border border-border bg-surface/50 backdrop-blur-sm shadow-lg">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-2 text-lg font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
              <Search size={14} />
            </span>
            {t.explore}
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 text-sm text-foreground placeholder-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
          <div className="col-span-6 md:col-span-5">{t.headers.model}</div>
          <div className="col-span-3 hidden md:block text-right">{t.headers.context}</div>
          <div className="col-span-3 md:col-span-2 text-right">{t.headers.inputCost}</div>
          <div className="col-span-3 md:col-span-2 text-right">{t.headers.outputCost}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {filteredModels.map((model) => (
            <ModelRow 
              key={model.id} 
              model={model} 
              formatContext={formatContext} 
              formatPrice={formatPrice} 
              t={t}
            />
          ))}
          
          {filteredModels.length === 0 && (
             <div className="py-12 text-center text-muted">
               {t.noResults} "{search}"
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModelRowProps {
  model: AIModel;
  formatContext: (n: number) => string;
  formatPrice: (n: number) => string;
  t: ModelListProps['t'];
}

const ModelRow: React.FC<ModelRowProps> = ({ model, formatContext, formatPrice, t }) => {
  return (
    <div className="group grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-foreground/5 items-center">
      {/* Name & Metadata */}
      <div className="col-span-6 md:col-span-5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground group-hover:text-indigo-500 transition-colors truncate">
            {model.name}
          </span>
          {model.isNew && (
            <span className="hidden sm:inline-flex rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400 border border-green-500/20">
              {t.new}
            </span>
          )}
          {model.isFree && (
            <span className="hidden sm:inline-flex rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {t.free}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted truncate">
          <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-foreground/80">
            {model.provider}
          </span>
          <span className="hidden sm:inline opacity-50">•</span>
          <span className="hidden sm:inline truncate opacity-80">{model.description}</span>
        </div>
      </div>

      {/* Context */}
      <div className="col-span-3 hidden md:block text-right text-sm text-muted font-mono">
        {formatContext(model.contextLength)}
      </div>

      {/* Input Price */}
      <div className="col-span-3 md:col-span-2 text-right text-sm text-muted font-mono">
        {formatPrice(model.inputPrice)}
        <span className="text-xs opacity-50 ml-1">/M</span>
      </div>

      {/* Output Price */}
      <div className="col-span-3 md:col-span-2 text-right text-sm text-muted font-mono flex items-center justify-end gap-2">
        <div>
          {formatPrice(model.outputPrice)}
          <span className="text-xs opacity-50 ml-1">/M</span>
        </div>
        <button className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded bg-foreground text-background opacity-0 transition-all group-hover:opacity-100">
            <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ModelList;
