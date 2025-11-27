import React, { useState } from 'react';
import { SearchIcon, Box, X, GitCompareArrows as Compare } from 'lucide-react';
import { AIModel } from '@/types';
import { useAppOutletContext } from '@/router/context';
import { translations } from '@/translations';

export interface ModelCompareModalProps {
  visible: boolean;
  onClose: () => void;
  models: AIModel[];
  compareModels: (AIModel | null)[];
  setCompareModels: React.Dispatch<React.SetStateAction<(AIModel | null)[]>>;
  formatPrice: (model: AIModel, priceType?: 'discount' | 'origin') => string;
  formatPriceUnit: (model: AIModel) => string;
}

const ModelCompareModal: React.FC<ModelCompareModalProps> = ({ 
  visible, 
  onClose, 
  models, 
  compareModels, 
  setCompareModels, 
  formatPrice, 
  formatPriceUnit 
}) => {
  const { t: rootT } = useAppOutletContext();
  const t = rootT?.modelSquare?.compare || translations['zh'].modelSquare.compare;
  
  // 计费类型标签
  const getBillingTypeLabel = (quotaType?: number): string => {
    if (quotaType === 0) return t.billingTypes.payPerUse;
    if (quotaType === 1) return t.billingTypes.payPerCall;
    if (quotaType === 2) return t.billingTypes.payPerResource;
    if (quotaType === 3) return t.billingTypes.payPerSecond;
    if (quotaType === 4) return t.billingTypes.payPerMultimodal;
    if (quotaType === 5) return t.billingTypes.payPerImage;
    return t.billingTypes.unknown;
  };
  const [searchTerms, setSearchTerms] = useState(['', '', '']);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  if (!visible) return null;

  const handleSelectModel = (index: number, model: AIModel) => {
    const newModels = [...compareModels];
    newModels[index] = model;
    setCompareModels(newModels);
    setDropdownOpen(null);
    setSearchTerms(prev => {
      const newTerms = [...prev];
      newTerms[index] = '';
      return newTerms;
    });
  };

  const handleClearModel = (index: number) => {
    const newModels = [...compareModels];
    newModels[index] = null;
    setCompareModels(newModels);
  };

  const handleSearchChange = (index: number, value: string) => {
    setSearchTerms(prev => {
      const newTerms = [...prev];
      newTerms[index] = value;
      return newTerms;
    });
  };

  const getFilteredModels = (index: number) => {
    const term = searchTerms[index].toLowerCase();
    return models.filter(m => 
      m.name.toLowerCase().includes(term) || 
      m.provider.toLowerCase().includes(term) ||
      (m.vendorName || '').toLowerCase().includes(term)
    ).slice(0, 20); // 限制显示数量
  };

  const selectedModels = compareModels.filter(m => m !== null) as AIModel[];

  // 对比属性配置
  const compareFields = [
    { key: 'provider', label: t.compareFields.provider, render: (m: AIModel) => m.vendorName || m.provider },
    { key: 'price', label: t.compareFields.inputPrice, render: (m: AIModel) => `${formatPrice(m)} ${formatPriceUnit(m)}` },
    { key: 'outputPrice', label: t.compareFields.outputPrice, render: (m: AIModel) => {
      if (m.quotaType === 0) {
        const outputRatio = parseFloat(String(m.completionRatio || 1));
        const inputPrice = parseFloat(formatPrice(m).replace(/[^\d.]/g, ''));
        return `${(inputPrice * outputRatio).toFixed(4)} ${formatPriceUnit(m)}`;
      }
      return '-';
    }},
    { key: 'contextLength', label: t.compareFields.contextLength, render: (m: AIModel) => {
      if (!m.contextLength) return '-';
      if (m.contextLength >= 1000000) return `${(m.contextLength / 1000000).toFixed(1)}M`;
      if (m.contextLength >= 1000) return `${(m.contextLength / 1000).toFixed(0)}K`;
      return m.contextLength.toString();
    }},
    { key: 'billingType', label: t.compareFields.billingType, render: (m: AIModel) => getBillingTypeLabel(m.quotaType) },
    { key: 'tags', label: t.compareFields.tags, render: (m: AIModel) => (m.tags || []).slice(0, 3).join(', ') || '-' },
    { key: 'description', label: t.compareFields.description, render: (m: AIModel) => m.description || '-' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Compare size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</h2>
              <p className="text-sm text-zinc-500">{t.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* 模型选择器 */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative">
                <label className="block text-xs font-medium text-zinc-500 mb-2">
                  {t.modelLabel} {index + 1}
                </label>
                {compareModels[index] ? (
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {compareModels[index]?.iconUrl ? (
                        <img src={compareModels[index]?.iconUrl} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <Box size={16} className="text-zinc-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {compareModels[index]?.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {compareModels[index]?.vendorName || compareModels[index]?.provider}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleClearModel(index)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X size={14} className="text-zinc-400" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerms[index]}
                      onChange={(e) => handleSearchChange(index, e.target.value)}
                      onFocus={() => setDropdownOpen(index)}
                      className="w-full p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <SearchIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    
                    {/* 下拉列表 */}
                    {dropdownOpen === index && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg max-h-64 overflow-y-auto z-[60]">
                        {getFilteredModels(index).length === 0 ? (
                          <div className="p-4 text-sm text-zinc-500 text-center">
                            {t.noResults}
                          </div>
                        ) : (
                          getFilteredModels(index).map(model => (
                            <div
                              key={model.id}
                              onClick={() => handleSelectModel(index, model)}
                              className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {model.iconUrl ? (
                                  <img src={model.iconUrl} alt="" className="w-full h-full object-contain p-1" />
                                ) : (
                                  <Box size={16} className="text-zinc-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                  {model.name}
                                </div>
                                <div className="text-xs text-zinc-500 truncate">
                                  {model.vendorName || model.provider}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 对比表格 */}
        <div className="flex-1 overflow-auto p-6">
          {selectedModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
              <Compare size={48} strokeWidth={1.5} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">{t.selectAtLeastOne}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left p-4 text-sm font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-tl-xl w-40">
                      {t.tableHeader}
                    </th>
                    {selectedModels.map((model, idx) => (
                      <th key={model.id} className={`text-left p-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 ${idx === selectedModels.length - 1 ? 'rounded-tr-xl' : ''}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            {model.iconUrl ? (
                              <img src={model.iconUrl} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <Box size={12} className="text-zinc-400" />
                            )}
                          </div>
                          <span className="truncate">{model.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareFields.map((field, rowIdx) => (
                    <tr 
                      key={field.key} 
                      className={`border-b border-zinc-50 dark:border-zinc-800/50 ${rowIdx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/50 dark:bg-zinc-800/20'}`}
                    >
                      <td className="p-4 text-sm font-medium text-zinc-500">
                        {field.label}
                      </td>
                      {selectedModels.map((model) => (
                        <td key={model.id} className="p-4 text-sm text-zinc-700 dark:text-zinc-300">
                          <div className={field.key === 'description' ? 'line-clamp-3' : ''}>
                            {field.render(model)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
          <div className="text-sm text-zinc-500">
            {t.selectedCount} {selectedModels.length} / 3 {t.modelLabel}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareModels([null, null, null])}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {t.clearSelection}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {t.finishCompare}
            </button>
          </div>
        </div>
      </div>
      
      {/* 点击空白处关闭下拉 */}
      {dropdownOpen !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default ModelCompareModal;

