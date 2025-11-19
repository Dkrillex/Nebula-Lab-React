import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface UserProfile {
  userName: string;
  nickName: string;
  phonenumber: string;
  email: string;
  sex: string;
  avatar: string;
  createTime: string;
  roleGroup?: string;
  postGroup?: string;
  dept?: {
    deptName: string;
  };
}

export interface UpdateProfileParams {
  nickName?: string;
  phonenumber?: string;
  email?: string;
  sex?: string;
}

export const profileService = {
  /**
   * Get user profile
   * Endpoint: GET /system/user/profile
   */
  getUserProfile: () => {
    return request.get<ApiResponse<UserProfile>>('/system/user/profile');
  },

  /**
   * Update user profile
   * Endpoint: PUT /system/user/profile
   */
  updateUserProfile: (data: UpdateProfileParams) => {
    return request.put<ApiResponse<null>>('/system/user/profile', data);
  },

  /**
   * Update user avatar
   * Endpoint: POST /system/user/profile/avatar
   */
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatarfile', file);
    return request.post<ApiResponse<{ imgUrl: string }>>('/system/user/profile/avatar', formData);
  }
};

