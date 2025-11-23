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
   * 根据渠道ID查询邀请用户列表（关联用户表）
   * @param channelId 渠道ID
   * @param searchKeyword 搜索关键词（用户名、昵称、手机号）
   * @param params 分页参数
   * @returns 邀请用户详细信息列表
   */
  userInviteDetailList: (channelId: number | string, searchKeyword?: string, params?: any) => {
    return request.get<{ rows: UserInviteVO[]; total: number }>('/system/userInvite/detail', {
      params: {
        channelId,
        searchKeyword,
        ...params
      }
    });
  }
};

