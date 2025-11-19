import { request } from '../lib/request';
import { ApiResponse } from '../types';

// ==================== 素材管理 Types ====================

export interface AdsAssetsVO {
  id: number | string;
  assetType?: number;
  designerId?: number | string;
  assetPackageId?: number | string;
  assetTag?: string;
  assetId?: number | string;
  assetUrl?: string;
  assetName?: string;
  status?: number;
  assetDesc?: string;
  thumbnailUrl?: string;
  isPrivateModel?: boolean;
  aiAvatarId?: string;
  isShare?: number; // 1为共享，0为个人
  dataType?: number; // 1为文件，2为文件夹
  createBy?: string;
  createTime?: string;
  teamId?: number | string;
  coverUrl?: string;
}

export interface AdsAssetsForm {
  id?: number | string;
  assetType?: number;
  designerId?: number | string;
  assetPackageId?: number | string;
  assetTag?: string;
  assetId?: number | string;
  assetUrl?: string;
  assetName?: string;
  status?: number;
  assetDesc?: string;
  isPrivateModel?: boolean;
  aiAvatarId?: string;
  isShare?: number;
  dataType?: number;
  teamId?: number | string;
  coverUrl?: string;
}

export interface AdsAssetsQuery {
  pageNum?: number;
  pageSize?: number;
  assetType?: number;
  designerId?: number | string;
  assetPackageId?: number | string;
  assetTag?: string;
  assetId?: number | string;
  assetUrl?: string;
  assetName?: string;
  status?: number;
  assetDesc?: string;
  isShare?: number; // 1为共享，0为个人
  dataType?: number; // 1为文件，2为文件夹
  teamId?: number | string;
  teamIds?: string; // 多个团队ID，逗号分隔
}

export const assetsService = {
  /**
   * 查询素材列表
   * Endpoint: GET /ads/adsAssets/list
   */
  getAssetsList: (params?: AdsAssetsQuery) => {
    return request.get<ApiResponse<AdsAssetsVO>>('/ads/adsAssets/list', {
      params
    });
  },

  /**
   * 查询素材详情
   * Endpoint: GET /ads/adsAssets/{id}
   */
  getAssetsInfo: (id: number | string) => {
    return request.get<ApiResponse<AdsAssetsVO>>(`/ads/adsAssets/${id}`);
  },

  /**
   * 新增素材
   * Endpoint: POST /ads/adsAssets
   */
  addAssets: (data: AdsAssetsForm) => {
    return request.post<ApiResponse<void>>('/ads/adsAssets', data);
  },

  /**
   * 更新素材
   * Endpoint: PUT /ads/adsAssets
   */
  updateAssets: (data: AdsAssetsForm) => {
    return request.put<ApiResponse<void>>('/ads/adsAssets', data);
  },

  /**
   * 删除素材
   * Endpoint: DELETE /ads/adsAssets/{id}
   */
  removeAssets: (id: number | string | (number | string)[]) => {
    const ids = Array.isArray(id) ? id.join(',') : id;
    return request.delete<ApiResponse<void>>(`/ads/adsAssets/${ids}`);
  },

  /**
   * 移动文件/文件夹
   * Endpoint: POST /ads/adsAssets/move
   */
  moveAssets: (ids: (number | string)[], targetFolderId?: number | string | null) => {
    const params: Record<string, any> = {
      ids: ids.join(',')
    };
    if (targetFolderId !== undefined && targetFolderId !== null) {
      params.targetFolderId = targetFolderId;
    }
    return request.post<ApiResponse<void>>('/ads/adsAssets/move', null, {
      params
    });
  },

  /**
   * 获取文件夹树结构
   * Endpoint: GET /ads/adsAssets/folders
   */
  getFolders: (excludeIds?: (number | string)[], teamIds?: string) => {
    return request.get<ApiResponse<AdsAssetsVO[]>>('/ads/adsAssets/folders', {
      params: {
        excludeIds: excludeIds?.join(','),
        teamIds
      }
    });
  },

  /**
   * 下载素材
   * Endpoint: POST /ads/adsAssets/download
   */
  downloadAssets: (data: {
    assetFileType?: string;
    assetName?: string;
    assetUrl?: string;
  }) => {
    return request.post<ApiResponse<any>>('/ads/adsAssets/download', data);
  }
};

