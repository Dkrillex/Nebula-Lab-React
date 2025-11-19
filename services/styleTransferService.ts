import { request } from '../lib/request';
import { ApiResponse } from '../types';

// ==================== 万物迁移（标准模式）Types ====================

export interface AnyShootStandardParams {
  productImageFileId?: string; // 产品图片文件ID
  productMaskFileId?: string;  // 产品蒙版文件ID（可选）
  templateId?: string;         // 模板ID
  templateImageFileId?: string; // 模板图片文件ID
  templateMaskFileId?: string;  // 模板蒙版文件ID（可选）
  generatingCount?: number;    // 生成数量 1-4
  mode?: string;               // 模式
  score?: string;              // 积分
}

export interface AnyShootStandardResult {
  taskId: string;
  status: string;
  msg?: string;
}

// ==================== 万物迁移（创意模式）Types ====================

export interface AnyShootCreativeParams {
  contents: Array<{
    parts: Array<{
      text?: string;
      image?: string;
    }>;
  }>;
  size?: string; // 图片尺寸，如 "1024x1024"
}

export interface AnyShootCreativeResult {
  id?: string;
  taskId?: string;
  status?: string;
  msg?: string;
  // 创意模式可能直接返回图片数组
  data?: Array<{
    url?: string;
    image_url?: string;
    revised_prompt?: string;
    b64_json?: string;
  }>;
}

// ==================== 万物迁移（服装模式）Types ====================

export interface DressingParams {
  score: string;
  volcDressingV2Bo: {
    garment: {
      data: {
        type: string; // 'top', 'bottom', 'full'
        url: string;
      }[];
    };
    model: {
      id: string;
      url: string;
    };
    req_key: string;
    inference_config?: any;
  };
}

export interface DressingResult {
  taskId?: string;
  id?: string;
  status?: string;
  msg?: string;
}

// ==================== 模板相关 Types ====================

export interface TemplateCategory {
  categoryId: string;
  categoryName: string;
}

export interface Template {
  templateId: string;
  templateName: string;
  templateImageUrl: string;
  templateMaskUrl?: string;
  categoryId?: string;
  style?: string;
}

export interface TemplateListParams {
  categoryIds?: string;
  pageNo?: number;
  pageSize?: number;
  style?: string;
}

// ==================== 查询结果 Types ====================

export interface AnyShootTaskResult {
  taskId: string;
  status: string; // 'init', 'processing', 'success', 'fail'
  errorMsg?: string;
  resultImages?: string[]; // 生成的图片URL数组
  progress?: number;
}

export const styleTransferService = {
  /**
   * 标准模式提交
   * Endpoint: /tp/v2/product/anyshoot/submit (V2版本)
   */
  submitStandard: (data: AnyShootStandardParams) => {
    return request.post<ApiResponse<AnyShootStandardResult>>('/tp/v2/product/anyshoot/submit', data, {
      timeout: 300000 // 5分钟超时
    });
  },

  /**
   * 标准模式查询
   * Endpoint: /tp/v2/product/anyshoot/query
   */
  queryStandard: (taskId: string) => {
    return request.get<ApiResponse<AnyShootTaskResult>>('/tp/v2/product/anyshoot/query', {
      params: { taskId, needCloudFrontUrl: true }
    });
  },

  /**
   * 创意模式提交
   * Endpoint: /tp/v1/anyShootSDSubmit
   */
  submitCreative: (data: AnyShootCreativeParams) => {
    return request.post<ApiResponse<AnyShootCreativeResult>>('/tp/v1/anyShootSDSubmit', data, {
      timeout: 300000 // 5分钟超时
    });
  },

  /**
   * 创意模式查询
   * Endpoint: /tp/v1/anyShootQuery
   */
  queryCreative: (taskId: string) => {
    return request.get<ApiResponse<AnyShootTaskResult>>('/tp/v1/anyShootQuery', {
      params: { taskId, needCloudFrontUrl: true }
    });
  },

  /**
   * 服装模式提交（V2版本）
   * Endpoint: /tp/v1/dressing2Submit
   */
  submitClothing: (data: DressingParams) => {
    return request.post<ApiResponse<DressingResult>>('/tp/v1/dressing2Submit', data);
  },

  /**
   * 服装模式查询
   * Endpoint: /tp/v1/dressing2Qurey
   */
  queryClothing: (taskId: string) => {
    return request.get<ApiResponse<AnyShootTaskResult>>('/tp/v1/dressing2Qurey', {
      params: { taskId }
    });
  },

  /**
   * 获取模板分类列表
   * Endpoint: /tp/v1/TemplateCategoryList
   */
  getTemplateCategories: () => {
    return request.get<ApiResponse<TemplateCategory[]>>('/tp/v1/TemplateCategoryList');
  },

  /**
   * 获取模板列表
   * Endpoint: /tp/v1/TemplateList
   */
  getTemplateList: (params?: TemplateListParams) => {
    return request.get<ApiResponse<{ data: Template[]; total: number }>>('/tp/v1/TemplateList', {
      params
    });
  }
};

