
import { AIModel } from './types';

// Backend Configuration
export const API_BASE_URL = 'https://api.nebulalab.com/v1'; // Replace with real backend URL
export const API_TIMEOUT = 10000; // 10 seconds

export const MODELS: AIModel[] = [
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Google\'s fastest and most cost-efficient multimodal model.',
    provider: 'Google',
    contextLength: 1000000,
    inputPrice: 0.075,
    outputPrice: 0.30,
    isNew: true,
    tags: ['Multimodal', 'Fast', '1M Context']
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Mid-size multimodal model with massive context window.',
    provider: 'Google',
    contextLength: 2000000,
    inputPrice: 3.50,
    outputPrice: 10.50,
    tags: ['Multimodal', '2M Context']
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'The most intelligent model from Anthropic, excelling at coding and nuance.',
    provider: 'Anthropic',
    contextLength: 200000,
    inputPrice: 3.00,
    outputPrice: 15.00,
    tags: ['Smart', 'Coding']
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s flagship multimodal model with real-time capabilities.',
    provider: 'OpenAI',
    contextLength: 128000,
    inputPrice: 5.00,
    outputPrice: 15.00,
    tags: ['Flagship', 'Popular']
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Small, fast, and cost-effective model for simple tasks.',
    provider: 'OpenAI',
    contextLength: 128000,
    inputPrice: 0.15,
    outputPrice: 0.60,
    tags: ['Fast', 'Cheap']
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    description: 'The largest open-weights model available.',
    provider: 'Meta',
    contextLength: 128000,
    inputPrice: 2.00,
    outputPrice: 2.00,
    tags: ['Open Source', 'Massive']
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'High performance open model, comparable to proprietary models.',
    provider: 'Meta',
    contextLength: 128000,
    inputPrice: 0.40,
    outputPrice: 0.40,
    tags: ['Open Source', 'Efficient']
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large 2',
    description: 'Top-tier reasoning capabilities from Mistral AI.',
    provider: 'Mistral',
    contextLength: 128000,
    inputPrice: 2.00,
    outputPrice: 6.00,
    tags: ['Reasoning', 'French']
  },
  {
    id: 'microsoft/phi-3-medium-128k',
    name: 'Phi-3 Medium',
    description: 'High quality small language model from Microsoft.',
    provider: 'Microsoft',
    contextLength: 128000,
    inputPrice: 0.50,
    outputPrice: 0.50,
    isFree: true,
    tags: ['SLM', 'Efficient']
  },
  {
    id: 'liquid/lfm-40b',
    name: 'Liquid LFM 40B',
    description: 'Specialized model with fluid dynamic architecture.',
    provider: 'Liquid AI',
    contextLength: 32000,
    inputPrice: 0.80,
    outputPrice: 0.80,
    isNew: true,
    tags: ['Experimental']
  }
];
