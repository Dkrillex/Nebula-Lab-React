import { request } from '../lib/request';

export interface TeamRoleVO {
  roleId: number;
  teamId: number;
  roleName: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export const teamRoleService = {
  /**
   * 根据团队ID查询角色列表
   */
  teamRoleListByTeam: (teamId: number) => {
    return request.get<TeamRoleVO[]>(`/ads/teamRole/team/${teamId}`);
  },

  /**
   * 更新团队成员的角色
   */
  updateMemberRole: (teamId: number, userId: string, userAuthType: number, userRoleId?: number) => {
    return request.put(`/ads/teamUser/role/${teamId}/${userId}/${userAuthType}`, null, {
      params: { userRoleId }
    });
  },

  /**
   * 智能更新团队角色
   */
  updateTeamRoles: (teamId: number, roleNames: string[]) => {
    return request.put(`/ads/teamRole/team/${teamId}`, roleNames);
  }
};

