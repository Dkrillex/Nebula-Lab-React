
import { request } from '../lib/request';
import { AIModel } from '../types';

export const modelService = {
  /**
   * Fetch list of available models
   */
  getModels: async (search?: string) => {
    try {
      const res = await request.get<any>('/api/pricing/list', { 
        params: { 
          pageNum: 1, 
          pageSize: 1000,
          modelName: search 
        } 
      });
      
      const rows = res.rows || [];
      
      // Map backend pricing list to AIModel structure
      return rows.map((item: any) => ({
        id: item.modelName,
        name: item.modelName, // Backend doesn't seem to have a separate display name in this list
        description: item.remark || '',
        provider: classifyProvider(item.modelName),
        contextLength: 0, // Not available in pricing list
        inputPrice: item.inputPrice || 0,
        outputPrice: item.outputPrice || 0,
        imagePrice: item.imagePrice,
        isNew: false,
        isFree: item.inputPrice === 0 && item.outputPrice === 0,
        tags: classifyTags(item.modelName),
        capabilities: ['chat'], // Defaulting to chat for pricing list items
        billingType: 'token' // Defaulting to token, can update if API provides billing mode
      })) as AIModel[];
    } catch (error) {
      console.error("Failed to fetch models", error);
      return [];
    }
  },

  /**
   * Get details of a specific model
   */
  getModelById: (id: string) => {
    return request.get<AIModel>(`/models/${id}`);
  },

  /**
   * (Optional) Invoke a model (if backend proxies it)
   */
  invokeModel: (modelId: string, prompt: string) => {
    return request.post(`/chat/completions`, { model: modelId, messages: [{ role: 'user', content: prompt }] });
  }
};

// Helper to categorize providers based on model name convention
function classifyProvider(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('gpt') || n.includes('o1')) return 'OpenAI';
  if (n.includes('claude')) return 'Claude';
  if (n.includes('gemini')) return 'Google';
  if (n.includes('midjourney') || n.includes('mj')) return 'Midjourney';
  if (n.includes('qwen')) return 'Alibaba';
  if (n.includes('deepseek')) return 'DeepSeek';
  return 'Other';
}

// Helper to generate tags based on model name
function classifyTags(name: string): string[] {
  const tags: string[] = [];
  const n = name.toLowerCase();
  
  if (n.includes('gpt-4') || n.includes('opus') || n.includes('pro')) tags.push('Smart');
  if (n.includes('flash') || n.includes('haiku') || n.includes('mini')) tags.push('Fast');
  if (n.includes('vision') || n.includes('mj') || n.includes('dall')) tags.push('Image');
  if (n.includes('code')) tags.push('Coding');
  
  return tags;
}
