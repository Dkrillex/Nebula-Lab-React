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
  watermark?: boolean;
  camera_fixed?: boolean;
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
// 注意：request.ts 在成功时会返回 resData.data，所以这里定义的是 data 对象的结构
export interface VideoGenerateSubmitResponse {
  task_id?: string; // 直接任务ID
  output?: {
    task_id?: string; // 嵌套的任务ID
  };
  code?: string;
  status_code?: number;
  status?: string;
  message?: string;
  request_id?: string;
}

// 视频生成任务查询响应
// 注意：request.ts 在成功时会返回 resData.data，所以这里定义的是 data 对象的结构
export interface VideoGenerateQueryResponse {
  task_id?: string;
  status: string; // 'succeeded' | 'failed' | 'processing' | 'pending' | 'queued' | 'in_progress'
    video_url?: string;
  url?: string; // 有些模型使用 url 而不是 video_url
  format?: string; // 视频格式（如 mp4）
  error?: string | {
    code?: number;
    message?: string;
    type?: string;
  };
    progress?: number;
  metadata?: {
    id?: string;
    model?: string;
    status?: string;
    seconds?: number | string;
    n_seconds?: number;
    width?: number;
    height?: number;
    prompt?: string;
    resolution?: string;
    duration?: number;
    ratio?: string;
    framespersecond?: number;
    error?: {
      code?: number;
      message?: string;
      type?: string;
    };
    reason?: string;
    generations?: Array<{
      id?: string;
    }>;
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
      timeout: 5 * 60000, // 60秒超时
      _skipErrorDisplay: true, // 跳过默认错误提示，由组件自行处理错误（如余额不足等）
    });
  },

  /**
   * 查询视频生成任务状态
   * Endpoint: GET /ads/playground/video/generations?userId={userId}&taskId={taskId}
   */
  queryVideoTask: async (taskId: string, signal?: AbortSignal): Promise<VideoGenerateQueryResponse> => {
    const { user } = useAuthStore.getState();
    
    return request.get<VideoGenerateQueryResponse>('/ads/playground/video/generations', {
      params: {
        userId: user?.nebulaApiId || '',
        taskId: taskId,
      },
      timeout: 30000,
      signal, // 支持 AbortSignal
      _skipErrorDisplay: true, // 跳过默认错误提示，由组件自行处理错误（如余额不足等）
    });
  },
};
