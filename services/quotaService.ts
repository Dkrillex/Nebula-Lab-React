import { request } from '../lib/request';

export interface UserQuotaInfo {
  quota: number;
  quotaRmb: string;
  usedQuota: number;
  usedQuotaRmb: string;
  score: number;
  memberLevel: string;
  nebulaApiId: number;
}

export interface AllocateQuotaParams {
  fromUserId: number;
  toUserId: number;
  quotaAmount: number;
  memberLevel: string;
}

export const quotaService = {
  /**
   * 获取用户配额信息
   */
  getUserQuotaInfo: (userId: number) => {
    return request.get<UserQuotaInfo>(`/api/users/${userId}`);
  },

  /**
   * 配额转移
   */
  allocateQuota: (data: AllocateQuotaParams) => {
    return request.post('/api/users/allocate', data);
  }
};

