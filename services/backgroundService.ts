import { request } from '../lib/request';
import { ApiResponse } from '../types';

// 提交背景去除任务参数
export interface RemoveBackgroundSubmitParams {
  productImageFileId: string;
}

// 提交背景去除任务结果
export interface RemoveBackgroundSubmitResult {
  taskId: string;
  status?: string;
}

// 查询背景去除任务结果
export interface RemoveBackgroundQueryResult {
  taskId: string;
  status: string; // init/running/success/fail
  resultImageFileId?: string;
  resultImageUrl?: string;
  errorMsg?: string;
}

export const backgroundService = {
  /**
   * 提交背景去除任务
   * @param data 包含产品图片文件ID的参数
   * @returns 任务ID
   */
  submitRemoveBackground: async (data: RemoveBackgroundSubmitParams): Promise<RemoveBackgroundSubmitResult> => {
    const response = await request.post<ApiResponse<RemoveBackgroundSubmitResult>>(
      '/tp/v2/remove/background/submit',
      data
    );
    return response;
  },

  /**
   * 查询背景去除任务结果
   * @param taskId 任务ID
   * @returns 任务结果，包含处理后的图片URL
   */
  queryRemoveBackground: async (taskId: string): Promise<RemoveBackgroundQueryResult> => {
    const response = await request.get<ApiResponse<RemoveBackgroundQueryResult>>(
      '/tp/v2/remove/background/query',
      {
        params: { taskId, needCloudFrontUrl: true },
      }
    );
    return response;
  },
};


