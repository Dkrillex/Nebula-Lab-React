import { request } from '../lib/request';
import { ApiResponse } from '../types';

/**
 * 3D 模型生成任务请求参数
 */
export interface ThreeDTaskRequest {
  score: string | number;
  model: string;
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

/**
 * 3D 模型生成任务响应
 */
export interface ThreeDTaskResponse {
  id: string;
}

/**
 * 3D 任务查询结果
 */
export interface ThreeDTaskResult {
  status?: 'succeeded' | 'failed' | 'cancelled' | string;
  content?: {
    fileUrl?: string;
  };
}

/**
 * 素材下载请求参数
 */
export interface AdsAssetsDownloadRequest {
  assetFileType?: string;
  assetName?: string;
  assetUrl?: string;
}

/**
 * 素材下载响应
 */
export interface AdsAssetsDownloadResponse {
  url: string;
}

export const threeDModelService = {
  /**
   * 创建 3D 模型生成任务
   * Endpoint: POST /aiTool/v1/threeDTask
   */
  createThreeDTask: (data: ThreeDTaskRequest) => {
    return request.post<ApiResponse<ThreeDTaskResponse>>('/aiTool/v1/threeDTask', data);
  },

  /**
   * 查询 3D 模型生成任务状态
   * Endpoint: GET /aiTool/v1/threeDTaskQuery
   */
  queryThreeDTask: (taskId: string) => {
    return request.get<ApiResponse<ThreeDTaskResult>>('/aiTool/v1/threeDTaskQuery', {
      params: { taskId }
    });
  },

  /**
   * 下载素材文件
   * Endpoint: POST /ads/adsAssets/download
   */
  downloadAssets: (data: AdsAssetsDownloadRequest) => {
    return request.post<ApiResponse<AdsAssetsDownloadResponse>>('/ads/adsAssets/download', data);
  }
};


