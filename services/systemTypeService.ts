import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface SystemTypeVO {
  id: number | string;
  systemName: string;
  [key: string]: any;
}

export interface SystemTypeQuery {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

export const systemTypeService = {
  /**
   * 获取系统类型列表
   * @param params 查询参数
   * @returns 系统类型列表
   */
  getSystemTypeList: (params?: SystemTypeQuery) => {
    return request.get<ApiResponse<{ rows: SystemTypeVO[]; total: number }>>('/system/systemType/list', {
      params: {
        pageNum: 1,
        pageSize: 1000,
        ...params,
      },
    });
  },
};

