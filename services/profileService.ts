import { request } from '../lib/request';

export interface UserProfileData {
  user: {
    userId: string;
    tenantId: string;
    deptId: string;
    userName: string;
    nickName: string;
    userType: string;
    email: string;
    phonenumber: string | null;
    sex: string;
    avatar: string;
    status: string;
    loginIp: string;
    loginDate: string;
    remark: string | null;
    createTime: string;
    deptName: string;
    roles: Array<{
      roleId: string;
      roleName: string;
      roleKey: string;
      roleSort: number;
      dataScope: string;
      status: string;
      remark: string | null;
      createTime: string | null;
      flag: boolean;
      superAdmin: boolean;
    }>;
    roleIds: any;
    postIds: any;
    roleId: any;
    inviteCode: string;
    channelId: number;
    channelName: string;
    nebulaApiId: number;
  };
  roleGroup: string;
  postGroup: string;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileParams {
  userId: string;
  nickName?: string;
  email?: string;
  sex?: string;
  phonenumber?: string;
}

export const profileService = {
  /**
   * Get user profile
   * Endpoint: GET /system/user/profile
   */
  getUserProfile: () => {
    return request.get<UserProfileData>('/system/user/profile');
  },

  /**
   * Update user profile
   * Endpoint: PUT /system/user/profile
   */
  updateProfile: (data: UpdateProfileParams) => {
    return request.put('/system/user/profile', data);
  },

  /**
   * Update user avatar
   * Endpoint: POST /system/user/profile/avatar
   */
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatarfile', file);
    return request.post<{ imgUrl: string }>('/system/user/profile/avatar', formData);
  },

  /**
   * Change password
   * Endpoint: PUT /system/user/profile/updatePwd
   */
  changePassword: (data: ChangePasswordParams) => {
    return request.put('/system/user/profile/updatePwd', data, { encrypt: true });
  }
};

