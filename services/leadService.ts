import { request } from '../lib/request';
import { ApiResponse } from '../types';

// 线索表单数据类型
export interface LeadFormData {
  name: string;           // 姓名
  email: string;          // 邮箱
  phone: string;          // 电话
  company: string;        // 公司名称
  message: string;        // 留言
  channel: string;        // 留言渠道（微信/小红书/公众号/其他）
}

// 线索渠道选项
export const LEAD_CHANNELS = [
  { value: 'wechat', label: '微信' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'gongzhonghao', label: '公众号' },
  { value: 'douyin', label: '抖音' },
  { value: 'weibo', label: '微博' },
  { value: 'search', label: '搜索引擎' },
  { value: 'friend', label: '朋友推荐' },
  { value: 'other', label: '其他' },
];

export const leadService = {
  /**
   * 提交企业线索
   * Endpoint: POST /api/lead/submit
   */
  submitLead: (data: LeadFormData) => {
    return request.post<ApiResponse<{ id: string }>>('/ads/labLead', data);
  },
};

