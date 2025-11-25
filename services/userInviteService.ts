import { request } from '../lib/request';

export interface UserInviteVO {
  userId: string;
  userName: string;
  nickName: string;
  email: string;
  phoneNumber: string;
  createTime: string;
}

export interface NebulaUserInviteVO {
  id?: number;
  systemId?: string;
  channelId?: number;
  channelName?: string;
  channelInviteCode?: string;
  invitedUserId?: number;
  invitedUserName?: string;
  invitedUserCode?: string;
  createTime?: string;
}

export interface UserInviteListParams {
  channelId?: number;
  channelInviteCode?: string;
  invitedUserName?: string;
  systemId?: number;
  pageNum?: number;
  pageSize?: number;
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
  },

  /**
   * 查询推广邀请信息列表
   * @param params 查询参数
   * @returns 推广邀请信息列表
   */
  getUserInviteList: (params?: UserInviteListParams) => {
    return request.get<{ rows: NebulaUserInviteVO[]; total: number }>('/system/userInvite/list', {
      params
    });
  }
};

