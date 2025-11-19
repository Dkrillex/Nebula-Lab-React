import React, { useState, useMemo } from 'react';
import { Search, Filter, SearchIcon, ChevronDown, Box } from 'lucide-react';
import { MODELS } from '../../constants';
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

const ModelSquarePage: React.FC<ModelSquarePageProps> = ({ t }) => {
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedCapability, setSelectedCapability] = useState('All');
  const [selectedBilling, setSelectedBilling] = useState('All');
  const [currency, setCurrency] = useState('USD');
  const [unit, setUnit] = useState('M');

  // Extract unique options for filters
  const vendors = useMemo(() => ['All', ...new Set(MODELS.map(m => m.provider))], []);
  const capabilities = useMemo(() => {
    const caps = new Set<string>();
    MODELS.forEach(m => m.capabilities?.forEach(c => caps.add(c)));
    return ['All', ...Array.from(caps)];
  }, []);

  const filteredModels = useMemo(() => {
    return MODELS.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                            m.id.toLowerCase().includes(search.toLowerCase());
      const matchesVendor = selectedVendor === 'All' || m.provider === selectedVendor;
      const matchesCapability = selectedCapability === 'All' || m.capabilities?.includes(selectedCapability);
      // Simplistic billing match
      const matchesBilling = selectedBilling === 'All' || 
                             (selectedBilling === 'Token' && m.billingType === 'token') ||
                             (selectedBilling === 'Time' && m.billingType === 'time');
      
      return matchesSearch && matchesVendor && matchesCapability && matchesBilling;
    });
  }, [search, selectedVendor, selectedCapability, selectedBilling]);

  const handleReset = () => {
    setSearch('');
    setSelectedVendor('All');
    setSelectedCapability('All');
    setSelectedBilling('All');
  };

  return (
    <div className="bg-background min-h-screen flex">
      {/* Left Sidebar Filter */}
      <aside className="w-72 bg-surface border-r border-border p-5 flex-shrink-0 hidden lg:block h-[calc(100vh-64px)] overflow-y-auto sticky top-16 custom-scrollbar">
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
            options={vendors} 
            value={selectedVendor} 
            onChange={setSelectedVendor} 
            count={MODELS.length}
          />

          {/* Capability Filter */}
          <FilterDropdown 
            label={t.filters.capabilityLabel} 
            options={capabilities} 
            value={selectedCapability} 
            onChange={setSelectedCapability} 
            count={MODELS.length}
          />

          {/* Billing Type */}
          <div className="space-y-2">
             <label className="text-sm font-medium text-muted">{t.filters.billingLabel}</label>
             <div className="relative">
                <select 
                  value={selectedBilling}
                  onChange={(e) => setSelectedBilling(e.target.value)}
                  className="w-full h-10 appearance-none rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="All">{t.filters.all} ({MODELS.length})</option>
                  <option value="Token">Token</option>
                  <option value="Time">Time</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
             </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-sm font-medium text-muted">{t.filters.displayLabel}</label>
            <div className="grid grid-cols-1 gap-3 p-3 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t.display.currency}</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent border-none text-foreground font-medium text-right focus:ring-0 cursor-pointer"
                  >
                    <option value="USD">USD</option>
                    <option value="CNY">CNY</option>
                  </select>
                  <ChevronDown size={14} className="text-muted" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t.display.unit}</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-transparent border-none text-foreground font-medium text-right focus:ring-0 cursor-pointer"
                  >
                    <option value="M">M</option>
                    <option value="K">K</option>
                  </select>
                  <ChevronDown size={14} className="text-muted" />
                </div>
              </div>
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

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-border bg-background sticky top-16 z-10 px-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-foreground font-medium text-lg mr-2">{t.title}</span>
              <span>{t.filters.all} {filteredModels.length} {t.totalModels}</span>
           </div>
           
           <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors bg-background">
              <SearchIcon size={14} />
              {t.filters.hideFilters}
           </button>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-surface/30 min-h-full">
          {filteredModels.map(model => (
            <ModelCard key={model.id} model={model} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, options, value, onChange, count }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-muted">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 appearance-none rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt} ({opt === 'All' ? count : '-'})</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
    </div>
  </div>
);

const ModelCard = ({ model, t }: { model: AIModel, t: ModelSquarePageProps['t'] }) => {
  // Helper to determine header color style based on provider
  const getHeaderStyle = () => {
    const p = model.provider.toLowerCase();
    if (p.includes('openai')) return 'bg-indigo-600';
    if (p.includes('google')) return 'bg-blue-500';
    if (p.includes('claude')) return 'bg-orange-700';
    if (p.includes('meta')) return 'bg-blue-600';
    if (p.includes('万象')) return 'bg-purple-600';
    return 'bg-slate-600';
  };

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Card Header */}
      <div className={`${getHeaderStyle()} px-4 py-2 flex justify-between items-center text-white`}>
         <span className="font-medium text-sm">{model.provider}</span>
         {model.isNew && (
           <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold">
             {t.card.new}
           </span>
         )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-4 mb-4">
           {/* Icon Placeholder */}
           <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
             {model.provider === 'OpenAI' ? (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-foreground"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9723l.142.082 4.7783 2.7582l.0171.0115a.7664.7664 0 0 0 .7635 0l5.8333-3.3612l-2.02-1.164a.0757.0757 0 0 1-.0474-.0616l-.0023-5.5826a4.4992 4.4992 0 0 1 6.1456 1.6465zM8.04 4.0095a4.4755 4.4755 0 0 1 2.8669 1.0456l-.1397.0804-4.783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.01-1.1686a.0757.0757 0 0 1-.0356-.0545V8.5064a4.5088 4.5088 0 0 1 4.4941-4.4969zm10.035 6.3613c.012.1148.017.2317.017.35v.0024a4.4898 4.4898 0 0 1-.5323 3.0161l-.1397-.0853l-4.783-2.7582a.7806.7806 0 0 0-.7853 0L5.9944 14.279V11.937a.0757.0757 0 0 1 .0356-.064l8.0304-4.6367a4.4969 4.4969 0 0 1 6.1408 1.6493zM18.21 16.1044a4.4613 4.4613 0 0 1-2.3537 1.97l-.1445-.0853l-4.7783-2.7582a.7759.7759 0 0 0-.3809-.0994l-.0142-.0024l-.3761.097l-5.8333 3.364l2.02 1.1663a.071.071 0 0 1 .0474.0615v5.5779a4.4992 4.4992 0 0 1-6.1456-1.644z"/></svg>
             ) : (
               <Box size={24} className="text-foreground" />
             )}
           </div>
           <div>
             <h3 className="font-bold text-lg text-foreground">{model.name}</h3>
             <div className="flex items-baseline gap-2 mt-1">
               <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${model.inputPrice.toFixed(4)}</span>
               <span className="text-xs text-muted">
                 {model.billingType === 'time' ? t.card.perSecond : t.card.perMillion}
               </span>
             </div>
             <div className="text-xs text-muted mt-0.5">{model.provider}</div>
           </div>
        </div>

        <p className="text-sm text-muted/80 line-clamp-3 mb-6 flex-1">
          {model.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
           <div className="flex gap-2">
              {model.capabilities?.slice(0, 2).map(cap => (
                 <span key={cap} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                   {cap}
                 </span>
              ))}
           </div>
           
           <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors shadow-sm hover:shadow">
              {model.billingType === 'time' ? '生成' : t.card.actions.calculate}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSquarePage;