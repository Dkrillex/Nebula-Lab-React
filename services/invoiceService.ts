import { request } from '../lib/request';
import { ApiResponse } from '../types';

// 发票信息接口
export interface UserInvoiceVO {
  /**
   * 系统ID
   */
  systemId: number | string;

  /**
   * 用户账号
   */
  userName: string;

  /**
   * 发票抬头名称
   */
  invoiceName: string;

  /**
   * 纳税人识别号
   */
  taxNumber: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 公司地址
   */
  companyAddress: string;

  /**
   * 公司电话
   */
  companyPhone: string;

  /**
   * 开户银行
   */
  openingBank: string;

  /**
   * 银行账户
   */
  bankAccount: string;

  /**
   * 是否已开票：0-未开票，1-已开票
   */
  isInvoiced: number;

  /**
   * 原始价格（不含税）
   */
  originalPrice?: number;

  /**
   * 开票价格（含税）
   */
  invoicePrice?: number;

  /**
   * 创建时间
   */
  createTime?: string;
}

export interface UserInvoiceForm {
  /**
   * 主键ID
   */
  id?: number | string;

  /**
   * 系统ID
   */
  systemId?: number | string;

  /**
   * 用户ID
   */
  userId?: number | string;

  /**
   * 用户账号
   */
  userName?: string;

  /**
   * 发票抬头名称
   */
  invoiceName?: string;

  /**
   * 纳税人识别号
   */
  taxNumber?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 公司地址
   */
  companyAddress?: string;

  /**
   * 公司电话
   */
  companyPhone?: string;

  /**
   * 开户银行
   */
  openingBank?: string;

  /**
   * 银行账户
   */
  bankAccount?: string;

  /**
   * 是否已开票：0-未开票，1-已开票
   */
  isInvoiced?: number;

  /**
   * 原始价格（不含税）
   */
  originalPrice?: number;

  /**
   * 开票价格（含税）
   */
  invoicePrice?: number;

  /**
   * 订单号
   */
  orderId?: string;
}

export interface UserInvoiceQuery {
  pageNum?: number;
  pageSize?: number;
  /**
   * 订单号
   */
  orderId?: string;

  /**
   * 系统ID
   */
  systemId?: number | string;

  /**
   * 用户账号
   */
  userName?: string;

  /**
   * 发票抬头名称
   */
  invoiceName?: string;

  /**
   * 纳税人识别号
   */
  taxNumber?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 是否已开票：0-未开票，1-已开票
   */
  isInvoiced?: number;

  /**
   * 创建时间
   */
  createTime?: string;
}

export const invoiceService = {
  /**
   * 查询用户发票信息列表
   * @param params 查询参数
   * @returns 发票信息列表
   */
  getUserInvoiceList: (params?: UserInvoiceQuery) => {
    return request.get<ApiResponse<{ rows: UserInvoiceVO[]; total: number }>>(
      '/system/userInvoice/list',
      { params }
    );
  },

  /**
   * 查询用户发票信息详情
   * @param id 发票ID
   * @returns 发票信息详情
   */
  getUserInvoiceInfo: (id: number | string) => {
    return request.get<ApiResponse<UserInvoiceVO>>(`/system/userInvoice/${id}`);
  },

  /**
   * 新增用户发票信息
   * @param data 发票信息数据
   * @returns 结果
   */
  addUserInvoice: (data: UserInvoiceForm) => {
    return request.post<ApiResponse<void>>('/system/userInvoice', data);
  },

  /**
   * 更新用户发票信息
   * @param data 发票信息数据
   * @returns 结果
   */
  updateUserInvoice: (data: UserInvoiceForm) => {
    return request.put<ApiResponse<void>>('/system/userInvoice', data);
  },

  /**
   * 删除用户发票信息
   * @param id 发票ID或ID数组
   * @returns 结果
   */
  removeUserInvoice: (id: number | string | (number | string)[]) => {
    const idParam = Array.isArray(id) ? id.join(',') : id;
    return request.delete<ApiResponse<void>>(`/system/userInvoice/${idParam}`);
  },

  /**
   * 更新开票状态
   * @param id 发票ID
   * @param isInvoiced 开票状态：0-未开票，1-已开票
   * @returns 结果
   */
  updateInvoiceStatus: (id: number | string, isInvoiced: number) => {
    return request.put<ApiResponse<void>>(
      '/system/userInvoice/updateInvoiceStatus',
      null,
      {
        params: { id, isInvoiced },
      }
    );
  },

  /**
   * 导出用户发票信息列表
   * @param params 查询参数
   * @returns 导出文件
   */
  exportUserInvoice: (params?: UserInvoiceQuery) => {
    return request.get('/system/userInvoice/export', {
      params,
      responseType: 'blob',
    });
  },
};
