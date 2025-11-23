import { request } from '../lib/request';
import { ApiResponse } from '../types';

// ==================== Traditional Mode Types ====================

export interface TraditionalI2VParams {
  imageFileId?: string; // For Topview/Pro/Best
  imageUrl?: string;    // For Volcano/Lite/Plus
  prompt?: string;
  negativePrompt?: string;
  mode?: 'lite' | 'plus' | 'pro' | 'best';
  duration?: number; // 5, 10, 12
  generatingCount?: number;
  score?: number | string; // 积分
}

// textOrImage2videoSubmit 接口参数（火山引擎）
export interface TextOrImage2VideoSubmitParams {
  image_urls: string[]; // 图片URL数组
  prompt?: string;      // 提示词
  duration?: number;    // 视频时长（数值，如 5, 10, 12）
  score?: number;       // 积分
  resolution?: string;  // 分辨率：'480p', '720p', '1080p', 'best'
}

export interface TraditionalI2VResult {
  taskId?: string;
  id?: string; // 火山引擎返回的是 id
  status?: string;
  msg?: string;
  message?: string;
  result?: any;
  data?: any; // Im model returns data
}

// ==================== Start/End Frame Mode Types ====================

export interface StartEndI2VParams {
  imageUrls: string[]; // [startImageUrl, endImageUrl]
  prompt?: string;
  duration?: number;
  score?: number;
}

// ==================== Multi-Model Mode Types ====================

export interface MultiModelI2VParams {
  prompt: string;
  imageFileId?: string[];
  imageFileUrl?: string[];
  negativePrompt?: string;
  duration?: string;
  modelId: string;
  score?: number;
  // file?: File; // Typically not sent directly in JSON
}

export interface MultiModelQueryRequest {
  taskId: string;
  modelId: string;
}

// ==================== Common Query Result Types ====================

// 火山引擎返回的视频内容
export interface VolcanoVideoContent {
  video_url?: string;
  last_frame_url?: string | null;
  file_url?: string | null;
}

// 火山引擎任务查询结果
export interface VolcanoI2VTaskResult {
  id: string;
  status: string; // 'succeeded', 'failed', 'processing', 'pending' 等
  error?: string | null;
  content?: VolcanoVideoContent;
  model?: string;
  framesPerSecond?: number;
  created_at?: number;
  updated_at?: number;
  [key: string]: any; // 其他字段
}

// 通用任务查询结果（兼容两种格式）
export interface I2VTaskResult {
  taskId?: string;
  id?: string; // 火山引擎返回的是 id
  status: string; // 'succeeded', 'success', 'failed', 'fail', 'processing', 'init' 等
  errorMsg?: string;
  error?: string | null; // 火山引擎的错误字段
  videoUrl?: string;
  coverUrl?: string;
  progress?: number;
  content?: VolcanoVideoContent; // 火山引擎的视频内容
  videos?: any[]; // Some models return array of videos
  filePath?: string; // Some models return filePath
}

// 质量模式到分辨率的映射
const qualityToResolution: Record<string, string> = {
  lite: '480p',
  pro: '720p',
  plus: '1080p',
  best: 'best',
};

export const imageToVideoService = {
  /**
   * Traditional Mode Submit
   * Uses /tp/v1/CommonI2VSubmit for Pro/Best or /tp/v1/textOrImage2videoSubmit for Lite/Plus
   */
  submitTraditional: (data: TraditionalI2VParams) => {
    if (data.mode === 'lite' || data.mode === 'plus'|| data.mode === 'pro') {
       // Volcano Engine - textOrImage2videoSubmit
       const params: TextOrImage2VideoSubmitParams = {
         image_urls: data.imageUrl ? [data.imageUrl] : [],
         prompt: data.prompt,
         duration: typeof data.duration === 'string' ? parseInt(data.duration) : data.duration,
         score: typeof data.score === 'string' ? parseFloat(data.score) : (data.score as number),
         resolution: data.mode ? qualityToResolution[data.mode] : undefined,
       };
       return request.post<ApiResponse<TraditionalI2VResult>>('/tp/v1/textOrImage2videoSubmit', params);
    } else {
       // Topview (Pro/Best) - CommonI2VSubmit
       return request.post<ApiResponse<TraditionalI2VResult>>('/tp/v1/CommonI2VSubmit', {
         imageFileId: data.imageFileId,
         prompt: data.prompt,
         negativePrompt: data.negativePrompt,
         mode: data.mode,
         duration: data.duration?.toString(),
         generatingCount: data.generatingCount
       });
    }
  },

  /**
   * Traditional Mode Query
   */
  queryTraditional: (taskId: string, isVolcano: boolean = false) => {
    if (isVolcano) {
       // 火山引擎返回 VolcanoI2VTaskResult 格式
       return request.get<ApiResponse<VolcanoI2VTaskResult>>(`/tp/v1/textOrImage2videoQuery/${taskId}`);
    } else {
       // Topview 返回标准格式
       return request.get<ApiResponse<I2VTaskResult>>('/tp/v1/CommonI2VQuery', {
         params: { taskId, needCloudFrontUrl: true }
       });
    }
  },

  /**
   * Start/End Frame Mode Submit
   * Uses /tp/v1/textOrImage2videoSubmit (Same as Traditional Lite/Plus)
   */
  submitStartEnd: (data: StartEndI2VParams) => {
    const params: TextOrImage2VideoSubmitParams = {
      image_urls: data.imageUrls,
      prompt: data.prompt,
      duration: data.duration,
      score: data.score,
      resolution: '720p' // Default for Start/End or adjust as needed
    };
    return request.post<ApiResponse<TraditionalI2VResult>>('/tp/v1/textOrImage2videoSubmit', params);
  },

  /**
   * Start/End Frame Mode Query
   * Uses /tp/v1/textOrImage2videoQuery/{taskId}
   */
  queryStartEnd: (taskId: string) => {
     return request.get<ApiResponse<VolcanoI2VTaskResult>>(`/tp/v1/textOrImage2videoQuery/${taskId}`);
  },

  /**
   * Multi-Model Submit
   */
  submitMultiModel: (data: MultiModelI2VParams) => {
    // Typically sends JSON
    return request.post<ApiResponse<TraditionalI2VResult>>('/tp/v1/multiImg2VideoSubmit', data);
  },

  /**
   * Multi-Model Query
   */
  queryMultiModel: (taskId: string, modelId: string) => {
    return request.get<ApiResponse<I2VTaskResult>>('/tp/v1/multiImg2VideoQuery', {
      params: { taskId, modelId }
    });
  }
};
