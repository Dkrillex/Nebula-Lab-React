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
  startDate?: string; // 开始日期（YYYY-MM-DD格式）
  endDate?: string; // 结束日期（YYYY-MM-DD格式）
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

// 团队日志查询参数
export interface TeamLogsQuery {
  pageNum?: number;
  pageSize?: number;
  teamIds?: string; // 团队ID，逗号分隔
  userIds?: string; // 用户ID，逗号分隔
  types?: string; // 费用类型，逗号分隔：'1'=充值，'2'=消费
  startTime?: number; // 开始时间（Unix时间戳，秒）
  endTime?: number; // 结束时间（Unix时间戳，秒）
  language?: string; // 语言：zh_CN, en_US, id_ID
  [key: string]: any;
}

// 团队日志记录
export interface TeamLog {
  id: string | number;
  teamName?: string; // 团队名称
  userName?: string; // 用户名
  tokenName?: string; // 创作/令牌
  modelName?: string; // 功能/模型
  quotaRmb?: number | string; // 费用(￥)
  quotaDollar?: number | string; // 费用($)
  type?: number | string; // 费用类型：1=充值，2=消费
  createdAt?: string; // 时间
  promptTokens?: number; // 输入(Tokens)
  completionTokens?: number; // 完成(Tokens)
  [key: string]: any;
}

// 余额日汇总
export interface BalanceDailySummary {
  date: string; // 日期（YYYY-MM-DD）
  totalConsumption: number; // 消费总额
  totalRecharge: number; // 充值总额
  netAmount: number; // 净额（充值-消费）
  usageCount: number; // 使用次数
  totalTokens: number; // 总Token数
}

// 积分日汇总
export interface PointsDailySummary {
  date: string; // 日期（YYYY-MM-DD）
  totalDeduct: number; // 消耗积分总额
  usageCount: number; // 使用次数
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

  /**
   * 获取团队日志列表（账单/日志）
   * @param params 查询参数
   * @returns 团队日志列表
   */
  getTeamLogs: (params?: TeamLogsQuery) => {
    return request.get<ApiResponse<TeamLog[]>>('/ads/teamLogs/list', {
      params,
    });
  },

  /**
   * 导出团队日志（Excel）
   * @param params 查询参数
   * @returns Excel文件下载
   */
  exportTeamLogs: (params?: TeamLogsQuery) => {
    // 使用 POST 请求，参数通过 URL-encoded 格式传递（与 Nebula1 保持一致）
    const formData = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof TeamLogsQuery];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
    }
    
    // 使用 request 方法直接传递 URL-encoded 字符串，避免被 JSON.stringify
    return request.request('/ads/teamLogs/export', {
      method: 'POST',
      body: formData.toString(),
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      isTransformResponse: false,
      encrypt: false, // 导出接口不需要加密
    });
  },

  /**
   * 导入团队日志（Excel）
   * @param file 文件对象
   * @param updateSupport 是否更新已存在的数据
   * @returns 导入结果
   */
  importTeamLogs: (file: File, updateSupport: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('updateSupport', String(updateSupport));
    return request.post<{ code: number; msg: string }>('/ads/teamLogs/import', formData, {
      isTransformResponse: false,
    });
  },

  /**
   * 下载团队日志导入模板
   * @returns Excel模板文件下载
   */
  downloadTeamLogsImportTemplate: () => {
    return request.post('/ads/teamLogs/importTemplate', {}, {
      responseType: 'blob',
      isTransformResponse: false,
    });
  },

  /**
   * 获取余额日汇总统计
   * @param params 查询参数
   * @returns 日汇总列表
   */
  getBalanceDailySummary: (params?: ExpenseLogsQuery) => {
    return request.get<ApiResponse<BalanceDailySummary[]>>('/api/logs/dailySummary', {
      params,
    });
  },

  /**
   * 获取积分日汇总统计
   * @param params 查询参数
   * @returns 日汇总列表
   */
  getPointsDailySummary: (params?: ScoreListQuery) => {
    return request.get<ApiResponse<PointsDailySummary[]>>('/ads/labScore/dailySummary', {
      params,
    });
  },
};

