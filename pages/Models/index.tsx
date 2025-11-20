
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

  // Fetch models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
      setLoading(true);
        const response = await modelService.getModels();
        console.log('📋 模型广场获取到的数据:', response);
        
        // 确保 models 是数组
        const modelsArray = Array.isArray(response?.models) ? response.models : [];
        setModels(modelsArray);
        setExchangeRate(response?.exchangeRate || 7.3);
        
        // 更新筛选选项
        const vendors: FilterOption[] = [
          { value: '', label: `全部(${modelsArray.length})`, count: modelsArray.length },
          ...(Array.isArray(response?.vendors) ? response.vendors : []).map((v: any) => ({
            value: typeof v === 'string' ? v : v.name,
            label: typeof v === 'string' ? `${v}(${countModelsByVendor(modelsArray, v)})` : `${v.name}(${v.count || countModelsByVendor(modelsArray, v.name)})`,
            count: typeof v === 'string' ? countModelsByVendor(modelsArray, v) : (v.count || countModelsByVendor(modelsArray, v.name))
          }))
        ];
        setVendorOptions(vendors);
        
        const tags: FilterOption[] = [
          { value: '', label: `全部(${modelsArray.length})`, count: modelsArray.length },
          ...(Array.isArray(response?.tags) ? response.tags : []).map((tag: any) => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            const count = typeof tag === 'string' ? countModelsByTag(modelsArray, tag) : (tag.count || countModelsByTag(modelsArray, tagName));
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
          ...(Array.isArray(response?.billingTypes) ? response.billingTypes : []).map((bt: any) => {
            const name = typeof bt === 'string' ? bt : bt.name;
            const count = typeof bt === 'string' ? countModelsByBillingType(modelsArray, name) : (bt.count || countModelsByBillingType(modelsArray, name));
            return {
              value: name,
              label: `${name}(${count})`,
              count
            };
          })
        ];
        setBillingTypeOptions(billingTypes);

        // Generate Endpoint Type Options
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
        
      } catch (error) {
        console.error('❌ 获取模型列表失败:', error);
        setModels([]);
      } finally {
      setLoading(false);
      }
    };
    fetchModels();
  }, []);

  // 辅助函数：统计供应商数量
  const countModelsByVendor = (models: AIModel[], vendor: string): number => {
    if (!Array.isArray(models)) return 0;
    return models.filter(m => (m?.vendorName || m?.provider) === vendor).length;
  };

  // 辅助函数：统计标签数量
  const countModelsByTag = (models: AIModel[], tag: string): number => {
    if (!Array.isArray(models)) return 0;
    return models.filter(m => {
      const tagsStr = Array.isArray(m?.tags) ? m.tags.join(',') : (m?.tags as any);
      return tagsStr && tagsStr.includes(tag);
    }).length;
  };

  // 辅助函数：统计计费类型数量
  const countModelsByBillingType = (models: AIModel[], billingType: string): number => {
    if (!Array.isArray(models)) return 0;
    return models.filter(m => {
      if (billingType === '按量计费') return m.quotaType === 0;
      if (billingType === '按次计费') return m.quotaType === 1;
      if (billingType === '按资源类型计费') return m.quotaType === 2;
      if (billingType === '按秒计费') return m.quotaType === 3;
      if (billingType === '按全模态计费') return m.quotaType === 4;
      if (billingType === '按张计费') return m.quotaType === 5;
      return false;
    }).length;
  };

  // 筛选后的模型列表
  const filteredModels = useMemo(() => {
    // 确保 models 是数组
    if (!Array.isArray(models)) {
      return [];
    }
    
    let filtered = models;

    // 模型名称筛选
    if (search.trim()) {
      filtered = filtered.filter(m => 
        m?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m?.id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 供应商筛选
    if (selectedVendor) {
      filtered = filtered.filter(m => (m?.vendorName || m?.provider) === selectedVendor);
    }

    // 标签筛选
    if (selectedTag) {
      filtered = filtered.filter(m => {
        const tagsStr = Array.isArray(m?.tags) ? m.tags.join(',') : (m?.tags as any);
        return tagsStr && tagsStr.includes(selectedTag);
      });
    }

    // 计费类型筛选
    if (selectedBilling) {
      filtered = filtered.filter(m => {
        if (selectedBilling === '按量计费') return m?.quotaType === 0;
        if (selectedBilling === '按次计费') return m?.quotaType === 1;
        if (selectedBilling === '按资源类型计费') return m?.quotaType === 2;
        if (selectedBilling === '按秒计费') return m?.quotaType === 3;
        if (selectedBilling === '按全模态计费') return m?.quotaType === 4;
        if (selectedBilling === '按张计费') return m?.quotaType === 5;
        return false;
      });
    }

    // 端点类型筛选
    if (selectedEndpointType) {
      filtered = filtered.filter(m => {
        const types = (m as any).supportedEndpointTypesList;
        return Array.isArray(types) && types.includes(selectedEndpointType);
      });
    }

    return filtered;
  }, [models, search, selectedVendor, selectedTag, selectedBilling, selectedEndpointType]);

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
      <aside className="w-72 bg-surface border-r border-border p-5 flex-shrink-0 hidden lg:block h-[calc(100vh-64px)] overflow-y-auto sticky top-0 custom-scrollbar">
        <div className="font-semibold mb-6 text-lg">{t.filterSearch}</div>
        
        <div className="space-y-6">
          {/* Model Name Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">{t.filters.nameLabel}</label>
            <div className="relative">
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.filters.searchPlaceholder}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-sm font-medium text-muted">{t.filters.displayLabel}</label>
            <div className="grid grid-cols-1 gap-3 p-3 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t.display.currency}</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'USD' | 'CNY')}
                    className="bg-transparent border-none text-foreground font-medium text-right focus:ring-0 cursor-pointer"
                  >
                    <option value="USD">USD</option>
                    <option value="CNY">CNY</option>
                  </select>
                  <ChevronDown size={14} className="text-muted" />
                </div>
              </div>
                {shouldShowTokenUnit && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t.display.unit}</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={unit}
                        onChange={(e) => setUnit(e.target.value as 'K' | 'M')}
                    className="bg-transparent border-none text-foreground font-medium text-right focus:ring-0 cursor-pointer"
                  >
                    <option value="M">M</option>
                    <option value="K">K</option>
                  </select>
                  <ChevronDown size={14} className="text-muted" />
                </div>
              </div>
                )}
            </div>
          </div>

          {/* Reset Button */}
          <button 
            onClick={handleReset}
            className="w-full py-2 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors"
          >
            {t.filters.reset}
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-border bg-background sticky top-0 z-10 px-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-foreground font-medium text-lg mr-2">{t.title}</span>
              <span>{t.filters.all} {filteredModels.length} {t.totalModels}</span>
           </div>
           
           <button 
             onClick={() => setShowFilterPanel(!showFilterPanel)}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors bg-background"
           >
              <SearchIcon size={14} />
              {showFilterPanel ? t.filters.hideFilters : '显示筛选'}
           </button>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-surface/30 min-h-full">
          {loading ? (
            <div className="col-span-full text-center py-20 text-muted">Loading models...</div>
          ) : paginatedModels.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted">
              {models.length === 0 ? '暂无模型数据' : '没有匹配的模型'}
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
          <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
            <div className="text-sm text-muted">
              共 {filteredModels.length} 个模型，第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-border text-sm bg-background"
              >
                <option value={12}>12 / 页</option>
                <option value={24}>24 / 页</option>
                <option value={48}>48 / 页</option>
              </select>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <label className="text-sm font-medium text-muted">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 appearance-none rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
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
    const p = model.provider.toLowerCase();
    if (p.includes('openai')) return 'bg-indigo-600';
    if (p.includes('google')) return 'bg-blue-500';
    if (p.includes('claude')) return 'bg-orange-700';
    if (p.includes('meta')) return 'bg-blue-600';
    if (p.includes('万象') || p.includes('alibaba') || p.includes('qwen')) return 'bg-purple-600';
    return 'bg-slate-600';
  };

  const getFlagLabel = (flag?: number): string => {
    if (flag === 1) return '新';
    if (flag === 2) return '热门';
    if (flag === 3) return '高级';
    return '';
  };

  const getFlagClass = (flag?: number): string => {
    if (flag === 1) return 'bg-blue-500';
    if (flag === 2) return 'bg-red-500';
    if (flag === 3) return 'bg-green-500';
    return '';
  };

  return (
    <div 
      className="bg-background rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
      onClick={() => onOpenDetail(model)}
    >
      {/* Card Header */}
      <div className={`${getHeaderStyle()} px-4 py-2 flex justify-between items-center text-white`}>
         <span className="font-medium text-sm">{model.vendorName || model.provider}</span>
         {model.flag && model.flag > 0 && (
           <span className={`${getFlagClass(model.flag)} px-2 py-0.5 rounded text-xs font-bold`}>
             {getFlagLabel(model.flag)}
           </span>
         )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-4 mb-4">
           {/* Icon */}
           <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
             {model.iconUrl ? (
               <img src={model.iconUrl} alt={model.name} className="w-full h-full object-cover" />
             ) : (
               <Box size={24} className="text-foreground" />
             )}
           </div>
           <div className="flex-1 min-w-0">
             <h3 className="font-bold text-lg text-foreground mb-1">{model.name}</h3>
             <div className="flex items-baseline gap-2">
               <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                 {formatPrice(model)}
               </span>
               {formatPrice(model, 'origin') !== formatPrice(model) && (
                 <span className="text-sm text-muted line-through">
                   {formatPrice(model, 'origin')}
                 </span>
               )}
               <span className="text-xs text-muted">
                 {formatPriceUnit(model)}
               </span>
             </div>
           </div>
        </div>

        <p className="text-sm text-muted/80 line-clamp-3 mb-6 flex-1">
          {model.description || '暂无描述'}
        </p>

        <div className="flex items-center justify-between mt-auto">
           <div className="flex gap-2 flex-wrap">
              {Array.isArray(model.tags) && model.tags.slice(0, 2).map((tag, idx) => (
                 <span key={idx} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                   {tag}
                 </span>
              ))}
           </div>
           <span className="text-xs text-muted border border-border px-2 py-1 rounded-md bg-surface/50">
             {getBillingTypeLabel(model.quotaType)}
           </span>
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
                  <span key={idx} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {model.description && (
            <div>
              <h4 className="text-sm font-semibold mb-2">描述</h4>
              <p className="text-sm text-muted">{model.description}</p>
            </div>
          )}

          {/* Price Info */}
          <div>
            <h4 className="text-sm font-semibold mb-2">定价</h4>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatPrice(model)}
                </span>
                {formatPrice(model, 'origin') !== formatPrice(model) && (
                  <span className="text-sm text-muted line-through">
                    {formatPrice(model, 'origin')}
                  </span>
                )}
                <span className="text-sm text-muted">
                  {formatPriceUnit(model)}
                </span>
              </div>
              <div className="text-sm text-muted">
                计费类型：{getBillingTypeLabel(model.quotaType)}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(model as any).supportedEndpointTypesList && (model as any).supportedEndpointTypesList.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">支持的端点类型</h4>
              <div className="flex gap-2 flex-wrap">
                {(model as any).supportedEndpointTypesList.map((type: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 rounded-md bg-surface border border-border text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex-none p-6 border-t border-border bg-background flex justify-end gap-3">
          {shouldShowChatButton && (
            <button
              onClick={goToChat}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={16} />
              使用该模型对话
            </button>
          )}
          
          {shouldShowImageButton && (
            <button
              onClick={goToImage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <ImageIcon size={16} />
              生成图片
            </button>
          )}
          
          {shouldShowVideoButton && (
            <button
              onClick={goToVideo}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
