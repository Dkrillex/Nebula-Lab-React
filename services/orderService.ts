import { request } from '../lib/request';
import { ApiResponse } from '../types';

// Order Types
export interface CreateOrderParams {
  name: string;
  totalAmount: number | string;
  type: string;
  userId?: string | number;
  userName?: string;
  nebulaApiId?: string | number;
  appMenu?: string;
  appType?: string | number;
  appCount?: number;
  productPeriod?: string;
  isInvoice?: number;
  originalPrice?: number;
  invoiceName?: string;
  taxNumber?: string;
  email?: string;
  companyAddress?: string;
  companyPhone?: string;
  openingBank?: string;
  bankAccount?: string;
  antomPayType?: string;
}

export interface OrderInfo {
  codeUrl: string;
  outTradeNo: string;
  totalAmount?: number | string; // 实际支付金额（含税）
  originalAmount?: number | string; // 原始金额（不含税，用于显示）
  [key: string]: any;
}

export interface AntomPaymentRequest {
  name: string;
  totalAmount: string;
  type: string;
  antomPayType: string;
  userId?: string | number;
  userName?: string;
  nebulaApiId?: string | number;
  appMenu?: string;
  appType?: string | number;
  appCount?: number;
  productPeriod?: string;
  isInvoice?: number;
  originalPrice?: number;
  invoiceName?: string;
  taxNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  openingBank?: string;
  bankAccount?: string;
}

export interface AntomPaymentResponse {
  paymentRequestId: string;
  normalUrl?: string;
  paymentId?: string;
  paymentStatus?: string;
}

export const orderService = {
  /**
   * Create Wechat Order
   */
  createOrder: (data: CreateOrderParams) => {
    return request.post<OrderInfo>('/pay/prepay', data);
  },

  /**
   * Query Wechat Order Status
   */
  queryOrder: (data: { outTradeNo: string }) => {
    return request.get<any>('/pay/queryOrderByOrderNo', { params: data });
  },

  /**
   * Create Antom Payment Session
   */
  createAntomPaymentSession: (data: AntomPaymentRequest) => {
    return request.post<AntomPaymentResponse>('/antom/create-payment-session', data);
  },

  /**
   * Query Antom Payment Result
   */
  queryAntomPaymentResult: (paymentRequestId: string) => {
    return request.get<AntomPaymentResponse>(`/antom/query-payment-result/${paymentRequestId}`);
  }
};
