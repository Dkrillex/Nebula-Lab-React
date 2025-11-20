
import { AIModel, ExpenseRecord, Asset } from './types';

// Backend Configuration
// 根据环境变量设置 API 基础路径
// 生产环境使用 /prod-api，开发环境使用 /api
export const API_BASE_URL = import.meta.env.PROD ? '/prod-api' : '/dev-api';
export const API_TIMEOUT = 10000; // 10 seconds

// Client ID for authentication
export const CLIENT_ID = 'e5cd7e4891bf95d1d19206ce24a7b32e';
export const GRANT_TYPE = 'password';
export const TENANT_ID = '000000';

// RSA密钥配置
// RSA公钥 - 用于请求加密（加密AES密钥）
export const RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdHnzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==';

// RSA私钥 - 用于响应解密（解密后端返回的加密数据）
export const RSA_PRIVATE_KEY = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAmc3CuPiGL/LcIIm7zryCEIbl1SPzBkr75E2VMtxegyZ1lYRD+7TZGAPkvIsBcaMs6Nsy0L78n2qh+lIZMpLH8wIDAQABAkEAk82Mhz0tlv6IVCyIcw/s3f0E+WLmtPFyR9/WtV3Y5aaejUkU60JpX4m5xNR2VaqOLTZAYjW8Wy0aXr3zYIhhQQIhAMfqR9oFdYw1J9SsNc+CrhugAvKTi0+BF6VoL6psWhvbAiEAxPPNTmrkmrXwdm/pQQu3UOQmc2vCZ5tiKpW10CgJi8kCIFGkL6utxw93Ncj4exE/gPLvKcT+1Emnoox+O9kRXss5AiAMtYLJDaLEzPrAWcZeeSgSIzbL+ecokmFKSDDcRske6QIgSMkHedwND1olF8vlKsJUGK3BcdtM8w4Xq7BpSBwsloE=';

export const MODELS: AIModel[] = [
  {
    id: 'openai/gpt-5.1-codex',
    name: 'gpt-5.1-codex',
    description: 'GPT-5.1-codex: 在 GPT-5-codex 的基础上进一步增强了开发者工具链，强化推理框架，支持上下文感知的代码分析与生成。',
    provider: 'OpenAI',
    contextLength: 1000000,
    inputPrice: 1.25,
    outputPrice: 1.25,
    isNew: true,
    tags: ['Coding', 'Reasoning'],
    capabilities: ['对话', '代码能力'],
    billingType: 'token'
  },
  {
    id: 'openai/gpt-5.1',
    name: 'gpt-5.1',
    description: 'GPT-5.1 重点提升"按需推理"能力，面对不同难度的任务可自动调整推理深度。核心能力包括：1）自适应推理...',
    provider: 'OpenAI',
    contextLength: 1000000,
    inputPrice: 1.25,
    outputPrice: 1.25,
    isNew: true,
    tags: ['General', 'Reasoning'],
    capabilities: ['对话', '思考', '推理'],
    billingType: 'token'
  },
  {
    id: 'openai/gpt-5.1-chat',
    name: 'gpt-5.1-chat',
    description: 'GPT-5.1-chat: 首次在聊天场景引入链式思维，带来更快、更自然、更具上下文感知的对话体验。它不仅响应快...',
    provider: 'OpenAI',
    contextLength: 1000000,
    inputPrice: 1.25,
    outputPrice: 1.25,
    isNew: true,
    tags: ['Chat', 'Fast'],
    capabilities: ['对话'],
    billingType: 'token'
  },
  {
    id: 'openai/gpt-5.1-codex-mini',
    name: 'gpt-5.1-codex-mini',
    description: 'GPT-5.1-codex-mini: 轻量高效，专为资源受限、成本敏感场景打造（如教育、初创企业），性能接近主力模型...',
    provider: 'OpenAI',
    contextLength: 1000000,
    inputPrice: 0.25,
    outputPrice: 0.25,
    isNew: true,
    tags: ['Efficient', 'Coding'],
    capabilities: ['对话', '代码能力'],
    billingType: 'token'
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'gemini-3-pro-preview',
    description: 'Gemini 3 Pro Preview 是一款强大的智能体和编码模型。它具有 1M 令牌的上下文窗口，并拥有最佳的多模态理解能力。',
    provider: 'Google',
    contextLength: 1000000,
    inputPrice: 2.00,
    outputPrice: 2.00,
    isNew: true,
    tags: ['Multimodal', 'Reasoning'],
    capabilities: ['对话', '思考'],
    billingType: 'token'
  },
  {
    id: 'wan/wan2.5-i2v-preview',
    name: 'wan2.5-i2v-preview',
    description: '通义万相2.5-图生视频-Preview，全新升级技术架构，支持与画面同步的声音生成，支持10秒长视频生成...',
    provider: '通义万象',
    contextLength: 0,
    inputPrice: 0.0738,
    outputPrice: 0.0738,
    isNew: true,
    tags: ['Video', 'Image-to-Video'],
    capabilities: ['图生视频'],
    billingType: 'time'
  },
  {
    id: 'openai/sora-2',
    name: 'sora-2',
    description: 'Sora2 是 OpenAI 推出的旗舰级视频 + 音频生成模型，在物理模拟真实性、多镜头叙事可控性、音画同步生成能力...',
    provider: 'OpenAI',
    contextLength: 0,
    inputPrice: 0.10,
    outputPrice: 0.10,
    isNew: true,
    tags: ['Video', 'Flagship'],
    capabilities: ['文生视频'],
    billingType: 'time'
  },
  {
    id: 'claude/claude-sonnet-4.5',
    name: 'claude-sonnet-4-5-20250929',
    description: 'Claude Sonnet 4.5 展示了代理能力的进步，在工具处理、内存管理和上下文处理方面性能得到增强...',
    provider: 'Claude',
    contextLength: 200000,
    inputPrice: 3.00,
    outputPrice: 3.00,
    isNew: true,
    tags: ['Reasoning', 'Agent'],
    capabilities: ['对话', '思考'],
    billingType: 'token'
  },
  {
    id: 'claude/claude-haiku-4.5',
    name: 'claude-haiku-4-5-20251001',
    description: 'Claude Haiku 4.5 是 Anthropic 效率最高的模型，能够快速且经济高效地提供接近前沿的性能。具体来说...',
    provider: 'Claude',
    contextLength: 200000,
    inputPrice: 1.10,
    outputPrice: 1.10,
    isNew: true,
    tags: ['Efficient', 'Fast'],
    capabilities: ['对话', '思考'],
    billingType: 'token'
  },
   {
    id: 'wan/wan2.5-t2v-preview',
    name: 'wan2.5-t2v-preview',
    description: '通义万相2.5-文生视频-Preview，全新升级技术架构，支持与画面同步的声音生成。',
    provider: '通义万象',
    contextLength: 0,
    inputPrice: 0.08,
    outputPrice: 0.08,
    isNew: true,
    tags: ['Video', 'Text-to-Video'],
    capabilities: ['文生视频'],
    billingType: 'time'
  },
  {
    id: 'google/veo-3.1-generate-preview',
    name: 'veo-3.1-generate-preview',
    description: 'Google Veo 3.1 提供了高质量的视频生成能力，支持复杂的指令和物理模拟。',
    provider: 'Google',
    contextLength: 0,
    inputPrice: 0.15,
    outputPrice: 0.15,
    isNew: true,
    tags: ['Video'],
    capabilities: ['文生视频'],
    billingType: 'time'
  },
   {
    id: 'google/veo-3.1-fast-generate-preview',
    name: 'veo-3.1-fast-generate-preview',
    description: 'Google Veo 3.1 Fast 专注于快速生成视频，适用于快速迭代和预览。',
    provider: 'Google',
    contextLength: 0,
    inputPrice: 0.05,
    outputPrice: 0.05,
    isNew: true,
    tags: ['Video', 'Fast'],
    capabilities: ['文生视频'],
    billingType: 'time'
  }
];

export const MOCK_EXPENSES: ExpenseRecord[] = [
  {
    id: '1',
    modelName: 'gemini-3-pro-preview',
    cost: -0.064824,
    type: 'consumption',
    duration: '9s',
    inputTokens: 204,
    outputTokens: 706,
    timestamp: '2025-11-19 11:12:31',
    icon: 'robot'
  },
  {
    id: '2',
    modelName: 'gemini-3-pro-preview',
    cost: -0.034149,
    type: 'consumption',
    duration: '5s',
    inputTokens: 101,
    outputTokens: 373,
    timestamp: '2025-11-19 11:12:11',
    icon: 'robot'
  },
  {
    id: '3',
    modelName: 'gemini-3-pro-preview',
    cost: -0.027317,
    type: 'consumption',
    duration: '6s',
    inputTokens: 59,
    outputTokens: 302,
    timestamp: '2025-11-19 11:11:59',
    icon: 'robot'
  },
  {
    id: '4',
    modelName: 'gemini-3-pro-preview',
    cost: -0.065627,
    type: 'consumption',
    duration: '11s',
    inputTokens: 19,
    outputTokens: 746,
    timestamp: '2025-11-19 11:11:46',
    icon: 'robot'
  },
  {
    id: '5',
    modelName: 'wan2.5-i2v-preview',
    cost: -2.693700,
    type: 'consumption',
    duration: '108s',
    inputTokens: 0,
    outputTokens: 5,
    timestamp: '2025-11-18 20:39:00',
    icon: 'robot'
  },
  {
    id: '6',
    modelName: 'doubao-seedance-1-0-pro-250528',
    cost: -3.702969,
    type: 'consumption',
    duration: '61s',
    inputTokens: 0,
    outputTokens: 246840,
    timestamp: '2025-11-18 20:34:26',
    icon: 'robot'
  }
];

export const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Shoes', type: 'folder', date: '10/11/25, 4:36 PM' },
  { id: '2', name: 'Clothes', type: 'folder', date: '10/10/25, 11:10 AM', tag: 'Test' },
  { id: '3', name: 'Test Folder', type: 'folder', date: '9/30/25, 2:32 PM', tag: 'Test Folder' },
  { id: '4', name: '0723_Voice_Synthesis', type: 'audio', date: '9/17/25, 11:43 AM', tag: 'Voice Clone' },
  { id: '5', name: '0723_Voice_Synthesis_2', type: 'audio', date: '9/17/25, 11:30 AM', tag: 'Voice Clone' },
  { id: '6', name: 'Product_Demo_Honey', type: 'image', date: '8/4/25, 3:06 PM', tag: 'Digital Human', thumbnail: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1974&auto=format&fit=crop' },
  { id: '7', name: 'Product_Demo_Face', type: 'image', date: '8/4/25, 2:58 PM', tag: 'Digital Human', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop' },
  { id: '8', name: 'Nakashima_Mika', type: 'video', date: '8/4/25, 2:50 PM', tag: 'Video Gen', thumbnail: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=2070&auto=format&fit=crop' },
  { id: '9', name: 'demo11', type: 'image', date: '8/4/25, 2:43 PM', tag: 'Digital Human', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop' },
  { id: '10', name: 'Violet_Synthesis', type: 'audio', date: '8/1/25, 5:14 PM', tag: 'Voice Clone' },
];
