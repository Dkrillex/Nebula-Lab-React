import { request } from '../lib/request';

// 文生图接口参数
export interface TextToImageParams {
  req: {
    creativity?: number;
    height?: string;
    prompt: string;
    size?: string; // 格式: "widthxheight"
    style?: string;
    width?: string;
  };
  score?: string;
}

// 图生图接口参数
export interface ImageToImageParams {
  score: number | string;
  volcImageBo: {
    image_urls: string[];
    prompt: string;
    size: string;
    style?: string;
  };
}

// 文生图/图生图生成结果项
export interface TextToImageItem {
  url: string;
  b64_json?: string;
  revised_prompt?: string;
  // 兼容其他可能返回的字段
  image_urls?: string[];
  images?: string[];
}

// 文生图/图生图完整响应数据结构
export interface TextToImageResponseData {
  data: TextToImageItem[];
  created: number;
}

// 文生润色API参数
export interface TextPolishingParams {
  text: string;
  type?: string; // 'text_to_image' | 'image_to_image'
}

// 文生润色API返回值
export interface TextPolishingResult {
  code: string;
  msg: string;
  data: string; // 返回润色后的文本
}

export const textToImageService = {
  /**
   * 文生图提交
   * @param data 提交参数
   * @returns 生成结果 (ApiResponse.data 是 TextToImageResponseData)
   */
  submitTextToImage: (data: TextToImageParams) => {
    return request.post<TextToImageResponseData>('/tp/v1/text2imageSubmit', data, { timeout: 30000 });
  },

  /**
   * 图生图提交
   * @param data 提交参数
   * @returns 生成结果
   */
  submitImageToImage: (data: ImageToImageParams) => {
    return request.post<TextToImageResponseData>('/tp/v1/img2imgSubmit', data, { timeout: 30000 });
  },

  /**
   * 文本润色
   * @param data 润色参数
   * @returns 润色结果
   */
  polishText: (data: TextPolishingParams) => {
    return request.post<TextPolishingResult>('/tp/v1/textPolishingSubmit', data);
  }
};
