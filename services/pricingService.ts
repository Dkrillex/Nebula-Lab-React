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

export interface PriceListQuery {
  pageNum?: number;
  pageSize?: number;
  systemType?: string;
  productType?: string;
  productPeriod?: string;
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
};

