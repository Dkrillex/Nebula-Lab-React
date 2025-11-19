
import { request } from '../lib/request';
import { AIModel } from '../types';

export const modelService = {
  /**
   * Fetch list of available models
   */
  getModels: (search?: string) => {
    return request.get<AIModel[]>('/models', { params: { search: search || '' } });
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
