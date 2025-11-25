import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  count?: number;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  loadingText?: string;
  className?: string;
  showIcon?: boolean;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  label,
  loading = false,
  disabled = false,
  placeholder = '请选择',
  loadingText = '加载中...',
  className = '',
  showIcon = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取当前选中的选项
  const selectedOption = options.find(opt => opt.value === value);

  // 渲染图标
  const renderIcon = (option: FilterOption | undefined) => {
    if (!showIcon || !option?.icon) return null;
    
    return (
      <img
        src={option.icon}
        alt=""
        className="w-5 h-5 rounded object-cover flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </label>
        )}
        <div className={`w-full h-10 px-3 text-sm text-zinc-400 flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 ${className}`}>
          <Loader2 size={14} className="animate-spin mr-2" />
          {loadingText}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        {/* 下拉触发器 */}
        <button
          type="button"
          onClick={() => !disabled && options.length > 0 && setIsOpen(!isOpen)}
          disabled={disabled || options.length === 0}
          className="w-full h-10 flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 outline-none transition-all hover:border-zinc-300 dark:hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-zinc-100"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedOption ? (
              <>
                {renderIcon(selectedOption)}
                <span className="truncate">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-zinc-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 下拉选项列表 */}
        {isOpen && options.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
                    isSelected ? 'bg-zinc-50 dark:bg-zinc-700' : ''
                  }`}
                >
                  {showIcon && renderIcon(option)}
                  <span className="flex-1 truncate text-zinc-900 dark:text-zinc-100">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSelect;

