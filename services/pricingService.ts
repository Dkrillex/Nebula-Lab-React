import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface PriceListVO {
  /**
   * ID
   */
  id: number | string;

  /**
   * 系统类型
   */
  systemType: string;

  /**
   * 产品类型
   */
  productType: string;

  /**
   * 产品名称
   */
  productName: string;

  /**
   * 产品价格
   */
  productPrice: number;

  /**
   * 产品描述
   */
  productDescription: string;

  /**
   * 产品年月类型
   */
  productPeriod: string;

  /**
   * 产品数量
   */
  productQuantity: number;

  /**
   * 产品过期日期
   */
  expiryDate: string;

  /**
   * 产品总价
   */
  totalAmount: number;

  /**
   * 产品积分
   */
  productScore: number;
}

export interface PriceListForm {
  id?: number | string;
  systemType?: string;
  productType?: string;
  productName?: string;
  productPrice?: number;
  productDescription?: string;
  productPeriod?: string;
  productQuantity?: number;
  expiryDate?: string;
  productScore?: number;
}

export interface PriceListQuery {
  pageNum?: number;
  pageSize?: number;
  systemType?: string;
  productType?: string;
  productPeriod?: string;
  productName?: string;
  [key: string]: any;
}

export const pricingService = {
  /**
   * 获取定价列表
   * @param params 查询参数
   * @returns 定价列表
   */
  getPriceList: (params?: PriceListQuery) => {
    return request.get<ApiResponse<PriceListVO[]>>('/system/priceList/list', {
      params: {
        pageNum: 1,
        pageSize: 9999,
        ...params,
      },
    });
  },

  /**
   * 查询定价列表（分页）
   * @param params 查询参数
   * @returns 定价列表
   */
  getPriceListPage: (params?: PriceListQuery) => {
    return request.get<ApiResponse<{ rows: PriceListVO[]; total: number }>>('/system/priceList/list', {
      params,
    });
  },

  /**
   * 查询定价详情
   * @param id 定价ID
   * @returns 定价详情
   */
  getPriceListInfo: (id: number | string) => {
    return request.get<ApiResponse<PriceListVO>>(`/system/priceList/${id}`);
  },

  /**
   * 新增定价
   * @param data 定价数据
   * @returns 结果
   */
  addPriceList: (data: PriceListForm) => {
    return request.post<ApiResponse<void>>('/system/priceList', data);
  },

  /**
   * 更新定价
   * @param data 定价数据
   * @returns 结果
   */
  updatePriceList: (data: PriceListForm) => {
    return request.put<ApiResponse<void>>('/system/priceList', data);
  },

  /**
   * 删除定价
   * @param id 定价ID或ID数组
   * @returns 结果
   */
  removePriceList: (id: number | string | (number | string)[]) => {
    const idParam = Array.isArray(id) ? id.join(',') : id;
    return request.delete<ApiResponse<void>>(`/system/priceList/${idParam}`);
  },

  /**
   * 导出定价列表
   * @param params 查询参数
   * @returns 导出文件
   */
  exportPriceList: (params?: PriceListQuery) => {
    return request.get('/system/priceList/export', {
      params,
      responseType: 'blob',
    });
  },
};

