import { request } from '../lib/request';
import { useAuthStore } from '../stores/authStore';
import { uploadService } from './uploadService';

/**
 * 从 MIME 类型提取文件扩展名
 * @param mimeType MIME 类型，如 "image/png" 或 "image/jpeg"
 * @returns 文件扩展名，如 "png" 或 "jpg"
 */
const getExtensionFromMimeType = (mimeType: string): string => {
  // 从 MIME 类型中提取扩展名（去掉 "image/" 前缀）
  let extension = mimeType.replace(/^image\//, '').toLowerCase();
  
  // 将 jpeg 转换为 jpg（常见约定）
  if (extension === 'jpeg') {
    extension = 'jpg';
  }
  
  // 默认返回 png
  return extension || 'png';
};

export interface AiTemplateRequest {
  prompt: string;
  user_id?: string;
  watermark?: boolean;
  sequential_image_generation?: string;
  type: string;
  contents: Array<{
    role: string;
    parts: Array<{ text?: string; image?: string }>;
  }>;
  score?: string;
}

export interface AiTemplateResponse {
  code: number;
  msg?: string;
  data: {
    data: Array<{
      url?: string;
      b64_json?: string;
      revised_prompt?: string;
    }>;
    created?: number;
  };
}

export const aiToolService = {
  /**
   * 调用 AI Template API
   * Endpoint: POST /aiTool/v1/AiTemplate
   */
  generateAiTemplate: (data: AiTemplateRequest) => {
    const { user } = useAuthStore.getState();
    
    const requestData = {
      ...data,
      user_id: user?.nebulaApiId || '',
      score: "0.3"
    };

    // request.ts 会提取 data 字段，所以禁用 transform 以获取完整响应
    return request.post<AiTemplateResponse>('/aiTool/v1/AiTemplate', requestData, {
      timeout: 60000,
      isTransformResponse: false,
    });
  },

  /**
   * 编辑图像 helper function
   * 借鉴 Nebula1 的实现方式，支持传入 selectedTool 参数
   */
  editImage: async (
    base64ImageData: string | null,
    mimeType: string,
    prompt: string,
    maskBase64: string | null,
    secondaryImage: { base64: string; mimeType: string } | null,
    titleKey: string | any // 支持传入 Tool 对象或字符串
  ) => {
    try {
      const partsArr: Array<{ text?: string; image?: string }> = [];
      const fullPrompt = prompt;

      // 支持传入 Tool 对象或字符串
      const fileName = typeof titleKey === 'string' 
        ? titleKey 
        : (titleKey?.title || titleKey?.key || 'image');
      
      partsArr.push({
        text: maskBase64
          ? `Apply the following instruction only to the masked area of the image: "${fullPrompt}". Preserve the unmasked area.`
          : fullPrompt,
      });

      if (base64ImageData) {
        const extensionType = getExtensionFromMimeType(mimeType);
        const res = await uploadService.uploadByBase64(
          base64ImageData,
          `${fileName}-Original-image`,
          extensionType
        );
        // @ts-ignore
        const url = res.data?.url || res.url; 
        if (url) {
          partsArr.push({
            image: url,
          });
        }
      }

      if (maskBase64) {
        const extensionType = getExtensionFromMimeType(mimeType);
        const res = await uploadService.uploadByBase64(
          maskBase64,
          `${fileName}-Mask-image`,
          extensionType
        );
        // @ts-ignore
        const url = res.data?.url || res.url;
        if (url) {
          partsArr.push({
            image: url,
          });
        }
      }

      if (secondaryImage) {
        const extensionType = getExtensionFromMimeType(secondaryImage.mimeType);
        const res = await uploadService.uploadByBase64(
          secondaryImage.base64,
          `${fileName}-Original-two-image`,
          extensionType
        );
        // @ts-ignore
        const url = res.data?.url || res.url;
        if (url) {
          partsArr.push({
            image: url,
          });
        }
      }

      const requestData: AiTemplateRequest = {
        prompt,
        watermark: false,
        sequential_image_generation: 'disabled',
        type: 'image',
        contents: [
          {
            role: 'user',
            parts: partsArr,
          },
        ],
      };

      const response = await aiToolService.generateAiTemplate(requestData);
      
      // 统一响应处理，借鉴 Nebula1 的方式
      if (response.code === 200 && response.data?.data && response.data.data.length > 0) {
        return {
          imageUrl: response.data.data[0].url,
          text: response.data.data[0].revised_prompt || fileName,
        };
      } else {
        throw new Error(response.msg || '生成失败，未返回有效结果');
      }
    } catch (error) {
      console.error('Error calling AI Tool API:', error);
      throw error instanceof Error 
        ? error 
        : new Error('图像编辑失败，请重试');
    }
  }
};

