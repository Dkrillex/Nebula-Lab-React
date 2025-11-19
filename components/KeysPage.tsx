import React, { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Trash2, Edit2, Plus, Cloud } from 'lucide-react';
import { APIKey } from '../types';

interface KeysPageProps {
  t: {
    title: string;
    createButton: string;
    labels: {
      limit: string;
      remaining: string;
      used: string;
      expires: string;
      status: string;
    };
    values: {
      unlimited: string;
      never: string;
    };
    actions: {
      disable: string;
      enable: string;
      delete: string;
      edit: string;
    };
    status: {
      active: string;
      disabled: string;
    }
  };
}

const MOCK_KEYS: APIKey[] = [
  {
    id: '1',
    name: '外部系统集成令牌',
    key: 'sk-1e******************************************dF',
    status: 'active',
    limit: 'unlimited',
    usage: 0.00,
    expiration: 'never'
  },
  {
    id: '2',
    name: '测试',
    key: 'sk-ju******************************************MY',
    status: 'active',
    limit: 847.15,
    usage: 11.74,
    expiration: '2025-12-31'
  },
  {
    id: '3',
    name: '测试',
    key: 'sk-h3******************************************9h',
    status: 'disabled',
    limit: 'unlimited',
    usage: 0.00,
    expiration: 'never'
  }
];

const KeysPage: React.FC<KeysPageProps> = ({ t }) => {
  const [keys, setKeys] = useState<APIKey[]>(MOCK_KEYS);
  
  const toggleStatus = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: k.status === 'active' ? 'disabled' : 'active' } : k));
  };

  const deleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this key?')) {
      setKeys(keys.filter(k => k.id !== id));
    }
  };

  const getRemaining = (key: APIKey) => {
    if (key.limit === 'unlimited') return t.values.unlimited;
    return `¥ ${(key.limit - key.usage).toFixed(2)}`;
  };

  const formatLimit = (limit: number | 'unlimited') => {
    if (limit === 'unlimited') return t.values.unlimited;
    return `¥ ${limit.toFixed(2)}`;
  };

  const formatExpiration = (exp: string) => {
    if (exp === 'never') return t.values.never;
    if (exp === 'expired') return '已过期'; // Simple handler, could be dynamic
    return exp;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <span className="text-sm text-muted">共 {keys.length} 个令牌</span>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md">
          <Key size={18} />
          {t.createButton}
        </button>
      </div>

      {/* Key List */}
      <div className="space-y-6">
        {keys.map((key) => (
          <div 
            key={key.id} 
            className={`bg-surface border border-border rounded-xl shadow-sm transition-all overflow-hidden ${key.status === 'disabled' ? 'opacity-80' : ''}`}
          >
            {/* Top Border Stripe */}
            <div className={`h-1.5 w-full ${key.status === 'active' ? 'bg-indigo-500' : 'bg-slate-500'}`}></div>
            
            <div className="p-6">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg border ${key.status === 'active' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400'}`}>
                     <Cloud size={24} />
                   </div>
                   <h3 className={`font-semibold text-lg ${key.status === 'active' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                     {key.name}
                   </h3>
                </div>
                
                <div className="flex flex-col items-end">
                   <span className={`text-xs font-bold px-2 py-1 rounded ${
                     key.status === 'active' 
                       ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                       : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                   }`}>
                     {key.status === 'active' ? t.status.active : t.status.disabled}
                   </span>
                   <span className="text-[10px] text-muted mt-1">{t.labels.status}</span>
                </div>
              </div>

              {/* Key Input Display */}
              <div className="relative mb-6 group">
                <div className="flex items-center bg-background/50 border border-border rounded-lg px-4 py-3 font-mono text-sm text-muted select-all">
                  <span className="truncate w-full">{key.key}</span>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button className="p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded-md transition-colors" title="Search usage">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                  <button className="p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded-md transition-colors" title="Copy">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 <StatBox label={t.labels.limit} value={formatLimit(key.limit)} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-900/20" borderColor="border-blue-200 dark:border-blue-800" />
                 <StatBox label={t.labels.remaining} value={getRemaining(key)} color="text-green-600 dark:text-green-400" bgColor="bg-green-50 dark:bg-green-900/20" borderColor="border-green-200 dark:border-green-800" />
                 <StatBox label={t.labels.used} value={`¥ ${key.usage.toFixed(2)}`} color="text-orange-600 dark:text-orange-400" bgColor="bg-orange-50 dark:bg-orange-900/20" borderColor="border-orange-200 dark:border-orange-800" />
                 <StatBox label={t.labels.expires} value={formatExpiration(key.expiration)} color="text-pink-600 dark:text-pink-400" bgColor="bg-pink-50 dark:bg-pink-900/20" borderColor="border-pink-200 dark:border-pink-800" />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border border-dashed">
                 <button 
                   onClick={() => toggleStatus(key.id)}
                   className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                     key.status === 'active' 
                       ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                       : 'bg-green-500 hover:bg-green-600 text-white'
                   }`}
                 >
                   {key.status === 'active' ? t.actions.disable : t.actions.enable}
                 </button>
                 
                 <button 
                   onClick={() => deleteKey(key.id)}
                   className="px-4 py-1.5 rounded text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                 >
                   {t.actions.delete}
                 </button>
                 
                 <button className="px-4 py-1.5 rounded text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
                   {t.actions.edit}
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color, bgColor, borderColor }: { label: string, value: string, color: string, bgColor: string, borderColor: string }) => (
  <div className={`rounded-lg border px-4 py-3 ${bgColor} ${borderColor}`}>
    <div className={`text-sm font-bold ${color}`}>{value}</div>
    <div className="text-xs text-muted/80 mt-1">{label}</div>
  </div>
);

export default KeysPage;