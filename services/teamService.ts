import { request } from '../lib/request';
import { ApiResponse, LabTeamVO, LabTeamForm, LabTeamQuery, TeamUserVO } from '../types';

export const teamService = {
  /**
   * 获取团队列表
   * @param params 查询参数
   * @returns 团队列表
   */
  getTeamList: (params?: LabTeamQuery) => {
    return request.get<ApiResponse<{ rows: LabTeamVO[]; total: number }>>('/ads/labTeam/list', {
      params,
    });
  },

  /**
   * 根据渠道ID获取团队列表
   * @param channelId 渠道ID（可选）
   * @returns 团队列表
   */
  getTeamListByChannel: (channelId?: number) => {
    return request.get<ApiResponse<LabTeamVO[]>>('/ads/labTeam/listByChannel', {
      params: channelId ? { channelId } : {},
    });
  },

  /**
   * 获取团队详情
   * @param teamId 团队ID
   * @returns 团队详情
   */
  getTeamInfo: (teamId: string | number) => {
    return request.get<ApiResponse<LabTeamVO>>(`/ads/labTeam/${teamId}`);
  },

  /**
   * 创建团队
   * @param data 团队数据
   * @returns 创建结果（返回 teamId）
   */
  createTeam: (data: LabTeamForm) => {
    return request.post<ApiResponse<number>>('/ads/labTeam', data);
  },

  /**
   * 更新团队
   * @param data 团队数据（必须包含teamId）
   * @returns 更新结果
   */
  updateTeam: (data: LabTeamForm) => {
    return request.put<ApiResponse<void>>('/ads/labTeam', data);
  },

  /**
   * 删除团队
   * @param teamId 团队ID或ID数组
   * @returns 删除结果
   */
  deleteTeam: (teamId: string | number | (string | number)[]) => {
    const ids = Array.isArray(teamId) ? teamId.join(',') : teamId;
    return request.delete<ApiResponse<void>>(`/ads/labTeam/${ids}`);
  },

  /**
   * 获取团队成员列表
   * @param teamId 团队ID
   * @param params 查询参数
   * @returns 团队成员列表
   */
  getTeamMemberList: (teamId: string | number, params?: { pageNum?: number; pageSize?: number }) => {
    return request.get<ApiResponse<{ rows: TeamUserVO[]; total: number }>>('/ads/teamUser/list', {
      params: {
        teamId,
        ...params,
      },
    });
  },

  /**
   * 获取团队成员详细信息列表（关联用户表和角色表）
   * @param teamId 团队ID
   * @param params 查询参数
   * @returns 团队成员详细信息列表
   */
  getTeamMemberDetailList: (teamId: string | number, params?: { pageNum?: number; pageSize?: number }) => {
    return request.get<ApiResponse<{ rows: TeamUserVO[]; total: number }>>(`/ads/teamUser/team/${teamId}/detail`, {
      params,
    });
  },

  /**
   * 获取邀请用户列表（根据渠道ID）
   * @param channelId 渠道ID
   * @param searchKeyword 搜索关键词
   * @param params 查询参数
   * @returns 邀请用户列表
   */
  getInviteUserList: (channelId: string | number, searchKeyword?: string, params?: { pageNum?: number; pageSize?: number }) => {
    return request.get<ApiResponse<{ rows: any[]; total: number }>>('/system/userInvite/detail', {
      params: {
        channelId,
        searchKeyword,
        ...params,
      },
    });
  },

  /**
   * 添加团队成员
   * @param data 成员数据
   * @returns 添加结果
   */
  addTeamMember: (data: { teamId: string | number; userIds: (string | number)[]; userAuthType?: number; roleId?: string | number }) => {
    return request.post<ApiResponse<void>>('/ads/teamUser', data);
  },

  /**
   * 移除团队成员
   * @param teamId 团队ID
   * @param userId 用户ID或ID数组
   * @returns 移除结果
   */
  removeTeamMember: (teamId: string | number, userId: string | number | (string | number)[]) => {
    const userIds = Array.isArray(userId) ? userId.join(',') : userId;
    return request.delete<ApiResponse<void>>(`/ads/teamUser/${teamId}/${userIds}`);
  },

  /**
   * 更新团队成员权限
   * @param data 成员数据
   * @returns 更新结果
   */
  updateTeamMember: (data: { teamId: string | number; userId: string | number; userAuthType?: number; roleId?: string | number }) => {
    return request.put<ApiResponse<void>>('/ads/teamUser', data);
  },
};

