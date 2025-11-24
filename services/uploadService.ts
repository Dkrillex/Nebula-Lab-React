import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface UploadResult {
  url: string;
  fileName: string;
  ossId: string;
}

export const uploadService = {
  /**
   * 上传文件到OSS
   * Endpoint: POST /resource/oss/upload
   * @param file 要上传的文件
   * @param otherData 其他参数，例如 bucketName, objectName 等
   * @returns requestClient已处理，直接返回data部分: { url, fileName, ossId }
   */
  uploadFile: (file: File, otherData?: Record<string, any>) => {
    // Using request.upload helper which handles FormData correctly
    // Note: requestClient strips outer wrapper, returns UploadResult directly
    return request.upload<UploadResult>('/resource/oss/upload', file, {
      timeout: 60000
    });
  },

  /**
   * 根据图片URL上传到OSS
   * Endpoint: POST /resource/oss/uploadByImageUrl
   * @param imageUrl 图片URL
   * @param extensionType 文件扩展名 (e.g., 'png', 'jpg')
   * @returns requestClient已处理，直接返回data部分: { url, fileName, ossId }
   */
  uploadByImageUrl: (imageUrl: string, extensionType: string) => {
    return request.post<UploadResult>('/resource/oss/uploadByImageUrl', {
      url: imageUrl,
      extensionType,
    }, {
      timeout: 60000 // 60秒超时，图片URL上传可能需要下载和处理时间
    });
  },

  /**
   * 根据视频URL上传到OSS
   * Endpoint: POST /resource/oss/uploadByVideoUrl
   * @param videoUrl 视频URL
   * @param extensionType 文件扩展名 (e.g., 'mp4')
   * @returns requestClient已处理，直接返回data部分: { url, fileName, ossId }
   */
  uploadByVideoUrl: (videoUrl: string, extensionType: string) => {
    return request.post<UploadResult>('/resource/oss/uploadByVideoUrl', {
      url: videoUrl,
      extensionType,
    }, {
      timeout: 120000 // 120秒超时，视频文件较大，上传可能需要更长时间
    });
  },

  /**
   * 根据Base64字符串上传到OSS
   * Endpoint: POST /resource/oss/uploadByBase64
   * @param base64Content Base64字符串
   * @param fileName 文件名
   * @param extensionType 文件扩展名
   * @returns requestClient已处理，直接返回data部分: { url, fileName, ossId }
   */
  uploadByBase64: (base64Content: string, fileName: string, extensionType: string) => {
    return request.post<UploadResult>('/resource/oss/uploadByBase64', {
      base64Content,
      fileName,
      extensionType,
    }, {
      timeout: 60000 // 60秒超时，Base64上传可能需要更长时间
    });
  },

  /**
   * 删除OSS存储资源
   * Endpoint: DELETE /resource/oss/{ids}
   * @param ids OSS资源ID，可以是单个ID或逗号分隔的多个ID
   * @returns void
   */
  deleteOssResource: (ids: string | number | string[]) => {
    // 如果是数组，转换为逗号分隔的字符串
    const idsParam = Array.isArray(ids) ? ids.join(',') : String(ids);
    return request.delete<void>(`/resource/oss/${idsParam}`);
  },
};
