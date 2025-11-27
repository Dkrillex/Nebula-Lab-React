import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Cpu, Loader2, Search, X } from 'lucide-react';

export interface ModelOption {
  id: string | number;
  modelName: string;
  icon?: string;
  iconUrl?: string;
  description?: string;
}

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  models: ModelOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  loadingText?: string;
  className?: string;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  value,
  onChange,
  models,
  loading = false,
  disabled = false,
  placeholder = '暂无可用模型',
  loadingText = '加载中...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFilterText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 当下拉框打开时，自动聚焦到搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // 获取当前选中的模型
  const selectedModel = models.find(m => m.modelName === value);

  // 过滤模型列表
  const filteredModels = models.filter((model) => {
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    return (
      model.modelName.toLowerCase().includes(searchText) ||
      model.description?.toLowerCase().includes(searchText)
    );
  });

  // 渲染模型图标
  const renderIcon = (model: ModelOption | undefined, size: 'sm' | 'md' = 'md') => {
    const iconSize = size === 'sm' ? 12 : 14;
    const containerSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
    const iconSrc = model?.iconUrl || model?.icon;

    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt=""
          className={`${containerSize} rounded object-cover flex-shrink-0`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    return (
      <div className={`${containerSize} rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0`}>
        <Cpu size={iconSize} className="text-white" />
      </div>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className={`w-full py-2.5 px-3 text-sm text-muted flex items-center rounded-lg border border-border bg-surface ${className}`}>
        <Loader2 size={14} className="animate-spin mr-2" />
        {loadingText}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 下拉触发器 */}
      <button
        type="button"
        onClick={() => !disabled && models.length > 0 && setIsOpen(!isOpen)}
        disabled={disabled || models.length === 0}
        className="w-full flex items-center justify-between rounded-lg border border-border bg-surface py-2.5 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedModel ? (
            <>
              {renderIcon(selectedModel, 'sm')}
              <span className="truncate">{selectedModel.modelName}</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded bg-surface-alt flex items-center justify-center flex-shrink-0">
                <Cpu size={12} className="text-muted" />
              </div>
              <span className="text-muted">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉选项列表 */}
      {isOpen && models.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-72 flex flex-col">
          {/* 搜索框 */}
          <div className="p-2 border-b border-border sticky top-0 bg-surface">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="搜索模型..."
                className="w-full pl-8 pr-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setFilterText('');
                  }
                }}
              />
              {filterText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterText('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          {/* 模型列表 */}
          <div className="overflow-y-auto flex-1">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const isSelected = value === model.modelName;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onChange(model.modelName);
                      setIsOpen(false);
                      setFilterText('');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-background ${
                      isSelected ? 'bg-background' : ''
                    }`}
                  >
                    {renderIcon(model, 'sm')}
                    <span className="flex-1 truncate">{model.modelName}</span>
                    {isSelected && (
                      <Check size={14} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted">
                未找到匹配的模型
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelect;

