
import { request } from '../lib/request';
import { APIKey } from '../types';

export const keyService = {
  /**
   * Get all API keys for the current user
   */
  getKeys: (page = 1, limit = 10) => {
    return request.get<APIKey>('/api-keys', { params: { page, limit } });
  },

  /**
   * Create a new API key
   */
  createKey: (name: string, limit: number | 'unlimited' = 'unlimited') => {
    return request.post<APIKey>('/api-keys', { name, limit });
  },

  /**
   * Delete an API key
   */
  deleteKey: (id: string) => {
    return request.delete(`/api-keys/${id}`);
  },

  /**
   * Update key status (Enable/Disable) or Name
   */
  updateKey: (id: string, data: Partial<Pick<APIKey, 'name' | 'status'>>) => {
    return request.put<APIKey>(`/api-keys/${id}`, data);
  }
};
