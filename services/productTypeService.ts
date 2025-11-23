import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface ProductTypeVO {
  id: number | string;
  productName: string;
  systemId?: string | number;
  [key: string]: any;
}

export interface ProductTypeQuery {
  pageNum?: number;
  pageSize?: number;
  systemId?: string | number;
  [key: string]: any;
}

export const productTypeService = {
  /**
   * 获取产品类型列表
   * @param params 查询参数
   * @returns 产品类型列表
   */
  getProductTypeList: (params?: ProductTypeQuery) => {
    return request.get<ApiResponse<{ rows: ProductTypeVO[]; total: number }>>('/system/productType/list', {
      params: {
        pageNum: 1,
        pageSize: 1000,
        ...params,
      },
    });
  },
};

