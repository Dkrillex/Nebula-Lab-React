import { request } from '../lib/request';
import { ApiResponse } from '../types';
import { useAuthStore } from '../stores/authStore';

// 图片生成请求参数
export interface ImageGenerateRequest {
  model: string;
  prompt: string;
  size?: string; // 图片尺寸，如 "1024x1024"
  style?: string; // 风格
  temperature?: number;
  n?: number; // 生成数量
  quality?: string; // 图片质量: standard/hd
  responseFormat?: string; // 响应格式: url/b64_json
  user_id?: string;
  // 图生图相关
  image?: string; // 参考图片URL或base64
  input_fidelity?: number; // 输入保真度（0-1）
  // 豆包模型特定参数
  watermark?: boolean;
  sequential_image_generation?: string; // 'auto' | 'disabled'
  sequential_image_generation_options?: any;
  optimize_prompt_options?: {
    mode?: string;
  };
  // qwen-image-plus 特定参数
  extra?: {
    input?: {
      messages?: Array<{
        role: string;
        content: Array<{ text?: string }>;
      }>;
    };
    parameters?: {
      size?: string;
      negative_prompt?: string;
      prompt_extend?: boolean;
      watermark?: boolean;
    };
  };
  // Gemini模型特定参数
  contents?: Array<{
    role: string;
    parts: Array<{ text?: string; image?: string }>;
  }>;
}

// 图片生成响应
export interface ImageGenerateResponse {
  code: number;
  msg?: string;
  data?: {
    data?: Array<{
      url?: string;
      b64_json?: string;
      revised_prompt?: string;
    }>;
    created?: number;
    task_id?: string;
  };
}

export const imageGenerateService = {
  /**
   * 生成图片
   * Endpoint: POST /ads/playground/image/completions
   */
  generateImage: async (data: ImageGenerateRequest): Promise<ImageGenerateResponse> => {
    const { user } = useAuthStore.getState();
    
    const requestData = {
      ...data,
      user_id: user?.nebulaApiId || '',
    };

    return request.post<ImageGenerateResponse>('/ads/playground/image/completions', requestData, {
      timeout: 60000, // 60秒超时
    });
  },
};

