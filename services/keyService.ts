import { request } from '../lib/request';
import { ApiResponse } from '../types';

// API令牌查询参数
export interface TokenQuery {
  pageNum?: number;
  pageSize?: number;
  userId?: string | number;
  name?: string;
  status?: number; // 1-启用 2-禁用
  key?: string;
  userGroup?: string;
  [key: string]: any;
}

// API令牌信息
export interface TokenVO {
  id: string | number;
  userId: string | number;
  key: string; // API密钥
  status: number; // 状态：1-启用 2-禁用
  name: string; // 令牌名称
  accessedTime?: string; // 最后访问时间
  expiredTime?: string | null; // 过期时间，null表示永不过期
  remainQuota: number; // 剩余额度
  unlimitedQuota: number; // 是否无限额度：1-是 0-否
  modelLimitsEnabled: number; // 是否启用模型限制：1-是 0-否
  modelLimits?: string; // 模型限制列表，多个模型用逗号分隔
  allowIps?: string; // 允许访问的IP地址列表，多个IP用逗号分隔
  usedQuota: number; // 已使用额度
  userGroup?: string; // 所属用户组
  createTime?: string; // 创建时间
  [key: string]: any;
}

// API令牌表单数据（创建/更新）
export interface TokenForm {
  id?: string | number;
  userId?: string | number;
  nebulaApiId?: string | number; // Nebula API用户ID
  name: string; // 令牌名称（必填）
  status?: number; // 状态：1-启用 2-禁用
  expiredTime?: string | number | null; // 过期时间，-1或null表示永不过期
  unlimitedQuota?: number; // 是否无限额度：1-是 0-否
  quota?: number; // 额度（美元）
  quotaRmb?: number; // 额度（人民币，必填）
  modelLimitsEnabled?: number; // 是否启用模型限制：1-是 0-否
  modelLimits?: string | string[]; // 模型限制列表
  allowIps?: string; // 允许访问的IP地址列表
  userGroup?: string; // 所属用户组
  remainQuota?: number; // 剩余额度（内部使用）
  usedQuota?: number; // 已使用额度（内部使用）
  key?: string; // API密钥（编辑时需要）
  [key: string]: any;
}

// 令牌使用记录查询参数
export interface TokenUsageQuery {
  pageNum?: number;
  pageSize?: number;
  userId: string | number;
  tokenId?: string | number;
  [key: string]: any;
}

// 令牌使用记录
export interface TokenUsageRecord {
  id: string | number;
  user_id?: string | number;
  token_id?: string | number;
  created_at?: string | number;
  createTime?: string;
  type?: string | number;
  content?: string;
  username?: string;
  token_name?: string;
  model_name?: string;
  quota?: string | number;
  quotaRmb?: string | number;
  quota_dollar?: string | number;
  prompt_tokens?: string | number;
  completion_tokens?: string | number;
  use_time?: string | number;
  is_stream?: boolean;
  channel?: string | number;
  channel_name?: string;
  group?: string;
  ip?: string;
  other?: string;
  [key: string]: any;
}

// 更新令牌余额参数
export interface TokenQuotaUpdateParams {
  userId: number | string;
  nebulaApiId: number | string;
  amount: string; // 金额（字符串格式）
}

export const keyService = {
  /**
   * 获取API令牌列表
   * @param params 查询参数
   * @returns 令牌列表
   */
  getTokens: (params?: TokenQuery) => {
    return request.get<ApiResponse<TokenVO[]>>('/llm/tokens/list', {
      params,
    });
  },

  /**
   * 获取API令牌详情
   * @param id 令牌ID
   * @returns 令牌详情
   */
  getTokenInfo: (id: string | number) => {
    return request.get<TokenVO>(`/llm/tokens/${id}`);
  },

  /**
   * 创建API令牌
   * @param data 令牌数据
   * @returns 创建结果
   */
  createToken: (data: TokenForm) => {
    return request.post<ApiResponse<void>>('/llm/tokens', data, {
      successMessageMode: 'message',
      errorMessageMode: 'message'
    });
  },

  /**
   * 更新API令牌
   * @param data 令牌数据（必须包含id）
   * @returns 更新结果
   */
  updateToken: (data: TokenForm) => {
    return request.put<ApiResponse<void>>('/llm/tokens', data, {
      successMessageMode: 'message',
      errorMessageMode: 'message'
    });
  },

  /**
   * 删除API令牌
   * @param id 令牌ID或ID数组
   * @returns 删除结果
   */
  deleteToken: (id: string | number | (string | number)[]) => {
    const ids = Array.isArray(id) ? id.join(',') : id;
    return request.delete<ApiResponse<void>>(`/llm/tokens/${ids}`, {
      successMessageMode: 'message',
      errorMessageMode: 'message'
    });
  },

  /**
   * 导出API令牌列表
   * @param params 查询参数
   * @returns 导出文件
   */
  exportTokens: (params?: TokenQuery) => {
    return request.get('/ads/llmToken/export', {
      params,
    });
  },

  /**
   * 更新API令牌余额
   * @param data 更新参数
   * @returns 更新结果
   */
  updateTokenQuota: (data: TokenQuotaUpdateParams) => {
    return request.put<ApiResponse<void>>('/ads/llmToken/quota', data);
  },

  /**
   * 获取API令牌使用记录列表
   * @param params 查询参数
   * @returns 使用记录列表
   */
  getTokenUsage: (params?: TokenUsageQuery) => {
    return request.get<ApiResponse<TokenUsageRecord[]>>('/ads/llmToken/llm/list', {
      params,
    });
  },
};
