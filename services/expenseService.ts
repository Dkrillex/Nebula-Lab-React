import { request } from '../lib/request';
import { ApiResponse } from '../types';

// 用户余额信息
export interface UserQuotaInfo {
  quotaRmb: number; // 人民币余额
  quota: number; // 美元余额（或通用余额）
  quotaDollar?: string; // 美元余额字符串
  id: number;
  nebulaId: number;
  usedQuota: number; // 已使用额度
  score: number; // 积分
  memberLevel: string; // 会员等级
  [key: string]: any;
}

// 费用记录查询参数
export interface ExpenseLogsQuery {
  pageNum?: number;
  pageSize?: number;
  userId?: number | string;
  modelName?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// 费用记录（日志）
export interface ExpenseLog {
  id: string | number;
  userId: string | number;
  createdAt?: number; // 时间戳（可选）
  createTime?: string; // 创建时间字符串（优先使用）
  type: number | string; // 类型：'2' 或 2 表示消费，其他表示充值
  content?: string;
  username: string;
  tokenName?: string;
  modelName: string;
  quota?: number; // 消费金额（旧字段）
  quotaRmb?: number; // 人民币消费金额（新字段，优先使用）
  promptTokens: number; // 输入token数
  completionTokens: number; // 输出token数
  useTime: number | string; // 使用时长（秒）
  isStream?: number;
  channelId?: string | number;
  channelName?: string;
  otherMap?: {
    cache_creation_tokens?: number; // 缓存写入token
    cache_tokens?: number; // 缓存读取token
    [key: string]: any;
  };
  [key: string]: any;
}

// 积分流水查询参数
export interface ScoreListQuery {
  pageNum?: number;
  pageSize?: number;
  createBy?: number | string; // 用户ID
  taskId?: string | number;
  score?: string;
  assetType?: number;
  status?: string;
  [key: string]: any;
}

// 积分流水记录
export interface ScoreRecord {
  id: string | number;
  taskId?: string | number;
  score: string | number;
  assetType: number;
  status: string;
  createTime?: string;
  [key: string]: any;
}

// 用户账户（积分）查询参数
export interface UserAccountQuery {
  pageNum?: number;
  pageSize?: number;
  userId?: number | string;
  systemId?: number | string;
  productId?: number | string;
  [key: string]: any;
}

// 用户账户信息
export interface UserAccount {
  id: number | string;
  userId: number | string;
  systemId?: number | string;
  productId?: number | string;
  userPoints: number; // 用户积分
  validTime: number | string; // 有效时间
  createTime?: string;
  [key: string]: any;
}

export const expenseService = {
  /**
   * 获取用户余额信息
   * @param nebulaApiId Nebula API 用户ID
   * @returns 用户余额信息
   */
  getUserQuota: (nebulaApiId: number | string) => {
    return request.get<UserQuotaInfo>(`/api/users/${nebulaApiId}`);
  },

  /**
   * 获取费用记录列表（消费日志）
   * @param params 查询参数
   * @returns 费用记录列表
   */
  getExpenseLogs: (params?: ExpenseLogsQuery) => {
    return request.get<ApiResponse<ExpenseLog[]>>('/api/logs/list', {
      params,
    });
  },

  /**
   * 获取积分流水列表
   * @param params 查询参数
   * @returns 积分流水列表
   */
  getScoreList: (params?: ScoreListQuery) => {
    return request.get<ApiResponse<ScoreRecord[]>>('/ads/labScore/list', {
      params,
    });
  },

  /**
   * 获取用户账户列表（积分账户）
   * @param params 查询参数
   * @returns 用户账户列表
   */
  getUserAccounts: (params?: UserAccountQuery) => {
    return request.get<ApiResponse<UserAccount[]>>('/system/userAccount/list', {
      params,
    });
  },
};

