import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { MODELS } from '../../../constants';
import { AIModel } from '../../../types';

interface ModelListProps {
  t: {
    explore: string;
    searchPlaceholder: string;
    headers: {
      model: string;
      context: string;
      inputCost: string;
      outputCost: string;
    };
    noResults: string;
    free: string;
    new: string;
  };
}

const ModelList: React.FC<ModelListProps> = ({ t }) => {
  const [search, setSearch] = useState('');

  const filteredModels = useMemo(() => {
    const lower = search.toLowerCase();
    return MODELS.filter(m => 
      m.name.toLowerCase().includes(lower) || 
      m.provider.toLowerCase().includes(lower) ||
      m.id.toLowerCase().includes(lower)
    );
  }, [search]);

  const formatPrice = (price: number) => {
    if (price === 0) return t.free;
    return `$${price.toFixed(2)}`;
  };

  const formatContext = (ctx: number) => {
    if (ctx >= 1000000) return `${ctx / 1000000}M`;
    if (ctx >= 1000) return `${ctx / 1000}k`;
    return ctx.toString();
  };

  return (
    <div className="container mx-auto px-4 pb-24">
      <div className="rounded-xl border border-border bg-surface/50 backdrop-blur-sm shadow-lg">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-2 text-lg font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
              <Search size={14} />
            </span>
            {t.explore}
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 text-sm text-foreground placeholder-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
          <div className="col-span-6 md:col-span-5">{t.headers.model}</div>
          <div className="col-span-3 hidden md:block text-right">{t.headers.context}</div>
          <div className="col-span-3 md:col-span-2 text-right">{t.headers.inputCost}</div>
          <div className="col-span-3 md:col-span-2 text-right">{t.headers.outputCost}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {filteredModels.map((model) => (
            <ModelRow 
              key={model.id} 
              model={model} 
              formatContext={formatContext} 
              formatPrice={formatPrice} 
              t={t}
            />
          ))}
          
          {filteredModels.length === 0 && (
             <div className="py-12 text-center text-muted">
               {t.noResults} "{search}"
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModelRowProps {
  model: AIModel;
  formatContext: (n: number) => string;
  formatPrice: (n: number) => string;
  t: ModelListProps['t'];
}

const ModelRow: React.FC<ModelRowProps> = ({ model, formatContext, formatPrice, t }) => {
  return (
    <div className="group grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-foreground/5 items-center">
      {/* Name & Metadata */}
      <div className="col-span-6 md:col-span-5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground group-hover:text-indigo-500 transition-colors truncate">
            {model.name}
          </span>
          {model.isNew && (
            <span className="hidden sm:inline-flex rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400 border border-green-500/20">
              {t.new}
            </span>
          )}
          {model.isFree && (
            <span className="hidden sm:inline-flex rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {t.free}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted truncate">
          <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-foreground/80">
            {model.provider}
          </span>
          <span className="hidden sm:inline opacity-50">•</span>
          <span className="hidden sm:inline truncate opacity-80">{model.description}</span>
        </div>
      </div>

      {/* Context */}
      <div className="col-span-3 hidden md:block text-right text-sm text-muted font-mono">
        {formatContext(model.contextLength)}
      </div>

      {/* Input Price */}
      <div className="col-span-3 md:col-span-2 text-right text-sm text-muted font-mono">
        {formatPrice(model.inputPrice)}
        <span className="text-xs opacity-50 ml-1">/M</span>
      </div>

      {/* Output Price */}
      <div className="col-span-3 md:col-span-2 text-right text-sm text-muted font-mono flex items-center justify-end gap-2">
        <div>
          {formatPrice(model.outputPrice)}
          <span className="text-xs opacity-50 ml-1">/M</span>
        </div>
        <button className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded bg-foreground text-background opacity-0 transition-all group-hover:opacity-100">
            <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ModelList;