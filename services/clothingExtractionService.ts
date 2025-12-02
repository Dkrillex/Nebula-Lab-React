import { request } from '../lib/request';
import { ApiResponse } from '../types';

// ==================== Clothing Extraction Types ====================

export interface ClothingExtractionParams {
    imageFileId: string; // 图片文件ID
    templateType?: 'full_outfit' | 'top_front' | 'bottom_front' | 'custom'; // 模板类型
    customPrompt?: string; // 自定义模板描述（当templateType为custom时）
    generatingCount?: number; // 生成数量 1-4
    score?: string; // 积分
}

export interface ClothingExtractionResult {
    taskId: string;
    status: string;
    errorMsg?: string;
    msg?: string;
}

export interface ClothingExtractionTaskResult {
    taskId: string;
    taskStatus: string; // 'init', 'running', 'success', 'fail'
    errorMsg?: string;
    progress?: number;
    resultImages?: Array<{
        url: string;
        imageId?: string;
    }>;
    images?: string[]; // 兼容不同格式
}

export interface RecentTask {
    taskId: string;
    imageUrl: string;
    resultImages?: string[];
    createdAt: string;
    status: string;
}

export const clothingExtractionService = {
    /**
     * 提交商品提取任务
     * Endpoint: /tp/v2/product/extraction/submit
     */
    submitExtraction: (data: ClothingExtractionParams) => {
        return request.post<ApiResponse<ClothingExtractionResult>>('/tp/v2/product/extraction/submit', data, {
            timeout: 300000 // 5分钟超时
        });
    },

    /**
     * 查询商品提取任务
     * Endpoint: /tp/v2/product/extraction/query
     */
    queryExtraction: (taskId: string) => {
        return request.get<ApiResponse<ClothingExtractionTaskResult>>('/tp/v2/product/extraction/query', {
            params: { taskId, needCloudFrontUrl: true }
        });
    },

    /**
     * 获取最近任务列表
     * Endpoint: /tp/v2/product/extraction/recent
     */
    getRecentTasks: (params?: { pageNo?: number; pageSize?: number }) => {
        return request.get<ApiResponse<{ data: RecentTask[]; total: number }>>('/tp/v2/product/extraction/recent', {
            params
        });
    }
};

