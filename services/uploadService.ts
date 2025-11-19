import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface UploadResult {
  url: string;
  fileName: string;
  ossId: string;
}

export const uploadService = {
  /**
   * Upload file to OSS
   * Endpoint: POST /resource/oss/upload
   */
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<ApiResponse<UploadResult>>('/resource/oss/upload', formData);
  }
};

