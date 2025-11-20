import { request } from '../lib/request';
import { useAuthStore } from '../stores/authStore';
import { uploadService } from './uploadService';

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
  data: Array<{
    url?: string;
    text?: string;
  }>;
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

    return request.post<AiTemplateResponse>('/aiTool/v1/AiTemplate', requestData, {
      timeout: 60000,
    });
  },

  /**
   * 编辑图像 helper function
   */
  editImage: async (
    base64ImageData: string | null,
    mimeType: string,
    prompt: string,
    maskBase64: string | null,
    secondaryImage: { base64: string; mimeType: string } | null,
    titleKey: string
  ) => {
    try {
      const partsArr: Array<object> = [];
      const fullPrompt = prompt;

      const fileName = titleKey || 'image';
      
      partsArr.push({
        text: maskBase64
          ? `Apply the following instruction only to the masked area of the image: "${fullPrompt}". Preserve the unmasked area.`
          : fullPrompt,
      });

      if (base64ImageData) {
        const res = await uploadService.uploadByBase64(
          base64ImageData,
          `${fileName}-Original-image`,
          mimeType
        );
        // @ts-ignore
        const url = res.data?.url || res.url; 
        partsArr.push({
          image: url,
        });
      }

      if (maskBase64) {
        const res = await uploadService.uploadByBase64(
          maskBase64,
          `${fileName}-Mask-image`,
          mimeType
        );
        // @ts-ignore
        const url = res.data?.url || res.url;
        partsArr.push({
          image: url,
        });
      }

      if (secondaryImage) {
        const res = await uploadService.uploadByBase64(
          secondaryImage.base64,
          `${fileName}-Original-two-image`,
          secondaryImage.mimeType
        );
        // @ts-ignore
        const url = res.data?.url || res.url;
        partsArr.push({
          image: url,
        });
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

      return await aiToolService.generateAiTemplate(requestData);
    } catch (error) {
      console.error('Error calling AI Tool API:', error);
      throw error;
    }
  }
};

