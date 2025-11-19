import { request } from '../lib/request';
import { ApiResponse } from '../types';

// ==================== 模型相关 Types ====================

export interface ModelsVO {
  id: string | number;
  modelName: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  tags?: string;
  vendorId?: string | number;
  endpoints?: string;
  status?: number;
  createdTime?: number;
  updatedTime?: number;
  deletedAt?: string;
  nameRule?: number;
  flag?: number; // 标示,1-新发布 2-火爆 3-最先进
  sortOrder?: number;
}

export interface ModelsQuery {
  pageNum?: number;
  pageSize?: number;
  modelName?: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  tags?: string;
  vendorId?: string | number;
  endpoints?: string;
  status?: number;
  createdTime?: number;
  updatedTime?: number;
  deletedAt?: string;
  nameRule?: number;
  flag?: number;
  sortOrder?: number;
  params?: any;
}

export const modelsService = {
  /**
   * 查询模型列表
   * Endpoint: GET /api/models/list
   */
  getModelsList: (params?: ModelsQuery) => {
    return request.get<ApiResponse<{ rows: ModelsVO[]; total: number }>>('/models/list', {
      params
    });
  },

  /**
   * 查询模型详情
   * Endpoint: GET /api/models/{id}
   */
  getModelInfo: (id: string | number) => {
    return request.get<ApiResponse<ModelsVO>>(`/models/${id}`);
  },
};

