
import { request } from '../lib/request';
import { AIModel } from '../types';

export interface ModelListResponse {
  models: AIModel[];
  vendors: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  billingTypes: Array<{ name: string; count: number }>;
  exchangeRate: number;
}

export interface ModelQueryParams {
  search?: string;
  vendor?: string;
  tag?: string;
  quotaType?: number;
  endpointType?: string;
  pageNum?: number;
  pageSize?: number;
}

export const modelService = {
  /**
   * Fetch list of available models with filter options
   */
  getModels: async (params?: ModelQueryParams): Promise<ModelListResponse> => {
    try {
      const queryParams = {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 1000,
        modelName: params?.search,
        vendor: params?.vendor,
        tag: params?.tag,
        quotaType: params?.quotaType,
        endpointType: params?.endpointType
      };

      const res = await request.get<any>('/api/pricing/list', { 
        params: queryParams,
        isTransformResponse: false // 获取原始响应以访问 billingTypes, exchangeRate 等额外字段
      });
      
      console.log('📋 模型广场 API 响应:', res);

      // 处理不同的响应格式
      let rows: any[] = [];
      
      // 优先处理直接包含 rows 的结构（如: { rows: [], total: 0, success: true }）
      if (res && Array.isArray(res.rows)) {
        rows = res.rows;
      }
      else if (res.code === 200) {
        // 标准格式：{ code: 200, rows: [...], total: ... }
        if (res.rows && Array.isArray(res.rows)) {
          rows = res.rows;
        } 
        // 兼容格式：{ code: 200, data: { rows: [...], total: ... } }
        else if ((res as any).data?.rows && Array.isArray((res as any).data.rows)) {
          rows = (res as any).data.rows;
        }
        // 兼容格式：{ code: 200, data: [...] }
        else if ((res as any).data && Array.isArray((res as any).data)) {
          rows = (res as any).data;
        }
      } else if (Array.isArray(res)) {
        // 直接返回数组格式
        rows = res;
      }

      console.log('📋 解析后的模型数据行数:', rows.length);

      // 获取后端返回的元数据
      const backendTags = (res as any)?.tags ?? [];
      const backendVendors = (res as any)?.vendors ?? [];
      const backendBillingTypes = (res as any)?.billingTypes ?? [];
      const exchangeRate = (res as any)?.exchangeRate ?? 7.3;

      if (rows.length === 0) {
        console.warn('⚠️ 模型列表为空');
        return {
          models: [],
          vendors: [],
          tags: [],
          billingTypes: [],
          exchangeRate
        };
      }
      
      // Map backend pricing list to AIModel structure
      const mappedModels = rows.map((item: any) => {
        // 处理价格字段：可能是字符串或数字
        const inputPrice = typeof item.inputPrice === 'string' 
          ? parseFloat(item.inputPrice) || 0 
          : (item.inputPrice || 0);
        const outputPrice = typeof item.outputPrice === 'string' 
          ? parseFloat(item.outputPrice) || 0 
          : (item.outputPrice || 0);
        
        // 处理供应商名称：优先使用 vendorName，否则从 modelName 推断
        const provider = item.vendorName || classifyProvider(item.modelName);
        
        // 处理标签：从 tags 字段解析，或从 modelName 推断
        let tags: string[] = [];
        if (item.tags) {
          tags = typeof item.tags === 'string' ? item.tags.split(',').filter(Boolean) : item.tags;
        } else {
          tags = classifyTags(item.modelName);
        }
        
        // 处理能力标签：从 enableGroupsList 或 tags 解析
        let capabilities: string[] = [];
        if (item.enableGroupsList && Array.isArray(item.enableGroupsList)) {
          capabilities = item.enableGroupsList;
        } else if (item.tags) {
          capabilities = typeof item.tags === 'string' ? item.tags.split(',').filter(Boolean) : item.tags;
        } else {
          capabilities = ['chat'];
        }
        
        // 处理计费类型：根据 quotaType 判断
        let billingType: 'token' | 'time' = 'token';
        if (item.quotaType === 3) {
          billingType = 'time'; // 按秒计费
        } else if (item.quotaType === 5) {
          billingType = 'time'; // 按张计费（图片生成）
        }

        return {
          id: item.modelName || item.id || `model-${Date.now()}-${Math.random()}`,
          name: item.modelName || item.displayName || '未知模型',
          description: item.remark || item.description || item.productDescription || '',
          provider,
        contextLength: 0, // Not available in pricing list
          inputPrice,
          outputPrice,
          imagePrice: item.imagePrice || item.imageModelPricePerImage,
          isNew: item.isNew === 1 || item.status === 1 || false,
          isFree: inputPrice === 0 && outputPrice === 0,
          tags,
          capabilities,
          billingType,
          // 添加原始数据字段，用于详情显示
          quotaType: item.quotaType,
          modelRatio: item.modelRatio,
          modelPrice: item.modelPrice,
          originModelPrice: item.originModelPrice,
          originModelRatio: item.originModelRatio,
          completionRatio: item.completionRatio,
          originCompletionRatio: item.originCompletionRatio,
          vendorName: item.vendorName,
          iconUrl: item.icon || item.vendorIcon || item.iconUrl,
          supportedEndpointTypes: item.supportedEndpointTypes,
          supportedEndpointTypesList: item.supportedEndpointTypesList,
          enableGroups: item.enableGroups,
          enableGroupsList: item.enableGroupsList,
          flag: item.flag,
          imageModelPricePerImage: item.imageModelPricePerImage,
          originImageModelPricePerImage: item.originImageModelPricePerImage,
          imageTokenPricing: item.imageTokenPricing,
          originImageTokenPricing: item.originImageTokenPricing,
          multiModalPricing: item.multiModalPricing,
          originMultiModalPricing: item.originMultiModalPricing,
          videoPricing: item.videoPricing,
          originVideoPricing: item.originVideoPricing,
        } as any;
      }) as AIModel[];

      console.log('📋 映射后的模型列表:', mappedModels.length, '条');
      
      return {
        models: mappedModels,
        vendors: backendVendors,
        tags: backendTags,
        billingTypes: backendBillingTypes,
        exchangeRate
      };
    } catch (error) {
      console.error("❌ 获取模型列表失败:", error);
      return {
        models: [],
        vendors: [],
        tags: [],
        billingTypes: [],
        exchangeRate: 7.3
      };
    }
  },

  /**
   * Get details of a specific model
   */
  getModelById: (id: string) => {
    return request.get<AIModel>(`/models/${id}`);
  },

  /**
   * (Optional) Invoke a model (if backend proxies it)
   */
  invokeModel: (modelId: string, prompt: string) => {
    return request.post(`/chat/completions`, { model: modelId, messages: [{ role: 'user', content: prompt }] });
  }
};

// Helper to categorize providers based on model name convention
function classifyProvider(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('gpt') || n.includes('o1')) return 'OpenAI';
  if (n.includes('claude')) return 'Claude';
  if (n.includes('gemini')) return 'Google';
  if (n.includes('midjourney') || n.includes('mj')) return 'Midjourney';
  if (n.includes('qwen')) return 'Alibaba';
  if (n.includes('deepseek')) return 'DeepSeek';
  return 'Other';
}

// Helper to generate tags based on model name
function classifyTags(name: string): string[] {
  const tags: string[] = [];
  const n = name.toLowerCase();
  
  if (n.includes('gpt-4') || n.includes('opus') || n.includes('pro')) tags.push('Smart');
  if (n.includes('flash') || n.includes('haiku') || n.includes('mini')) tags.push('Fast');
  if (n.includes('vision') || n.includes('mj') || n.includes('dall')) tags.push('Image');
  if (n.includes('code')) tags.push('Coding');
  
  return tags;
}
