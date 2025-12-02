import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { styleTransferService, Template, TemplateCategory } from '@/services/styleTransferService';

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
  selectedTemplateId?: string;
}

const TemplateSelectModal: React.FC<TemplateSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedTemplateId
}) => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [displayedTemplates, setDisplayedTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchTemplates(1, true);
    }
  }, [isOpen]);

  // Fetch templates when filters change
  useEffect(() => {
    if (isOpen) {
      fetchTemplates(1, true);
    }
  }, [selectedCategory, selectedStyle]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && displayedTemplates.length < pagination.total) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayedTemplates, pagination.total, isLoading, isLoadingMore]);

  const fetchCategories = async () => {
    try {
      const res = await styleTransferService.getTemplateCategories();
      if (res && Array.isArray(res)) {
        setCategories(res);
      } else if (res && res.data) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTemplates = async (page: number, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
      setTemplates([]);
      setDisplayedTemplates([]);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await styleTransferService.getTemplateList({
        pageNo: page,
        pageSize: pagination.pageSize,
        categoryIds: selectedCategory === 'all' ? '' : selectedCategory,
        style: selectedStyle === 'all' ? '' : selectedStyle
      });

      if (res) {
        // 接口返回结构: { result: { total: 15412, data: [...] } }
        // 或者: { data: [...], total: ... }
        let newTemplates: Template[] = [];
        let total = 0;
        
        if (res.result && res.result.data) {
          // TopView 风格: { result: { data: [...], total: ... } }
          newTemplates = res.result.data || [];
          total = res.result.total || 0;
        } else if (res.data) {
          // 标准风格: { data: [...], total: ... }
          newTemplates = Array.isArray(res.data) ? res.data : (res.data.data || []);
          total = res.total || (res.data.total || 0);
        }
        
        setTemplates(prev => reset ? newTemplates : [...prev, ...newTemplates]);
        
        // Batch loading simulation for smoother UI (optional, but mimics Vue implementation)
        if (reset) {
          setDisplayedTemplates(newTemplates.slice(0, 12));
          if (newTemplates.length > 12) {
            setTimeout(() => {
              setDisplayedTemplates(newTemplates);
            }, 100);
          }
        } else {
          setDisplayedTemplates(prev => [...prev, ...newTemplates]);
        }

        setPagination(prev => ({
          ...prev,
          current: page,
          total: total
        }));
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = pagination.current + 1;
    fetchTemplates(nextPage);
  };

  if (!isOpen) return null;

  const visibleCategories = isCategoriesExpanded 
    ? categories 
    : categories.slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">选择模板</h2>
            <div className="relative">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">全部风格</option>
                <option value="UGC">UGC</option>
                <option value="Pro">Pro</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              全部
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategory(cat.categoryId)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.categoryId
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {cat.categoryName}
              </button>
            ))}
            {categories.length > 15 && (
              <button
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                {isCategoriesExpanded ? (
                  <>收起 <ChevronUp size={14} /></>
                ) : (
                  <>展开更多 <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-slate-950">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 size={40} className="animate-spin text-indigo-600" />
              <p className="text-slate-500 text-sm">加载模板中...</p>
            </div>
          ) : displayedTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayedTemplates.map((template) => (
                <div
                  key={template.templateId}
                  onClick={() => onSelect(template)}
                  className={`group cursor-pointer relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedTemplateId === template.templateId
                      ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-900'
                      : 'border-transparent hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <img
                    src={template.templateImageUrl}
                    alt={template.templateName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                    <span className="text-white text-xs font-medium truncate w-full text-center">
                      {template.templateName}
                    </span>
                  </div>
                  {selectedTemplateId === template.templateId && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading More Sentinel */}
              <div ref={observerTarget} className="col-span-full h-10 flex items-center justify-center">
                {isLoadingMore && <Loader2 size={24} className="animate-spin text-slate-400" />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
              <Search size={48} className="opacity-20" />
              <p>未找到相关模板</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectModal;

