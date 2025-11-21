import { request } from '../lib/request';

export interface TeamUserVO {
  teamId: number;
  userId: string;
  userAuthType: number;
  userRoleId?: number;
  createTime?: string;
  updateTime?: string;
}

export interface TeamUserForm {
  teamId: number;
  userId: string;
  userAuthType: number;
  userRoleId?: number;
}

export interface TeamUserDetailVO {
  teamId: number;
  userId: string;
  userName: string;
  nickName: string;
  email: string;
  phoneNumber: string;
  userAuthType: number;
  userRoleId?: number;
  roleName?: string;
  quota: number;
  quotaRmb: string;
  usedQuota: number;
  usedQuotaRmb: string;
  score: number;
  memberLevel: string;
  nebulaApiId: number;
  createTime: string;
}

export const teamUserService = {
  /**
   * 新增团队成员
   */
  teamUserAdd: (data: TeamUserForm) => {
    return request.post('/ads/teamUser', data);
  },

  /**
   * 根据团队ID查询团队成员详细信息列表
   */
  teamUserDetailListByTeam: (teamId: number, params?: any) => {
    return request.get<{ rows: TeamUserDetailVO[]; total: number }>(`/ads/teamUser/team/${teamId}/detail`, { params });
  },

  /**
   * 删除团队成员（按联合主键）
   */
  teamUserRemoveMember: (teamId: number, userId: string, userAuthType: number) => {
    return request.delete(`/ads/teamUser/${teamId}/${userId}/${userAuthType}`);
  },

  /**
   * 更新团队成员的权限类型
   */
  updateMemberAuth: (teamId: number, userId: string, userAuthType: number) => {
    return request.put(`/ads/teamUser/auth/${teamId}/${userId}`, null, {
      params: { userAuthType }
    });
  }
};

