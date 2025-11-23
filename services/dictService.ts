import { request } from '../lib/request';
import { ApiResponse } from '../types';

export interface DictData {
  dictCode: string | number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass: string | null;
  listClass: string | null;
  isDefault: string;
  status?: string;
  remark: string | null;
  createTime?: string;
}

export const dictService = {
  /**
   * Get dictionary data by type
   * Endpoint: GET /system/dict/data/type/{dictType}
   * Note: request.get automatically unwraps the ApiResponse and returns the data field
   * So this returns DictData[] directly, not ApiResponse<DictData[]>
   */
  getDicts: (dictType: string) => {
    return request.get<DictData[]>(`/system/dict/data/type/${dictType}`);
  }
};

