import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface LabTemplate {
  id: number | string;
  templateName: string;
  templateDesc: string;
  templateType: number; // 1: 文生图, 2: 图生图, 3: 文生视频, 4: 图生视频
  templateUrl: string;
  videoTemplateUrl?: string;
  likeCount: number;
  isLike?: boolean;
  [key: string]: any;
}

export interface LabTemplateQuery {
  pageNum?: number;
  pageSize?: number;
  templateName?: string;
  templateType?: number;
}

export const templateService = {
  /**
   * Get lab template list
   * Endpoint: /ads/labTemplate/list
   * Response: { total: number, rows: LabTemplate[], code: number, msg: string }
   */
  getLabTemplateList: (params: LabTemplateQuery) => {
    // Using LabTemplate as T means ApiResponse<LabTemplate> which has rows: LabTemplate[]
    return request.get<LabTemplate>('/ads/labTemplate/list', {
      params
    });
  },

  /**
   * Update lab template (e.g. like count)
   * Endpoint: /ads/labTemplate
   */
  updateLabTemplate: (data: LabTemplate) => {
    return request.put<void>('/ads/labTemplate', data, {
      successMessageMode: 'message', // 使用动态接口返回的成功消息
    });
  }
};
