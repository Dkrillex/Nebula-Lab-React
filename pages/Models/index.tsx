import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, ChevronDown, Box, X, ChevronLeft, ChevronRight, MessageSquare, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppOutletContext } from '../../router';
import { modelService, ModelListResponse } from '../../services/modelService';
import { AIModel } from '../../types';

interface ModelSquarePageProps {
  t: {
    title: string;
    totalModels: string;
    filterSearch: string;
    filters: {
      searchPlaceholder: string;
      nameLabel: string;
      vendorLabel: string;
      capabilityLabel: string;
      billingLabel: string;
      endpointLabel?: string;
      displayLabel: string;
      all: string;
      reset: string;
      hideFilters: string;
    };
    display: {
      currency: string;
      unit: string;
    };
    card: {
      new: string;
      perMillion: string;
      perSecond: string;
      actions: {
        calculate: string;
        chat: string;
      };
    };
  };
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

const ModelSquarePage: React.FC = () => {
  const { t: rootT } = useAppOutletContext();
  const t = rootT.modelSquare as ModelSquarePageProps['t'];
  const navigate = useNavigate();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch models on mount and when filters change
  useEffect(() => {
    const fetchModels = async () => {
      try {
      setLoading(true);
        
        // Map billing type string to quotaType number
        let quotaType: number | undefined;
        if (selectedBilling === '按量计费') quotaType = 0;
        else if (selectedBilling === '按次计费') quotaType = 1;
        else if (selectedBilling === '按资源类型计费') quotaType = 2;
        else if (selectedBilling === '按秒计费') quotaType = 3;
        else if (selectedBilling === '按全模态计费') quotaType = 4;
        else if (selectedBilling === '按张计费') quotaType = 5;

        const response = await modelService.getModels({
          search,
          vendor: selectedVendor,
          tag: selectedTag,
          quotaType,
          endpointType: selectedEndpointType
        });
        console.log('📋 模型广场获取到的数据:', response);
        
        // 确保 models 是数组
        const modelsArray = Array.isArray(response?.models) ? response.models : [];
        setModels(modelsArray);
        setExchangeRate(response?.exchangeRate || 7.3);
        
        // 仅在没有筛选条件时（初始加载或重置）或后端返回了完整列表时更新筛选选项
        // 这里假设如果进行了筛选，后端返回的 options 可能是过滤后的，也可能是完整的
        // 为了更好的体验，我们应该尽量保留所有选项，或者根据后端行为调整
        // 如果后端在筛选时只返回匹配的 vendors，那么我们可能会丢失选项。
        // 简单策略：如果 vendorOptions 为空，或者当前没有筛选，则更新 options
        const isFirstLoadOrReset = !search && !selectedVendor && !selectedTag && !selectedBilling && !selectedEndpointType;

        if (isFirstLoadOrReset || vendorOptions.length === 0) {
            const vendors: FilterOption[] = [
            { value: '', label: `全部(${modelsArray.length})`, count: modelsArray.length },
            ...(Array.isArray(response?.vendors) ? response.vendors as any[] : []).map((v: any) => ({
                value: typeof v === 'string' ? v : v.name,
                label: typeof v === 'string' ? `${v}(0)` : `${v.name}(${v.count || 0})`,
                count: typeof v === 'string' ? 0 : (v.count || 0)
            }))
            ];
            setVendorOptions(vendors);
            
            const tags: FilterOption[] = [
            { value: '', label: `全部(${modelsArray.length})`, count: modelsArray.length },
            ...(Array.isArray(response?.tags) ? response.tags as any[] : []).map((tag: any) => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const count = typeof tag === 'string' ? 0 : (tag.count || 0);
                return {
                value: tagName,
                label: `${tagName}(${count})`,
                count
                };
            })
            ];
            setTagOptions(tags);
            
            const billingTypes: FilterOption[] = [
            { value: '', label: `全部(${modelsArray.length})`, count: modelsArray.length },
            ...(Array.isArray(response?.billingTypes) ? response.billingTypes as any[] : []).map((bt: any) => {
                const name = typeof bt === 'string' ? bt : bt.name;
                const count = typeof bt === 'string' ? 0 : (bt.count || 0);
                return {
                value: name,
                label: `${name}(${count})`,
                count
                };
            })
            ];
            setBillingTypeOptions(billingTypes);

            // Generate Endpoint Type Options
            // 注意：这里如果后端没有返回 endpointTypes，我们只能从 modelsArray 统计
            // 如果是全量加载，统计是对的。如果是分页/筛选后加载，统计可能不全。
            // 但既然 Vben 代码似乎是全量加载（pageSize=1000），这里暂时维持从 modelsArray 统计的逻辑
            // 如果后续发现问题，需要后端支持返回 endpointTypes 聚合
            const endpointMap = new Map<string, number>();
            modelsArray.forEach(model => {
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
            { value: '', label: `全部(${modelsArray.length})`, count: modelsArray.length },
            ...Array.from(endpointMap.entries()).map(([type, count]) => ({
                value: type,
                label: `${type}(${count})`,
                count
            }))
            ];
            setEndpointTypeOptions(endpointTypes);
        }
        
      } catch (error) {
        console.error('❌ 获取模型列表失败:', error);
        setModels([]);
      } finally {
      setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchModels();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedVendor, selectedTag, selectedBilling, selectedEndpointType]);

  // 筛选后的模型列表 - 现在只负责返回 models，因为筛选已在服务端完成
  const filteredModels = useMemo(() => {
    // 确保 models 是数组
    if (!Array.isArray(models)) {
      return [];
    }
    return models;
  }, [models]);

  // 分页数据
  const paginatedModels = useMemo(() => {
    if (!Array.isArray(filteredModels)) {
      return [];
    }
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredModels.slice(start, end);
  }, [filteredModels, currentPage, pageSize]);

  // 总页数
  const totalPages = Math.ceil(filteredModels.length / pageSize);

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

  // 格式化价格
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
        ? model.imageModelPricePerImage 
        : model.originImageModelPricePerImage;
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

  // 是否显示Token单位设置
  const shouldShowTokenUnit = useMemo(() => {
    return selectedBilling !== '按次计费' && 
           selectedBilling !== '按资源类型计费' && 
           selectedBilling !== '按秒计费' && 
           selectedBilling !== '按全模态计费';
  }, [selectedBilling]);

  // 监听筛选变化，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedVendor, selectedTag, selectedBilling, selectedEndpointType]);

  return (
    <div className="bg-background min-h-full flex">
      {/* Left Sidebar Filter */}
      {showFilterPanel && (
      <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 p-5 flex-shrink-0 hidden lg:block h-[calc(100vh-64px)] overflow-y-auto sticky top-0 custom-scrollbar z-0">
        <div className="font-semibold mb-6 text-lg text-zinc-900 dark:text-zinc-100">{t.filterSearch}</div>
        
        <div className="space-y-6">
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
          <FilterDropdown 
            label={t.filters.endpointLabel || '端点类型'} 
            options={endpointTypeOptions} 
            value={selectedEndpointType} 
            onChange={setSelectedEndpointType} 
            />

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
                  <ChevronDown size={14} className="text-zinc-400" />
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
                  <ChevronDown size={14} className="text-zinc-400" />
                </div>
              </div>
                )}
            </div>
          </div>

          {/* Reset Button */}
          <button 
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {t.filters.reset}
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="text-zinc-900 dark:text-zinc-100 font-medium text-lg mr-2">{t.title}</span>
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs">{t.filters.all} {filteredModels.length}</span>
           </div>
           
           <button 
             onClick={() => setShowFilterPanel(!showFilterPanel)}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
           >
             <SearchIcon size={14} />
             {showFilterPanel ? t.filters.hideFilters : '显示筛选'}
           </button>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 bg-zinc-50/50 dark:bg-zinc-900/50 min-h-full">
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
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredModels.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between sticky bottom-0 z-10">
            <div className="text-sm text-zinc-500">
              共 {filteredModels.length} 个模型，第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-800"
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
        />
      )}
    </div>
  );
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

const ModelCard: React.FC<{ 
  model: AIModel; 
  t: ModelSquarePageProps['t'];
  formatPrice: (model: AIModel, priceType?: 'discount' | 'origin') => string;
  formatPriceUnit: (model: AIModel) => string;
  onOpenDetail: (model: AIModel) => void;
}> = ({ 
  model, 
  t, 
  formatPrice, 
  formatPriceUnit, 
  onOpenDetail 
}) => {
  const getHeaderStyle = () => {
    // 移除高饱和度背景色逻辑，改为返回空字符串或保留用于边框/文字的颜色逻辑（如果需要）
    // 这里我们打算彻底改变卡片样式，所以这个函数可能不再需要作为背景色返回
    const p = model.provider.toLowerCase();
    if (p.includes('openai')) return 'text-emerald-600 bg-emerald-50';
    if (p.includes('google')) return 'text-blue-600 bg-blue-50';
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
    if (flag === 1) return 'bg-blue-100 text-blue-700 border-blue-200';
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
        <div className="flex justify-between items-start mb-4">
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
           <div className="text-right">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                 {formatPrice(model)}
              </div>
              <div className="text-xs text-zinc-400">
                 {formatPriceUnit(model)}
              </div>
           </div>
        </div>

        <div className="mb-4">
           <h3 className="font-medium text-lg text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
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
  exchangeRate
}: {
  model: AIModel;
  visible: boolean;
  onClose: () => void;
  formatPrice: (model: AIModel, priceType?: 'discount' | 'origin') => string;
  formatPriceUnit: (model: AIModel) => string;
  currency: 'USD' | 'CNY';
  exchangeRate: number;
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-background shadow-xl flex flex-col">
        <div className="flex-none bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">模型详情</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {model.iconUrl ? (
                <img src={model.iconUrl} alt={model.name} className="w-full h-full object-cover" />
              ) : (
                <Box size={32} className="text-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1">{model.name}</h3>
              <p className="text-muted">{model.vendorName || model.provider}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {Array.isArray(model.tags) && model.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {model.description && (
            <div>
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">描述</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{model.description}</p>
            </div>
          )}

          {/* Price Info */}
          <div>
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">定价</h4>
            <div className="space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(model)}
                </span>
                {formatPrice(model, 'origin') !== formatPrice(model) && (
                  <span className="text-sm text-zinc-400 line-through">
                    {formatPrice(model, 'origin')}
                  </span>
                )}
                <span className="text-sm text-zinc-500">
                  {formatPriceUnit(model)}
                </span>
              </div>
              <div className="text-sm text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                计费类型：{getBillingTypeLabel(model.quotaType)}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(model as any).supportedEndpointTypesList && (model as any).supportedEndpointTypesList.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">支持的端点类型</h4>
              <div className="flex gap-2 flex-wrap">
                {(model as any).supportedEndpointTypesList.map((type: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex-none p-6 border-t border-zinc-100 dark:border-zinc-800 bg-background flex justify-end gap-3">
          {shouldShowChatButton && (
            <button
              onClick={goToChat}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <MessageSquare size={16} />
              开始对话
            </button>
          )}
          
          {shouldShowImageButton && (
            <button
              onClick={goToImage}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <ImageIcon size={16} />
              生成图片
            </button>
          )}
          
          {shouldShowVideoButton && (
            <button
              onClick={goToVideo}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <VideoIcon size={16} />
              生成视频
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelSquarePage;
