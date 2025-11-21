import { aiToolService, AiTemplateRequest } from './aiToolService';
import { uploadService, UploadResult } from './uploadService';
import { ApiResponse } from '../types';

export interface FaceSwapParams {
  primaryImage: string; // base64 data URL
  primaryMimeType: string;
  secondaryImage?: string; // base64 data URL (optional)
  secondaryMimeType?: string;
  prompt: string;
  maskBase64?: string; // optional mask
}

export interface FaceSwapResult {
  imageUrl: string;
  text?: string;
}

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

/**
 * AI 图片换脸服务
 */
export const faceSwapService = {
  /**
   * 执行图片换脸
   * @param params 换脸参数
   * @returns 生成的结果图片URL
   */
  swapFace: async (params: FaceSwapParams): Promise<FaceSwapResult> => {
    try {
      const partsArr: Array<{ text?: string; image?: string }> = [];
      
      // 添加提示词
      const fullPrompt = params.prompt;
      partsArr.push({
        text: params.maskBase64
          ? `Apply the following instruction only to the masked area of the image: "${fullPrompt}". Preserve the unmasked area.`
          : fullPrompt,
      });

      // 上传主图
      if (params.primaryImage) {
        const extensionType = getExtensionFromMimeType(params.primaryMimeType);
        const res = await uploadService.uploadByBase64(
          params.primaryImage,
          'FaceSwap-Original-image',
          extensionType
        );
        const url = (res as ApiResponse<UploadResult>).data?.url || (res as any).url;
        if (url) {
          partsArr.push({ image: url });
        }
      }

      // 上传蒙版（如果有）
      if (params.maskBase64) {
        const extensionType = getExtensionFromMimeType(params.primaryMimeType);
        const res = await uploadService.uploadByBase64(
          params.maskBase64,
          'FaceSwap-Mask-image',
          extensionType
        );
        const url = (res as ApiResponse<UploadResult>).data?.url || (res as any).url;
        if (url) {
          partsArr.push({ image: url });
        }
      }

      // 上传参考图（如果有）
      if (params.secondaryImage && params.secondaryMimeType) {
        const extensionType = getExtensionFromMimeType(params.secondaryMimeType);
        const res = await uploadService.uploadByBase64(
          params.secondaryImage,
          'FaceSwap-Reference-image',
          extensionType
        );
        const url = (res as ApiResponse<UploadResult>).data?.url || (res as any).url;
        if (url) {
          partsArr.push({ image: url });
        }
      }

      // 构建请求
      const requestData: AiTemplateRequest = {
        prompt: params.prompt,
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

      // 调用 API
      const response = await aiToolService.generateAiTemplate(requestData);
      
      if (response.data && response.data.length > 0 && response.data[0].url) {
        return {
          imageUrl: response.data[0].url,
          text: response.data[0].text,
        };
      } else {
        throw new Error('生成失败，未返回有效结果');
      }
    } catch (error) {
      console.error('Face swap error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('换脸生成失败，请重试');
    }
  },
};

