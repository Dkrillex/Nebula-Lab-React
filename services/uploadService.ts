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
   */
  uploadFile: (file: File, otherData?: Record<string, any>) => {
    // Using request.upload helper which handles FormData correctly
    return request.upload<ApiResponse<UploadResult>>('/resource/oss/upload', file, {
        timeout: 60000
    });
  },

  /**
   * 根据图片URL上传到OSS
   * Endpoint: POST /resource/oss/uploadByImageUrl
   * @param imageUrl 图片URL
   * @param extensionType 文件扩展名 (e.g., 'png', 'jpg')
   */
  uploadByImageUrl: (imageUrl: string, extensionType: string) => {
    return request.post<ApiResponse<UploadResult>>('/resource/oss/uploadByImageUrl', {
      imageUrl,
      extensionType,
    });
  },

  /**
   * 根据Base64字符串上传到OSS
   * Endpoint: POST /resource/oss/uploadByBase64
   * @param base64Content Base64字符串
   * @param fileName 文件名
   * @param extensionType 文件扩展名
   */
  uploadByBase64: (base64Content: string, fileName: string, extensionType: string) => {
    return request.post<ApiResponse<UploadResult>>('/resource/oss/uploadByBase64', {
      base64Content,
      fileName,
      extensionType,
    });
  },
};
