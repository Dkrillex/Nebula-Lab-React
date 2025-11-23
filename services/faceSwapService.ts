import { aiToolService, AiTemplateRequest } from './aiToolService';
import { uploadService, UploadResult } from './uploadService';
import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface FaceSwapParams {
  primaryImage: string; // base64 data URL
  primaryMimeType: string;
  secondaryImage?: string; // base64 data URL (optional)
  secondaryMimeType?: string;
  prompt: string;
  maskBase64?: string; // optional mask
}

export interface VideoFaceSwapParams {
  videoUrl: string; // 视频URL（已上传到OSS）
  referenceImage: string; // base64 data URL
  referenceImageMimeType: string;
  prompt: string;
  markers?: Array<{
    time: number;
    type: 'modify' | 'protect';
  }>;
}

// 视频处理相关接口
export interface VideoProcessSubmitParams {
  inputVideoFileId: string; // 输入视频文件ID
}

export interface VideoProcessSubmitResult {
  result: {
    taskId: string;
  };
}

export interface VideoProcessQueryResult {
  result: {
    taskId: string;
    status: 'success' | 'failed' | 'processing' | 'pending';
    resizedVideoUrl?: string;
    trackingVideoPath?: string;
  };
}

// 视频角色交换相关接口
export interface VideoCharacterSwapSubmitParams {
  videoMaskDrawingTaskId: string; // 视频掩码绘制任务ID
  modelImageFileId: string; // 模型图像文件ID（目标角色的脸部图像文件ID）
  score: number; // 积分值
  noticeUrl?: string; // 回调通知URL（选填）
}

export interface VideoCharacterSwapSubmitResult {
  result: {
    taskId: string;
  };
}

export interface VideoCharacterSwapQueryParams {
  taskId: string;
  needCloudFrontUrl?: boolean;
}

export interface VideoCharacterSwapQueryResult {
  result: {
    taskId: string;
    status: 'success' | 'failed' | 'processing' | 'pending' | 'running';
    outputVideoUrl?: string;
    costCredit?: number;
  };
}

export interface FaceSwapResult {
  imageUrl: string;
  text?: string;
}

export interface VideoFaceSwapResult {
  videoUrl: string;
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
 * 从视频 MIME 类型提取文件扩展名
 */
const getVideoExtensionFromMimeType = (mimeType: string): string => {
  let extension = mimeType.replace(/^video\//, '').toLowerCase();
  if (extension === 'quicktime') extension = 'mov';
  if (extension === 'x-msvideo') extension = 'avi';
  return extension || 'mp4';
};

/**
 * 视频处理服务
 */
export const videoProcessService = {
  /**
   * 提交视频处理任务
   * @param params 视频处理参数
   * @returns 任务ID
   */
  taskSubmit: async (params: VideoProcessSubmitParams): Promise<VideoProcessSubmitResult> => {
    return request.post<VideoProcessSubmitResult>('/tp/v1/VideoProcessSubmit', params);
  },

  /**
   * 查询视频处理任务
   * @param taskId 任务ID
   * @param needCloudFrontUrl 是否需要CDN URL
   * @returns 任务状态和结果
   */
  queryTask: async (taskId: string, needCloudFrontUrl: boolean = true): Promise<VideoProcessQueryResult> => {
    return request.get<VideoProcessQueryResult>('/tp/v1/VideoProcessQuery', {
      params: { taskId, needCloudFrontUrl },
    });
  },
};

/**
 * 视频角色交换服务
 */
export const videoCharacterSwapService = {
  /**
   * 提交视频角色交换任务
   * @param params 视频角色交换参数
   * @returns 任务ID
   */
  submit: async (params: VideoCharacterSwapSubmitParams): Promise<VideoCharacterSwapSubmitResult> => {
    return request.post<VideoCharacterSwapSubmitResult>('/tp/v1/VideoCharacterSwapSubmit', params);
  },

  /**
   * 查询视频角色交换任务
   * @param params 查询参数
   * @returns 任务状态和结果
   */
  query: async (params: VideoCharacterSwapQueryParams): Promise<VideoCharacterSwapQueryResult> => {
    const { taskId, needCloudFrontUrl = true } = params;
    return request.get<VideoCharacterSwapQueryResult>('/tp/v1/VideoCharacterSwapQuery', {
      params: { taskId, needCloudFrontUrl },
    });
  },
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
      
      console.log('Face swap API完整响应:', response);
      
      // 检查响应结构：{ code: 200, msg: "...", data: { data: [...], created: ... } }
      if (response.code === 200 && response.data?.data && response.data.data.length > 0 && response.data.data[0].url) {
        return {
          imageUrl: response.data.data[0].url,
          text: response.data.data[0].revised_prompt,
        };
      } else {
        console.error('Face swap响应数据结构不符合预期:', response);
        throw new Error(response.msg || '生成失败，未返回有效结果');
      }
    } catch (error) {
      console.error('Face swap error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('换脸生成失败，请重试');
    }
  },

  /**
   * 执行视频换脸（新版本：使用视频角色交换API）
   * @param params 视频换脸参数
   * @returns 生成的结果视频URL
   */
  swapVideoFace: async (params: {
    videoMaskDrawingTaskId: string; // 视频掩码绘制任务ID
    modelImageFileId: string; // 参考图片文件ID
    score: number; // 积分值
    onProgress?: (progress: number) => void; // 进度回调
  }): Promise<VideoFaceSwapResult> => {
    try {
      // 1. 提交视频角色交换任务
      const submitResult = await videoCharacterSwapService.submit({
        videoMaskDrawingTaskId: params.videoMaskDrawingTaskId,
        modelImageFileId: params.modelImageFileId,
        score: params.score,
      });

      if (!submitResult.result?.taskId) {
        throw new Error('提交视频换脸任务失败');
      }

      const taskId = submitResult.result.taskId;

      // 2. 轮询查询任务状态
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let progress = 0;

      while (true) {
        await sleep(15000); // 每15秒查询一次

        const queryResult = await videoCharacterSwapService.query({ taskId });

        if (!queryResult.result) {
          throw new Error('查询任务状态失败');
        }

        const { status } = queryResult.result;

        if (status === 'success') {
          const outputVideoUrl = queryResult.result.outputVideoUrl;
          if (!outputVideoUrl) {
            throw new Error('任务成功但未返回视频URL');
          }
          return {
            videoUrl: outputVideoUrl,
            text: '视频换脸生成成功',
          };
        } else if (status === 'failed') {
          throw new Error('视频换脸任务失败');
        } else if (status === 'running') {
          // 更新进度（最多到90%）
          if (progress < 90) {
            progress += 10;
            if (params.onProgress) {
              params.onProgress(progress);
            }
          }
          // 继续轮询
          continue;
        } else {
          // pending 或其他状态，继续轮询
          continue;
        }
      }
    } catch (error) {
      console.error('Video face swap error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('视频换脸生成失败，请重试');
    }
  },
};

