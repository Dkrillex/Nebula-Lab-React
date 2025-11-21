import { request } from '../lib/request';
import { ApiResponse } from '../types';
import { useAuthStore } from '../stores/authStore';

// 视频生成请求参数
export interface VideoGenerateRequest {
  model: string;
  prompt: string;
  user_id?: string;
  // sora-2 模型参数
  width?: number;
  height?: number;
  seconds?: number; // 视频时长
  input_reference?: string; // 参考图片（base64）
  remix_video_id?: string; // Remix视频ID
  // Veo 模型参数
  durationSeconds?: number; // 4/6/8
  aspectRatio?: string; // '16:9' | '9:16'
  resolution?: string; // '720p' | '1080p'
  fps?: number; // 帧率
  image?: string; // 首帧图片（base64）
  lastFrame?: string; // 尾帧图片（base64）
  // wan2.5 模型参数
  duration?: number; // 5 or 10
  size?: string; // t2v模型使用，如 "1280*720"
  smart_rewrite?: boolean;
  generate_audio?: boolean;
  seed?: number;
  audio_url?: string;
  // doubao 模型参数
  content?: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
    role?: 'first_frame' | 'last_frame' | 'reference_image';
  }>;
}

// 视频生成任务提交响应
export interface VideoGenerateSubmitResponse {
  code: number;
  msg?: string;
  data?: {
    task_id: string;
  };
}

// 视频生成任务查询响应
export interface VideoGenerateQueryResponse {
  code: number;
  msg?: string;
  data?: {
    task_id: string;
    status: string; // 'succeeded' | 'failed' | 'processing' | 'pending'
    video_url?: string;
    error?: string;
    progress?: number;

  };
}

export const videoGenerateService = {
  /**
   * 提交视频生成任务
   * Endpoint: POST /ads/playground/video/completions
   */
  submitVideoTask: async (data: VideoGenerateRequest): Promise<VideoGenerateSubmitResponse> => {
    const { user } = useAuthStore.getState();
    
    const requestData = {
      ...data,
      user_id: user?.nebulaApiId || '',
    };

    return request.post<VideoGenerateSubmitResponse>('/ads/playground/video/completions', requestData, {
      timeout: 60000, // 60秒超时
    });
  },

  /**
   * 查询视频生成任务状态
   * Endpoint: GET /ads/playground/video/completions/{task_id}?user_id={user_id}
   */
  queryVideoTask: async (taskId: string): Promise<VideoGenerateQueryResponse> => {
    const { user } = useAuthStore.getState();
    
    return request.get<VideoGenerateQueryResponse>(`/ads/playground/video/completions/${taskId}`, {
      params: {
        user_id: user?.nebulaApiId || '',
      },
      timeout: 30000,
    });
  },
};

