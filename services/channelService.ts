import { request } from '../lib/request';
import { ApiResponse, LabChannelVO, LabChannelForm, LabChannelQuery } from '../types';

export const channelService = {
  /**
   * 获取渠道列表
   * @param params 查询参数
   * @returns 渠道列表
   */
  getChannelList: (params?: LabChannelQuery) => {
    return request.get<ApiResponse<{ rows: LabChannelVO[]; total: number }>>('/ads/labChannel/list', {
      params,
    });
  },

  /**
   * 获取渠道详情
   * @param channelId 渠道ID
   * @returns 渠道详情
   */
  getChannelInfo: (channelId: string | number) => {
    return request.get<ApiResponse<LabChannelVO>>(`/ads/labChannel/${channelId}`);
  },

  /**
   * 创建渠道
   * @param data 渠道数据
   * @returns 创建结果
   */
  createChannel: (data: LabChannelForm) => {
    return request.post<ApiResponse<void>>('/ads/labChannel', data);
  },

  /**
   * 更新渠道
   * @param data 渠道数据（必须包含channelId）
   * @returns 更新结果
   */
  updateChannel: (data: LabChannelForm) => {
    return request.put<ApiResponse<void>>('/ads/labChannel', data);
  },

  /**
   * 删除渠道
   * @param channelId 渠道ID或ID数组
   * @returns 删除结果
   */
  deleteChannel: (channelId: string | number | (string | number)[]) => {
    const ids = Array.isArray(channelId) ? channelId.join(',') : channelId;
    return request.delete<ApiResponse<void>>(`/ads/labChannel/${ids}`);
  },

  /**
   * 获取渠道成员列表
   * @param params 查询参数
   * @returns 渠道成员列表
   */
  getChannelMemberList: (params?: LabChannelQuery) => {
    return request.get<ApiResponse<{ rows: any[]; total: number }>>('/ads/labChannel/channelMemberList', {
      params,
    });
  },
};

