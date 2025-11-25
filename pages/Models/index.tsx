import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, ChevronDown, Box, X, ChevronLeft, ChevronRight, MessageSquare, Image as ImageIcon, Video as VideoIcon, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppOutletContext } from '@/router/context';
import { modelService } from '@/services/modelService.ts';
import { AIModel } from '@/types.ts';
import toast from 'react-hot-toast';

interface ModelSquarePageProps {
  t?: any;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

const getBillingTypeLabel = (quotaType?: number): string => {
  if (quotaType === 0) return '按量计费';
  if (quotaType === 1) return '按次计费';
  if (quotaType === 2) return '按资源类型计费';
  if (quotaType === 3) return '按秒计费';
  if (quotaType === 4) return '按全模态计费';
  if (quotaType === 5) return '按张计费';
  return '未知';
};

const FilterDropdown = ({ label, options, value, onChange }: { 
  label: string; 
  options: FilterOption[]; 
  value: string; 
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 outline-none transition-all text-zinc-900 dark:text-zinc-100 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
    </div>
  </div>
);

const ModelSquarePage: React.FC<ModelSquarePageProps> = (props) => {
  const { t: rootT } = useAppOutletContext();
  // 防止 rootT 或 rootT.modelSquare 为空导致崩溃
  const t = props.t || rootT?.modelSquare || translations['zh'].modelSquare;
  
  const navigate = useNavigate();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 控制筛选面板显示 (桌面端Sidebar / 移动端Inline Block)
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  
  // 筛选条件
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedBilling, setSelectedBilling] = useState('');
  const [selectedEndpointType, setSelectedEndpointType] = useState('');
  
  // 显示设置
  const [currency, setCurrency] = useState<'USD' | 'CNY'>('USD');
  const [unit, setUnit] = useState<'K' | 'M'>('M');
  
  // 筛选选项
  const [vendorOptions, setVendorOptions] = useState<FilterOption[]>([]);
  const [tagOptions, setTagOptions] = useState<FilterOption[]>([]);
  const [billingTypeOptions, setBillingTypeOptions] = useState<FilterOption[]>([]);
  const [endpointTypeOptions, setEndpointTypeOptions] = useState<FilterOption[]>([]);
  const [exchangeRate, setExchangeRate] = useState(7.3);
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // 详情抽屉
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  // 获取模型数据 (只在组件挂载时执行一次，后续为前端筛选)
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        // 获取所有数据用于前端筛选
        const response = await modelService.getModels({
          pageNum: 1,
          pageSize: 1000,
        });
        console.log('📋 模型广场获取到的全量数据:', response);
        
        const modelsArray = Array.isArray(response?.models) ? response.models : [];
        
        // 数据预处理：补充 modelType 字段，确保与 Vue 逻辑一致
        const transformedModels = modelsArray.map((item: any) => {
          let modelType = '按量计费';
          if (item.quotaType === 1) modelType = '按次计费';
          else if (item.quotaType === 2) modelType = '按资源类型计费';
          else if (item.quotaType === 3) modelType = '按秒计费';
          else if (item.quotaType === 4) modelType = '按全模态计费';
          else if (item.quotaType === 5) modelType = '按张计费';
          return {
            ...item,
            modelType,
          };
        });

        setModels(transformedModels);
        setExchangeRate(response?.exchangeRate || 7.3);
        
        // 计算供应商选项 - 即使后端没有返回完整的 vendors 列表，也从模型数据中统计
        const vendorCounts = new Map<string, number>();
        // 如果后端返回了 vendors 列表，先初始化这些厂商的计数为 0
        const backendVendors = (Array.isArray(response?.vendors) ? response.vendors as any[] : []);
        backendVendors.forEach((v: any) => {
          const name = typeof v === 'string' ? v : v.name;
          vendorCounts.set(name, 0);
        });

        // 从模型数据中统计实际数量
        transformedModels.forEach(model => {
          const vendor = model.vendorName || model.provider;
          if (vendor) {
            vendorCounts.set(vendor, (vendorCounts.get(vendor) || 0) + 1);
          }
        });

        const vendors: FilterOption[] = [
          { value: '', label: `全部(${transformedModels.length})`, count: transformedModels.length },
          ...Array.from(vendorCounts.entries()).map(([name, count]) => ({
            value: name,
            label: `${name}(${count})`,
            count
          }))
        ];
        // 如果从 transformedModels 统计为空（不太可能），则回退到使用 backendVendors
        if (vendors.length === 1 && backendVendors.length > 0) {
             const fallbackVendors = backendVendors.map((v: any) => ({
                value: typeof v === 'string' ? v : v.name,
                label: typeof v === 'string' ? `${v}(0)` : `${v.name}(${v.count || 0})`,
                count: typeof v === 'string' ? 0 : (v.count || 0)
             }));
             vendors.push(...fallbackVendors);
        }
        setVendorOptions(vendors);
        
        // 计算标签选项
        const tagCounts = new Map<string, number>();
        const backendTags = (Array.isArray(response?.tags) ? response.tags as any[] : []);
         backendTags.forEach((tag: any) => {
            const name = typeof tag === 'string' ? tag : tag.name;
            tagCounts.set(name, 0);
        });

        transformedModels.forEach(model => {
          if (model.tags && Array.isArray(model.tags)) {
            model.tags.forEach(tag => {
              if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
          } else if (model.tags && typeof model.tags === 'string') {
             (model.tags as string).split(',').forEach(tag => {
                const t = tag.trim();
                if (t) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
             });
          }
        });

        const tags: FilterOption[] = [
          { value: '', label: `全部(${transformedModels.length})`, count: transformedModels.length },
          ...Array.from(tagCounts.entries()).map(([name, count]) => ({
            value: name,
            label: `${name}(${count})`,
            count
          }))
        ];
        setTagOptions(tags);
        
        // 计费类型选项 (参考 Vue 逻辑)
        const backendBillingTypes = (Array.isArray(response?.billingTypes) ? response.billingTypes as any[] : []);
        // 这里主要依赖后端返回的 billingTypes 元数据，如果为空则手动构建
        let billingTypes: FilterOption[] = [];
        if (backendBillingTypes.length > 0) {
            billingTypes = [
            { value: '', label: `全部(${transformedModels.length})`, count: transformedModels.length },
            ...backendBillingTypes.map((bt: any) => {
                const name = typeof bt === 'string' ? bt : bt.name;
                const count = typeof bt === 'string' ? 0 : (bt.count || 0);
                
                // 转换为内部 value (参考 Vue)
                let value = 'pay-per-use';
                if (name === '按次计费') value = 'pay-per-call';
                else if (name === '按资源类型计费') value = 'pay-per-resource';
                else if (name === '按秒计费') value = 'pay-per-second';
                else if (name === '按全模态计费') value = 'pay-per-multimodal';
                else if (name === '按张计费') value = 'pay-per-image';
                else if (name === '按量计费') value = 'pay-per-use';
                
                return {
                value: value,
                label: `${name}(${count})`,
                count
                };
            })
            ];
        } else {
            // 手动统计计费类型
            const billingCounts = {
                'pay-per-use': 0,
                'pay-per-call': 0,
                'pay-per-resource': 0,
                'pay-per-second': 0,
                'pay-per-multimodal': 0,
                'pay-per-image': 0
            };
            transformedModels.forEach((m: any) => {
                if (m.quotaType === 0) billingCounts['pay-per-use']++;
                else if (m.quotaType === 1) billingCounts['pay-per-call']++;
                else if (m.quotaType === 2) billingCounts['pay-per-resource']++;
                else if (m.quotaType === 3) billingCounts['pay-per-second']++;
                else if (m.quotaType === 4) billingCounts['pay-per-multimodal']++;
                else if (m.quotaType === 5) billingCounts['pay-per-image']++;
            });
             billingTypes = [
                { value: '', label: `全部(${transformedModels.length})`, count: transformedModels.length },
                { value: 'pay-per-use', label: `按量计费(${billingCounts['pay-per-use']})`, count: billingCounts['pay-per-use'] },
                { value: 'pay-per-call', label: `按次计费(${billingCounts['pay-per-call']})`, count: billingCounts['pay-per-call'] },
                { value: 'pay-per-resource', label: `按资源类型计费(${billingCounts['pay-per-resource']})`, count: billingCounts['pay-per-resource'] },
                { value: 'pay-per-second', label: `按秒计费(${billingCounts['pay-per-second']})`, count: billingCounts['pay-per-second'] },
                { value: 'pay-per-multimodal', label: `按全模态计费(${billingCounts['pay-per-multimodal']})`, count: billingCounts['pay-per-multimodal'] },
                { value: 'pay-per-image', label: `按张计费(${billingCounts['pay-per-image']})`, count: billingCounts['pay-per-image'] },
             ].filter(item => item.count > 0 || item.value === '');
        }
        setBillingTypeOptions(billingTypes);

        // 统计端点类型
        const endpointMap = new Map<string, number>();
        transformedModels.forEach(model => {
          const types = (model as any).supportedEndpointTypesList;
          if (Array.isArray(types)) {
            types.forEach((type: string) => {
              const typeStr = String(type).trim();
              if (typeStr) {
                endpointMap.set(typeStr, (endpointMap.get(typeStr) || 0) + 1);
              }
            });
          }
        });
        
        const endpointTypes: FilterOption[] = [
          { value: '', label: `全部(${transformedModels.length})`, count: transformedModels.length },
          ...Array.from(endpointMap.entries()).map(([type, count]) => ({
            value: type,
            label: `${type}(${count})`,
            count
          }))
        ];
        setEndpointTypeOptions(endpointTypes);
        
      } catch (error) {
        console.error('❌ 获取模型列表失败:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  // 前端筛选逻辑 (参考 Vue computed filteredModels)
  const filteredModels = useMemo(() => {
    if (!Array.isArray(models)) return [];
    
    let filtered = [...models];

    // 1. 模型名称筛选
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(model => 
        (model.name && model.name.toLowerCase().includes(lowerSearch))
      );
    }

    // 2. 供应商筛选
    if (selectedVendor) {
      filtered = filtered.filter(model => 
        (model.vendorName || model.provider) === selectedVendor
      );
    }

    // 3. 标签筛选
    if (selectedTag) {
      filtered = filtered.filter(model => {
        if (model.tags && Array.isArray(model.tags)) {
            return model.tags.includes(selectedTag);
        } else if (model.tags && typeof model.tags === 'string') {
            return (model.tags as string).includes(selectedTag);
        }
        return false;
      });
    }

    // 4. 端点类型筛选
    if (selectedEndpointType) {
      filtered = filtered.filter(model => {
        const types = (model as any).supportedEndpointTypesList;
        return Array.isArray(types) && types.includes(selectedEndpointType);
      });
    }

    // 5. 计费类型筛选
    if (selectedBilling) {
      filtered = filtered.filter(model => {
        const quotaType = (model as any).quotaType;
        if (selectedBilling === 'pay-per-use') return quotaType === 0;
        if (selectedBilling === 'pay-per-call') return quotaType === 1;
        if (selectedBilling === 'pay-per-resource') return quotaType === 2;
        if (selectedBilling === 'pay-per-second') return quotaType === 3;
        if (selectedBilling === 'pay-per-multimodal') return quotaType === 4;
        if (selectedBilling === 'pay-per-image') return quotaType === 5;
        return true;
      });
    }

    return filtered;
  }, [models, search, selectedVendor, selectedTag, selectedEndpointType, selectedBilling]);

  // 分页数据
  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredModels.slice(start, end);
  }, [filteredModels, currentPage, pageSize]);

  // 总页数
  const totalPages = Math.ceil(filteredModels.length / pageSize);

  // 监听筛选变化，重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedVendor, selectedTag, selectedBilling, selectedEndpointType]);

  // 重置筛选
  const handleReset = () => {
    setSearch('');
    setSelectedVendor('');
    setSelectedTag('');
    setSelectedBilling('');
    setSelectedEndpointType('');
    setCurrentPage(1);
  };

  // 打开详情
  const openDetail = (model: AIModel) => {
    setSelectedModel(model);
    setDetailVisible(true);
  };

  // 切换侧边栏 (同时处理桌面和移动端)
  const toggleFilter = () => {
     setShowFilterPanel(!showFilterPanel);
  };

  // 复制模型名称到剪贴板
  const copyModelName = (model: AIModel, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击事件
    }
    
    const modelName = model.name || '';
    if (!modelName) {
      toast.error('模型名称为空，无法复制');
      return;
    }

    // 使用现代浏览器的Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(modelName)
        .then(() => {
          toast.success(`已复制: ${modelName}`);
        })
        .catch(() => {
          // 降级到传统方法
          fallbackCopyTextToClipboard(modelName);
        });
    } else {
      // 降级到传统方法
      fallbackCopyTextToClipboard(modelName);
    }
  };

  // 降级复制方法（兼容旧浏览器）
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success(`已复制: ${text}`);
      } else {
        toast.error('复制失败，请手动复制');
      }
    } catch {
      toast.error('复制失败，请手动复制');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // 格式化价格 (保持原有逻辑)
  const formatPrice = (model: AIModel, priceType: 'discount' | 'origin' = 'discount'): string => {
    const { quotaType, modelRatio, modelPrice, originModelPrice, originModelRatio, completionRatio, originCompletionRatio } = model as any;
    
    // 按全模态计费
    if (quotaType === 4) {
      try {
        const pricingData = priceType === 'discount' 
          ? JSON.parse(model.multiModalPricing || '{}')
          : JSON.parse(model.originMultiModalPricing || '{}');
        let price = pricingData.text_input_price || 1.0;
        if (currency === 'CNY') price = price * exchangeRate;
        const symbol = currency === 'USD' ? '$' : '¥';
        return `${symbol}${formatNumber(price)}`;
      } catch (e) {
        return '-';
      }
    }
    
    // 按资源类型计费
    if (quotaType === 2) {
      try {
        const pricingData = priceType === 'discount' 
          ? JSON.parse(model.imageTokenPricing || '{}')
          : JSON.parse(model.originImageTokenPricing || '{}');
        let price = pricingData.input_text_price || 5.0;
        if (currency === 'CNY') price = price * exchangeRate;
        const symbol = currency === 'USD' ? '$' : '¥';
        return `${symbol}${formatNumber(price)}`;
      } catch (e) {
        return '-';
      }
    }
    
    // 按秒计费
    if (quotaType === 3) {
      const priceKey = priceType === 'discount' ? modelPrice : originModelPrice;
      let price = priceKey || 0;
      if (currency === 'CNY') price = price * exchangeRate;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    }
    
    // 按张计费
    if (quotaType === 5) {
      const priceKey = priceType === 'discount' 
        ? (model as any).imageModelPricePerImage 
        : (model as any).originImageModelPricePerImage;
      let price = priceKey || 0;
      if (currency === 'CNY') price = price * exchangeRate;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    }
    
    // 按次计费
    if (quotaType === 1) {
      const priceKey = priceType === 'discount' ? modelPrice : originModelPrice;
      let price = priceKey || 0;
      if (currency === 'CNY') price = price * exchangeRate;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    }

    // 按量计费
    const basePrice = 0.002;
    const ratioKey = priceType === 'discount' ? modelRatio : originModelRatio;
    const ratio = parseFloat(String(ratioKey || '1'));
    const shouldUseOutputPrice = ratio < 0.0001;
    
    let calculatedPrice = basePrice * ratio;
    if (shouldUseOutputPrice) {
      const outputRatio = parseFloat(String(completionRatio || '1.5'));
      calculatedPrice = calculatedPrice * outputRatio;
    }
    
    if (currency === 'CNY') {
      calculatedPrice = calculatedPrice * exchangeRate;
    }
    
    if (unit === 'M') {
      calculatedPrice = calculatedPrice * 1000;
    }
    
    const symbol = currency === 'USD' ? '$' : '¥';
    return `${symbol}${formatNumber(calculatedPrice)}`;
  };

  // 格式化数字
  const formatNumber = (num: number | string, maxDecimals: number = 4, minDecimals: number = 2): string => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0.00';
    
    const fixed = numValue.toFixed(maxDecimals);
    const trimmed = parseFloat(fixed).toString();
    const parts = trimmed.split('.');
    
    if (parts.length === 1) {
      return `${parts[0]}.${'0'.repeat(minDecimals)}`;
    } else {
      const decimalPart = parts[1] || '';
      if (decimalPart.length < minDecimals) {
        return `${parts[0]}.${decimalPart}${'0'.repeat(minDecimals - decimalPart.length)}`;
      }
      return trimmed;
    }
  };

  // 解析视频分辨率价格
  const parseVideoResolutions = (model: AIModel) => {
    try {
      const videoResolutionPricing = JSON.parse((model as any).videoResolutionPricing || '{}');
      return videoResolutionPricing.resolutions || {};
    } catch (e) {
      return {};
    }
  };

  const parseOriginVideoResolutions = (model: AIModel) => {
    try {
      const originVideoResolutionPricing = JSON.parse((model as any).originVideoResolutionPricing || '{}');
      return originVideoResolutionPricing.resolutions || {};
    } catch (e) {
      return {};
    }
  };

  const formatVideoResolutionPrice = (price: number) => {
    let finalPrice = price;
    if (currency === 'CNY') {
      finalPrice = price * exchangeRate;
    }
    const symbol = currency === 'USD' ? '$' : '¥';
    return `${symbol}${formatNumber(finalPrice)}`;
  };

  const formatMultiModalPrice = (model: AIModel, priceKey: string, type: 'discount' | 'origin' = 'discount') => {
    try {
      const pricingData = type === 'discount' 
        ? JSON.parse(model.multiModalPricing || '{}')
        : JSON.parse(model.originMultiModalPricing || '{}');
      
      let price = pricingData[priceKey] || 0;
      
      if (currency === 'CNY') {
        price = price * exchangeRate;
      }
      
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    } catch (e) {
      return '-';
    }
  };

  const formatImageTokenPrice = (model: AIModel, priceType: string) => {
    try {
      const pricingData = priceType.includes('origin') 
        ? JSON.parse((model as any).originImageTokenPricing || '{}')
        : JSON.parse(model.imageTokenPricing || '{}');
      
      let price = 0;
      const type = priceType.replace('origin_', '');
      
      if (type === 'input_text') {
        price = pricingData.input_text_price || 0;
      } else if (type === 'input_image') {
        price = pricingData.input_image_price || 0;
      } else if (type === 'output_image') {
        price = pricingData.output_image_price || 0;
      }
      
      if (currency === 'CNY') {
        price = price * exchangeRate;
      }
      
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)} / 1M tokens`;
    } catch (e) {
      return '-';
    }
  };

  const calculateExampleCost = (quality: string, size: string, model: AIModel) => {
    try {
      const imageTokenPricing = JSON.parse(model.imageTokenPricing || '{}');
      const inputTextPrice = imageTokenPricing.input_text_price || 5.0;
      const outputImagePrice = imageTokenPricing.output_image_price || 40.0;
      
      const tokenTable = imageTokenPricing.token_table || {};
      const outputTokens = tokenTable[quality]?.[size] || 1056;
      
      const cost = (80 * inputTextPrice + outputTokens * outputImagePrice) / 1000000;
      
      const finalCost = currency === 'CNY' ? cost * exchangeRate : cost;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(finalCost)}`;
    } catch (e) {
      return '-';
    }
  };

  const calculateImageEditCost = (quality: string, size: string, model: AIModel) => {
    try {
      const imageTokenPricing = JSON.parse(model.imageTokenPricing || '{}');
      const inputTextPrice = imageTokenPricing.input_text_price || 5.0;
      const inputImagePrice = imageTokenPricing.input_image_price || 10.0;
      const outputImagePrice = imageTokenPricing.output_image_price || 40.0;
      
      const tokenTable = imageTokenPricing.token_table || {};
      const imageTokens = tokenTable[quality]?.[size] || 1056;
      
      const cost = (80 * inputTextPrice + imageTokens * inputImagePrice + imageTokens * outputImagePrice) / 1000000;
      
      const finalCost = currency === 'CNY' ? cost * exchangeRate : cost;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(finalCost)}`;
    } catch (e) {
      return '-';
    }
  };

  // 格式化详情页面价格
  const formatDetailPrice = (
    model: AIModel,
    type: 'cacheInput' | 'cacheOutput' | 'call' | 'input' | 'output',
    priceType: 'discount' | 'origin' = 'discount',
  ) => {
    const {
      quotaType,
      modelRatio,
      originModelRatio,
      completionRatio,
      originCompletionRatio,
      modelPrice,
      originModelPrice,
      cacheRatio,
      createCacheRatio,
    } = model as any;
    // 按秒计费
    if (quotaType === 3) {
      const priceKey = priceType === 'discount' ? modelPrice : originModelPrice;
      let price = parseFloat(priceKey || '0');
      if (currency === 'CNY') price = price * exchangeRate;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    }
    
    // 按张计费
    if (quotaType === 5) {
      const priceKey = priceType === 'discount' 
        ? ((model as any).imageModelPricePerImage || modelPrice)
        : ((model as any).originImageModelPricePerImage || originModelPrice);
      let price = parseFloat(priceKey || '0');
      if (currency === 'CNY') price = price * exchangeRate;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    }
    
    // 按次计费
    if (quotaType === 1) {
      const priceKey = priceType === 'discount' ? modelPrice : originModelPrice;
      let price = parseFloat(priceKey || '0');
      if (currency === 'CNY') price = price * exchangeRate;
      const symbol = currency === 'USD' ? '$' : '¥';
      return `${symbol}${formatNumber(price)}`;
    } 
    
    // 按量计费
    const basePrice = 0.002;
    const ratioKey = priceType === 'discount' ? modelRatio : originModelRatio;
    const ratio = parseFloat(String(ratioKey || '1'));
    let calculatedPrice = basePrice * ratio;

    if (type === 'output') {
      const comRatio = priceType === 'discount' ? completionRatio : originCompletionRatio;
      const outputRatio = parseFloat(String(comRatio || '1.5'));
      calculatedPrice = calculatedPrice * outputRatio;
    }

    if (type === 'cacheInput') {
      const cRatio = parseFloat(String(createCacheRatio || '1'));
      calculatedPrice = calculatedPrice * cRatio;
    }

    if (type === 'cacheOutput') {
      const coRatio = parseFloat(String(cacheRatio || '1'));
      calculatedPrice = calculatedPrice * coRatio;
    }

    if (currency === 'CNY') {
      calculatedPrice = calculatedPrice * exchangeRate;
    }

    if (unit === 'M') {
      calculatedPrice = calculatedPrice * 1000;
    }

    const symbol = currency === 'USD' ? '$' : '¥';
    return `${symbol}${formatNumber(calculatedPrice)}`;
  };

  // 格式化价格单位

  // 格式化价格单位
  const formatPriceUnit = (model: AIModel): string => {
    const quotaType = (model as any).quotaType;
    if (quotaType === 4) return '/ 1M tokens';
    if (quotaType === 2) return '/ 1M tokens';
    if (quotaType === 3) return '/ 秒';
    if (quotaType === 5) return '/ 张';
    if (quotaType === 1) return '/ 次';
    return unit === 'K' ? '/ 1K tokens' : '/ 1M tokens';
  };

  // 格式化详情页面价格单位
  const formatDetailPriceUnit = () => {
    return unit === 'K' ? '1K tokens' : '1M tokens';
  };

  // 是否显示Token单位设置
  const shouldShowTokenUnit = useMemo(() => {
    return selectedBilling !== 'pay-per-call' && 
           selectedBilling !== 'pay-per-resource' && 
           selectedBilling !== 'pay-per-second' && 
           selectedBilling !== 'pay-per-multimodal' &&
           selectedBilling !== 'pay-per-image';
  }, [selectedBilling]);

  // 筛选面板内容渲染函数 (不是组件，避免重新挂载)
  const renderFilterContent = (isMobile: boolean = false) => (
    <div className={`h-full flex flex-col ${isMobile ? 'p-4 bg-white dark:bg-zinc-900 mb-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm' : ''}`}>
      <div className="font-semibold mb-6 text-lg text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
        {t.filterSearch}
      </div>
      
      <div className={`space-y-6 ${isMobile ? '' : 'overflow-y-auto flex-1 pr-2 custom-scrollbar'}`}>
        {/* Model Name Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t.filters.nameLabel}</label>
          <div className="relative">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.filters.searchPlaceholder}
              className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Vendor Filter */}
        <FilterDropdown 
          label={t.filters.vendorLabel} 
          options={vendorOptions} 
          value={selectedVendor} 
          onChange={setSelectedVendor} 
        />

        {/* Tag Filter */}
        <FilterDropdown 
          label={t.filters.capabilityLabel} 
          options={tagOptions} 
          value={selectedTag} 
          onChange={setSelectedTag} 
        />

        {/* Billing Type */}
        <FilterDropdown 
          label={t.filters.billingLabel} 
          options={billingTypeOptions} 
          value={selectedBilling}
          onChange={setSelectedBilling} 
        />

        {/* Endpoint Type (Parameter Size) */}
        {/* 端点类型不显示的 */}
        {/* <FilterDropdown 
          label={t.filters.endpointLabel || '端点类型'} 
          options={endpointTypeOptions} 
          value={selectedEndpointType} 
          onChange={setSelectedEndpointType} 
        /> */}

        {/* Display Settings */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t.filters.displayLabel}</label>
          <div className="grid grid-cols-1 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{t.display.currency}</span>
              <div className="flex items-center gap-2">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'USD' | 'CNY')}
                  className="bg-transparent border-none text-zinc-900 dark:text-zinc-100 font-medium text-right focus:ring-0 cursor-pointer text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                </select>
                {/* <ChevronDown size={14} className="text-zinc-400" /> */}
              </div>
            </div>
            {shouldShowTokenUnit && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{t.display.unit}</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'K' | 'M')}
                    className="bg-transparent border-none text-zinc-900 dark:text-zinc-100 font-medium text-right focus:ring-0 cursor-pointer text-sm"
                  >
                    <option value="M">M</option>
                    <option value="K">K</option>
                  </select>
                  {/* <ChevronDown size={14} className="text-zinc-400" /> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 mt-auto">
        <button 
          onClick={handleReset}
          className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {t.filters.reset}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-full flex relative flex-col lg:flex-row">
      {/* Desktop Sidebar Filter */}
      {showFilterPanel && (
        <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 p-5 flex-shrink-0 hidden lg:block h-[calc(100vh-64px)] sticky top-0 z-0">
          {renderFilterContent(false)}
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="text-zinc-900 dark:text-zinc-100 font-medium text-lg mr-2 whitespace-nowrap">{t.title}</span>
              {/* <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs hidden sm:inline-block">
                {t.filters.all} {filteredModels.length}
              </span> */}
           </div>
           
           <button 
             onClick={toggleFilter}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
           >
             <SlidersHorizontal size={14} />
             <span className="hidden sm:inline">
               {showFilterPanel ? t.filters.hideFilters : '显示筛选'}
             </span>
             <span className="sm:hidden">{showFilterPanel ? '隐藏' : '筛选'}</span>
           </button>
        </div>

        <div className="p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-900/50 min-h-[calc(100vh-64px)]">
          {/* Mobile/Tablet Inline Filter */}
          {showFilterPanel && (
            <div className="lg:hidden mb-6">
              {renderFilterContent(true)}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-400">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mb-4"></div>
                <span className="text-sm font-medium">正在加载模型广场...</span>
              </div>
            ) : paginatedModels.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-400">
                <Box size={48} strokeWidth={1.5} className="mb-4 opacity-50" />
                <span className="text-sm font-medium">
                  {models.length === 0 ? '暂无模型数据' : '没有找到匹配的模型'}
                </span>
              </div>
            ) : (
              paginatedModels.map(model => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  t={t}
                  formatPrice={formatPrice}
                  formatPriceUnit={formatPriceUnit}
                  onOpenDetail={openDetail}
                  onCopyName={copyModelName}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredModels.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-zinc-500">
                共 {filteredModels.length} 个模型，第 {currentPage} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-900"
                >
                  <ChevronLeft size={16} />
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-zinc-100 cursor-pointer"
                >
                  <option value={12}>12 / 页</option>
                  <option value={24}>24 / 页</option>
                  <option value={48}>48 / 页</option>
                </select>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-800"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {detailVisible && selectedModel && (
        <ModelDetailDrawer
          model={selectedModel}
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
          formatPrice={formatPrice}
          formatPriceUnit={formatPriceUnit}
          currency={currency}
          exchangeRate={exchangeRate}
          formatMultiModalPrice={formatMultiModalPrice}
          parseVideoResolutions={parseVideoResolutions}
          parseOriginVideoResolutions={parseOriginVideoResolutions}
          formatVideoResolutionPrice={formatVideoResolutionPrice}
          formatImageTokenPrice={formatImageTokenPrice}
          calculateExampleCost={calculateExampleCost}
          calculateImageEditCost={calculateImageEditCost}
          formatDetailPrice={formatDetailPrice}
          formatDetailPriceUnit={formatDetailPriceUnit}
          onCopyName={copyModelName}
        />
      )}
    </div>
  );
};

const ModelCard: React.FC<{ 
  model: AIModel; 
  t: ModelSquarePageProps['t'];
  formatPrice: (model: AIModel, priceType?: 'discount' | 'origin') => string;
  formatPriceUnit: (model: AIModel) => string;
  onOpenDetail: (model: AIModel) => void;
  onCopyName: (model: AIModel, event?: React.MouseEvent) => void;
}> = ({ 
  model, 
  t, 
  formatPrice, 
  formatPriceUnit, 
  onOpenDetail,
  onCopyName
}) => {
  const getHeaderStyle = () => {
    // 移除高饱和度背景色逻辑，改为返回空字符串或保留用于边框/文字的颜色逻辑（如果需要）
    const p = model.provider.toLowerCase();
    if (p.includes('openai')) return 'text-emerald-600 bg-emerald-50';
    if (p.includes('google')) return 'text-indigo-600 bg-indigo-50';
    if (p.includes('claude')) return 'text-orange-600 bg-orange-50';
    if (p.includes('meta')) return 'text-sky-600 bg-sky-50';
    if (p.includes('万象') || p.includes('alibaba') || p.includes('qwen')) return 'text-violet-600 bg-violet-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getFlagLabel = (flag?: number): string => {
    if (flag === 1) return 'New';
    if (flag === 2) return 'Hot';
    if (flag === 3) return 'Pro';
    return '';
  };

  const getFlagClass = (flag?: number): string => {
    if (flag === 1) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (flag === 2) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (flag === 3) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return '';
  };

  return (
    <div 
      className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-lg hover:-translate-y-1"
      onClick={() => onOpenDetail(model)}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-4">
           {/* Icon & Vendor */}
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
               {model.iconUrl ? (
                 <img src={model.iconUrl} alt={model.name} className="w-full h-full object-contain" />
               ) : (
                 <Box size={20} className="text-zinc-400" />
               )}
             </div>
             <div className="flex flex-col">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-0.5 ${getHeaderStyle()}`}>
                  {model.vendorName || model.provider}
                </span>
             </div>
           </div>
           
           {/* Price */}
           <div className="text-right items-center">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex justify-end gap-1 items-center">
                 <span>{formatPrice(model)}</span>
                 {formatPrice(model, 'origin') !== formatPrice(model) && (
                   <span className="text-xs text-zinc-400 line-through decoration-zinc-400/80">
                     {formatPrice(model, 'origin')}
                   </span>
                 )}
                 <div className="text-xs text-zinc-400">
                  {formatPriceUnit(model)}
                </div>
              </div>
           </div>
        </div>

        <div className="mb-4">
           <h3 
             className="font-medium text-lg text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer hover:underline"
             title={model.name}
             onClick={(e) => onCopyName(model, e)}
           >
            {model.name}
           </h3>
           <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 h-10 leading-relaxed">
             {model.description || '暂无描述'}
           </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50 dark:border-zinc-800">
           <div className="flex gap-2 flex-wrap">
              {Array.isArray(model.tags) && model.tags.slice(0, 2).map((tag, idx) => (
                 <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
                   {tag}
                 </span>
              ))}
           </div>
           
           <div className="flex items-center gap-2">
             {model.flag && model.flag > 0 && (
               <span className={`${getFlagClass(model.flag)} px-2 py-0.5 rounded text-xs font-medium border`}>
                 {getFlagLabel(model.flag)}
               </span>
             )}
             <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-100 dark:border-zinc-700/50">
               {getBillingTypeLabel(model.quotaType)}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

// 模型详情抽屉组件
const ModelDetailDrawer = ({
  model,
  visible,
  onClose,
  formatPrice,
  formatPriceUnit,
  currency,
  exchangeRate,
  formatMultiModalPrice,
  parseVideoResolutions,
  parseOriginVideoResolutions,
  formatVideoResolutionPrice,
  formatImageTokenPrice,
  calculateExampleCost,
  calculateImageEditCost,
  formatDetailPrice,
  formatDetailPriceUnit,
}: {
  model: AIModel;
  visible: boolean;
  onClose: () => void;
  formatPrice: (model: AIModel, priceType?: 'discount' | 'origin') => string;
  formatPriceUnit: (model: AIModel) => string;
  currency: 'USD' | 'CNY';
  exchangeRate: number;
  formatMultiModalPrice: (model: AIModel, priceKey: string, type?: 'discount' | 'origin') => string;
  parseVideoResolutions: (model: AIModel) => Record<string, number>;
  parseOriginVideoResolutions: (model: AIModel) => Record<string, number>;
  formatVideoResolutionPrice: (price: number) => string;
  formatImageTokenPrice: (model: AIModel, priceType: string) => string;
  calculateExampleCost: (quality: string, size: string, model: AIModel) => string;
  calculateImageEditCost: (quality: string, size: string, model: AIModel) => string;
  formatDetailPrice: (model: AIModel, type: 'cacheInput' | 'cacheOutput' | 'call' | 'input' | 'output', priceType?: 'discount' | 'origin') => string;
  formatDetailPriceUnit: () => string;
  onCopyName: (model: AIModel, event?: React.MouseEvent) => void;
}) => {

  const navigate = useNavigate();

  if (!visible) return null;

  // 判断是否显示按钮
  const shouldShowChatButton = useMemo(() => {
    const tags = (model.tags || []).join(',');
    return tags.includes('对话') || tags.includes('思考');
  }, [model]);

  const shouldShowImageButton = useMemo(() => {
    const tags = (model.tags || []).join(',');
    return tags.includes('文生图') || tags.includes('图生图');
  }, [model]);

  const shouldShowVideoButton = useMemo(() => {
    const tags = (model.tags || []).join(',');
    return tags.includes('文生视频') || tags.includes('图生视频');
  }, [model]);

  // 跳转处理
  const goToChat = () => {
    onClose();
    navigate(`/chat?model_name=${model.name}&mode=chat`);
  };

  const goToImage = () => {
    onClose();
    navigate(`/chat?model_name=${model.name}&mode=image`);
  };

  const goToVideo = () => {
    onClose();
    navigate(`/chat?model_name=${model.name}&mode=video`);
  };

  const getCapabilityClass = (cap: string) => {
    const key = cap.trim().toLowerCase();
    if (key.includes('多模态') || key.includes('视觉模型') || key.includes('视觉理解')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (key.includes('文本模型')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (key.includes('向量模型')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (key.includes('语音模型')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (key.includes('深度思考')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (key.includes('fim')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (key.includes('prefix')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (key.includes('tools') || key.includes('tool')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (key.includes('推理')) return 'bg-red-50 text-red-700 border-red-200';
    if (key.includes('moe')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (key.includes('coder') || key.includes('code')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (key.includes('视觉') || key.includes('vision')) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-zinc-50 text-zinc-600 border-zinc-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-background shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out bg-white dark:bg-zinc-900">
        <div className="flex-none bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">模型详情</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
              {model.iconUrl ? (
                <img src={model.iconUrl} alt={model.name} className="w-full h-full object-contain" />
              ) : (
                <Box size={32} className="text-zinc-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:underline"
                  title={model.name}
                  onClick={(e) => onCopyName(model, e)}
                >
                  {model.name}
                </h3>
              </div>
              <p className="text-sm text-zinc-500 mb-2">{model.vendorName || model.provider}</p>
              <div className="flex gap-2 flex-wrap">
                 {(model as any).modelType && (
                   <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs border border-indigo-200 dark:border-indigo-800">
                     {(model as any).modelType}
                   </span>
                 )}
              </div>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">类型</div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{(model as any).modelType || '-'}</div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">定价</div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(model)}</div>
            </div>
          </div>

          {/* Pricing Details Block */}
          <div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">价格详情</h4>
            
            {/* 按全模态计费 */}
            {(model as any).quotaType === 4 ? (
              <div className="space-y-2 text-sm">
                <div className="font-medium mb-2 text-zinc-700 dark:text-zinc-300">价格表</div>
                {[
                  { label: '输入文本', key: 'text_input_price' },
                  { label: '输入音频', key: 'audio_input_price' },
                  { label: '输入图片/视频', key: 'image_video_input_price' },
                  { label: '输出文本(仅文本输入)', key: 'text_output_price_text_only' },
                  { label: '输出文本(多模态输入)', key: 'text_output_price_multimodal' },
                  { label: '输出文本+音频', key: 'text_audio_output_price' },
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center py-1 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                    <span className="text-zinc-500">{item.label}:</span>
                    <div>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {formatMultiModalPrice(model, item.key)}
                      </span>
                      <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                        {formatMultiModalPrice(model, item.key, 'origin')}
                      </span>
                      <span className="text-xs text-zinc-400 ml-1">/ 1M tokens</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (model as any).quotaType === 3 ? (
              /* 按秒计费 */
              <div className="space-y-2 text-sm">
                 {(model as any).videoResolutionPricing ? (
                   <>
                    <div className="font-medium mb-2 text-zinc-700 dark:text-zinc-300">分辨率价格表</div>
                    {Object.entries(parseVideoResolutions(model)).map(([res, price]) => {
                      const originPrices = parseOriginVideoResolutions(model);
                      return (
                        <div key={res} className="flex justify-between items-center py-1 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                          <span className="text-zinc-500">{res}:</span>
                          <div>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {formatVideoResolutionPrice(price as number)}
                            </span>
                            {originPrices[res] && (
                              <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                                {formatVideoResolutionPrice(originPrices[res] as number)}
                              </span>
                            )}
                            <span className="text-xs text-zinc-400 ml-1">/ 秒</span>
                          </div>
                        </div>
                      );
                    })}
                   </>
                 ) : (
                   <div className="flex justify-between items-center py-1">
                     <span className="text-zinc-500">单秒价格:</span>
                     <div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {formatDetailPrice(model, 'call')}
                        </span>
                        <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                          {formatDetailPrice(model, 'call', 'origin')}
                        </span>
                        <span className="text-xs text-zinc-400 ml-1">/ 秒</span>
                     </div>
                   </div>
                 )}
              </div>
            ) : (model as any).quotaType === 2 ? (
              /* 按资源类型 (图像Token表) */
              <div className="space-y-4 text-sm">
                 <div className="space-y-2">
                   <div className="font-medium text-zinc-700 dark:text-zinc-300">基础价格表</div>
                   {[
                     { label: '输入文本', type: 'input_text', originType: 'origin_input_text' },
                     { label: '输入图像', type: 'input_image', originType: 'origin_input_image' },
                     { label: '输出图像', type: 'output_image', originType: 'origin_output_image' },
                   ].map(item => (
                     <div key={item.type} className="flex justify-between items-center py-1 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                       <span className="text-zinc-500">{item.label}:</span>
                       <div>
                         <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                           {formatImageTokenPrice(model, item.type)}
                         </span>
                         <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                           {formatImageTokenPrice(model, item.originType)}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="space-y-2">
                    <div className="font-medium text-zinc-700 dark:text-zinc-300">Token 消耗表</div>
                    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                          <tr>
                            <th className="p-2 font-medium">质量</th>
                            <th className="p-2 font-medium">1024×1024</th>
                            <th className="p-2 font-medium">1024×1536</th>
                            <th className="p-2 font-medium">1536×1024</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          <tr><td className="p-2">Low</td><td className="p-2">272</td><td className="p-2">408</td><td className="p-2">400</td></tr>
                          <tr><td className="p-2">Medium</td><td className="p-2">1056</td><td className="p-2">1584</td><td className="p-2">1568</td></tr>
                          <tr><td className="p-2">High</td><td className="p-2">4160</td><td className="p-2">6240</td><td className="p-2">6208</td></tr>
                        </tbody>
                      </table>
                    </div>
                 </div>

                 <div className="space-y-2">
                   <div className="font-medium text-zinc-700 dark:text-zinc-300">📝 单张成本示例 (文生图)</div>
                   {[
                     { label: 'Low 1024×1024', quality: 'low', color: 'text-emerald-600' },
                     { label: 'Medium 1024×1024', quality: 'medium', color: 'text-blue-600' },
                     { label: 'High 1024×1024', quality: 'high', color: 'text-purple-600' },
                   ].map(item => (
                     <div key={item.quality} className="flex justify-between items-center py-1">
                       <span className="text-zinc-500">{item.label}:</span>
                       <span className={`font-medium ${item.color}`}>
                         {calculateExampleCost(item.quality, '1024x1024', model)}
                       </span>
                     </div>
                   ))}
                 </div>

                 <div className="space-y-2">
                   <div className="font-medium text-zinc-700 dark:text-zinc-300">🖼️ 单张成本示例 (图生图)</div>
                   <div className="text-xs text-zinc-400 mb-1">含输入图像 (编辑场景)</div>
                   {[
                     { label: 'Low 1024×1024', quality: 'low', color: 'text-emerald-600' },
                     { label: 'Medium 1024×1024', quality: 'medium', color: 'text-blue-600' },
                     { label: 'High 1024×1024', quality: 'high', color: 'text-purple-600' },
                   ].map(item => (
                     <div key={item.quality} className="flex justify-between items-center py-1">
                       <span className="text-zinc-500">{item.label}:</span>
                       <span className={`font-medium ${item.color}`}>
                         {calculateImageEditCost(item.quality, '1024x1024', model)}
                       </span>
                     </div>
                   ))}
                 </div>
              </div>
            ) : (model as any).quotaType === 1 || (model as any).quotaType === 5 ? (
              /* 按次/按张计费 */
              <div className="flex justify-between items-center py-1 text-sm">
                 <span className="text-zinc-500">
                   {(model as any).quotaType === 5 ? '单张生成:' : '单次调用:'}
                 </span>
                 <div>
                   <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                     {formatDetailPrice(model, 'call')}
                   </span>
                   <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                     {formatDetailPrice(model, 'call', 'origin')}
                   </span>
                 </div>
              </div>
            ) : (
              /* 默认：按量计费 (Type 0) */
              <div className="space-y-3 text-sm">
                 <div className="flex justify-between items-center">
                   <span className="text-zinc-500">输入:</span>
                   <div>
                     <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                       {formatDetailPrice(model, 'input')}
                     </span>
                     <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                       {formatDetailPrice(model, 'input', 'origin')}
                     </span>
                     <span className="text-xs text-zinc-400 ml-1">/ {formatDetailPriceUnit()}</span>
                   </div>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-zinc-500">输出:</span>
                   <div>
                     <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                       {formatDetailPrice(model, 'output')}
                     </span>
                     <span className="ml-2 text-xs text-zinc-400 line-through decoration-zinc-400/60">
                       {formatDetailPrice(model, 'output', 'origin')}
                     </span>
                     <span className="text-xs text-zinc-400 ml-1">/ {formatDetailPriceUnit()}</span>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Cache Price Info (如果适用) */}
          {(model as any).quotaType !== 1 && (model as any).quotaType !== 5 && (model as any).createCacheRatio !== undefined && (model as any).cacheRatio !== undefined && (
            <div>
              <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">缓存价格</h4>
              <div className="space-y-3 text-sm">
                 <div className="flex justify-between items-center">
                   <span className="text-zinc-500">缓存写入:</span>
                   <div>
                     <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                       {formatDetailPrice(model, 'cacheInput')}
                     </span>
                     <span className="text-xs text-zinc-400 ml-1">/ {formatDetailPriceUnit()}</span>
                   </div>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-zinc-500">缓存读取:</span>
                   <div>
                     <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                       {formatDetailPrice(model, 'cacheOutput')}
                     </span>
                     <span className="text-xs text-zinc-400 ml-1">/ {formatDetailPriceUnit()}</span>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">模型描述</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {model.description || '暂无描述'}
            </p>
          </div>
          
          {/* Capability Tags */}
          <div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">能力标签</h4>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const caps = (model as any).capabilities;
                const capList = Array.isArray(caps) ? caps : (typeof caps === 'string' ? caps.split(',') : []);
                
                return capList.filter(Boolean).map((cap: string) => (
                  <span 
                    key={cap} 
                    className={`px-3 py-1 rounded-full text-xs border font-medium ${getCapabilityClass(cap)}`}
                  >
                    {cap.trim()}
                  </span>
                ));
              })()}
            </div>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex-none p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3 z-10">
          {shouldShowChatButton && (
            <button
              onClick={goToChat}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              <MessageSquare size={16} />
              使用该模型对话
            </button>
          )}
          
          {shouldShowImageButton && (
            <button
              onClick={goToImage}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              <ImageIcon size={16} />
              使用该模型生成图片
            </button>
          )}
          
          {shouldShowVideoButton && (
            <button
              onClick={goToVideo}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              <VideoIcon size={16} />
              使用该模型生成视频
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelSquarePage;
