import { request } from '../lib/request';
import { ApiResponse, LabProjectVO, LabProjectForm, LabProjectQuery } from '../types';

export const labProjectService = {
  /**
   * 获取Lab项目列表（分页）
   * @param params 查询参数
   * @returns Lab项目列表
   */
  getProjectList: (params?: LabProjectQuery) => {
    return request.get<ApiResponse<{ rows: LabProjectVO[]; total: number }>>('/ads/labProject/list', {
      params,
    });
  },

  /**
   * 获取Lab项目详情
   * @param projectId 项目ID
   * @returns Lab项目详情
   */
  getProjectInfo: (projectId: string | number) => {
    return request.get<ApiResponse<LabProjectVO>>(`/ads/labProject/${projectId}`);
  },

  /**
   * 创建Lab项目
   * @param data 项目数据
   * @returns 创建结果
   */
  createProject: (data: LabProjectForm) => {
    return request.post<ApiResponse<LabProjectVO>>('/ads/labProject', data);
  },

  /**
   * 更新Lab项目
   * @param data 项目数据（必须包含id）
   * @returns 更新结果
   */
  updateProject: (data: LabProjectForm) => {
    return request.put<ApiResponse<void>>('/ads/labProject', data);
  },

  /**
   * 删除Lab项目
   * @param projectId 项目ID或ID数组
   * @returns 删除结果
   */
  deleteProject: (projectId: string | number | (string | number)[]) => {
    const ids = Array.isArray(projectId) ? projectId.join(',') : projectId;
    return request.delete<ApiResponse<void>>(`/ads/labProject/${ids}`);
  },

  /**
   * 导出Lab项目列表
   * @param params 查询参数
   * @returns 导出文件
   */
  exportProjectList: (params?: LabProjectQuery) => {
    return request.post<Blob>('/ads/labProject/export', params ?? {}, {
      responseType: 'blob',
    });
  },
};

