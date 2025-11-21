import { request } from '../lib/request';

export interface UserInviteVO {
  userId: string;
  userName: string;
  nickName: string;
  email: string;
  phoneNumber: string;
  createTime: string;
}

export const userInviteService = {
  /**
   * 根据渠道ID查询邀请用户列表
   */
  userInviteDetailList: (channelId: number, keyword?: string, params?: any) => {
    return request.get<{ rows: UserInviteVO[]; total: number }>(`/system/user/invite/${channelId}`, {
      params: {
        ...params,
        keyword
      }
    });
  }
};

