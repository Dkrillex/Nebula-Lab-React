import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Trash2, Edit2, Plus, Cloud, RefreshCw } from 'lucide-react';
import { keyService, TokenVO } from '../../services/keyService';
import { useAuthStore } from '../../stores/authStore';
import TokenForm from './components/TokenForm';

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

const KeysPage: React.FC<KeysPageProps> = ({ t }) => {
  const { user } = useAuthStore();
  const [tokens, setTokens] = useState<TokenVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(''); // 添加搜索关键字状态
  const [maskKeyFlags, setMaskKeyFlags] = useState<Record<string | number, boolean>>({});
  const [toggleStatusLoading, setToggleStatusLoading] = useState<string | number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [currentToken, setCurrentToken] = useState<TokenVO | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // 获取令牌列表
  const fetchTokens = async (pageNum = pagination.current) => {
    if (!user?.nebulaApiId) {
      console.warn('用户信息中缺少 nebulaApiId');
      return;
    }

    try {
      setLoading(true);
      const res = await keyService.getTokens({
        pageNum: pageNum,
        pageSize: pagination.pageSize,
        userId: user.nebulaApiId,
        name: keyword || undefined,
      });

      if (res.code === 200) {
        const rows = res.rows || res.data || [];
        setTokens(rows);
        setPagination(prev => ({
          ...prev,
          current: pageNum,
          total: res.total || rows.length,
        }));
      }
    } catch (error) {
      console.error('获取令牌列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    if (user?.nebulaApiId) {
      fetchTokens();
    }
  }, [user?.nebulaApiId]);

  // 切换状态（启用/禁用）
  const toggleStatus = async (token: TokenVO) => {
    setToggleStatusLoading(token.id);
    try {
      const newStatus = token.status === 1 ? 2 : 1;
      await keyService.updateToken({
        id: token.id,
        status: newStatus,
        name: token.name,
        userId: token.userId,
        key: token.key,
        expiredTime: token.expiredTime,
        remainQuota: token.remainQuota,
        unlimitedQuota: token.unlimitedQuota,
        modelLimitsEnabled: token.modelLimitsEnabled,
        modelLimits: token.modelLimits,
        allowIps: token.allowIps,
      });
      await fetchTokens();
    } catch (error) {
      console.error('状态切换失败:', error);
    } finally {
      setToggleStatusLoading(null);
    }
  };

  // 删除令牌
  const deleteKey = async (token: TokenVO) => {
    if (confirm(`确认删除令牌 "${token.name || token.id}" 吗？`)) {
      try {
        await keyService.deleteToken(token.id);
        await fetchTokens();
      } catch (error) {
        console.error('删除令牌失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 打开新建表单
  const handleCreate = () => {
    setCurrentToken(null);
    setIsViewMode(false);
    setFormVisible(true);
  };

  // 打开编辑表单
  const handleEdit = (token: TokenVO) => {
    setCurrentToken(token);
    setIsViewMode(false);
    setFormVisible(true);
  };

  // 打开查看表单
  const handleView = (token: TokenVO) => {
    setCurrentToken(token);
    setIsViewMode(true);
    setFormVisible(true);
  };

  // 表单成功回调
  const handleFormSuccess = () => {
    fetchTokens();
  };

  // 复制密钥
  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(`sk-${key}`);
      // 可以添加提示消息
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 切换密钥显示/隐藏
  const toggleKeyVisibility = (tokenId: string | number) => {
    setMaskKeyFlags(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }));
  };

  // 获取密钥显示状态（默认隐藏）
  const getKeyVisibility = (tokenId: string | number) => {
    return maskKeyFlags[tokenId] ?? true;
  };

  // 掩码密钥
  const maskKey = (key?: string) => {
    if (!key) return '****';
    const len = key.length;
    if (len <= 4) return '*'.repeat(len);
    return `${key.slice(0, 2)}${'*'.repeat(len - 4)}${key.slice(-2)}`;
  };

  // 格式化额度显示（参考旧项目）
  const formatQuota = (token: TokenVO) => {
    if (token.unlimitedQuota === 1) {
      return '无限';
    }
    // 旧项目中的转换公式：(remainQuota * 7.3) / 500000
    const totalQuota = ((token.remainQuota + token.usedQuota) * 7.3) / 500000;
    return `￥${totalQuota.toFixed(2)}`;
  };

  // 格式化剩余额度
  const formatRemainingQuota = (token: TokenVO) => {
    if (token.unlimitedQuota === 1) {
      return '无限';
    }
    const remaining = (token.remainQuota * 7.3) / 500000;
    return `￥${remaining.toFixed(2)}`;
  };

  // 格式化已用额度
  const formatUsedQuota = (token: TokenVO) => {
    const used = (token.usedQuota * 7.3) / 500000;
    return `￥${used.toFixed(2)}`;
  };

  // 格式化过期时间
  const formatExpiration = (token: TokenVO) => {
    if (!token.expiredTime || token.expiredTime === null) {
      return t.values.never;
    }
    
    // 处理时间戳（可能是秒或毫秒）
    let timestamp: number;
    if (typeof token.expiredTime === 'string') {
      timestamp = new Date(token.expiredTime).getTime();
    } else {
      timestamp = token.expiredTime > 1000000000000 
        ? token.expiredTime 
        : token.expiredTime * 1000;
    }

    const now = Date.now();
    if (timestamp < now) {
      return '已过期';
    }

    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');
  };

  // 搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTokens(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchTokens(newPage);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
      {/* Header & Toolbar */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
              {pagination.total}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleCreate}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
            >
              <Plus size={18} />
              {t.createButton}
            </button>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-surface border border-border p-4 rounded-xl shadow-sm">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="搜索令牌名称..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-surface hover:text-indigo-600 transition-colors disabled:opacity-50 bg-white dark:bg-surface"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              查询
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && tokens.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {/* Empty State */}
      {!loading && tokens.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔑</div>
          <div className="text-xl font-semibold text-foreground mb-2">暂无令牌</div>
          <div className="text-muted">点击上方按钮开始添加您的第一个令牌</div>
        </div>
      )}

      {/* Key List */}
      {!loading && tokens.length > 0 && (
        <div className="space-y-6">
          {tokens.map((token) => {
            const isActive = token.status === 1;
            const isKeyVisible = getKeyVisibility(token.id);
            const displayKey = isKeyVisible 
              ? `sk-${maskKey(token.key)}` 
              : `sk-${token.key}`;

            return (
              <div 
                key={token.id} 
                onClick={() => handleView(token)}
                className={`bg-surface border border-border rounded-xl shadow-sm transition-all overflow-hidden cursor-pointer hover:shadow-md ${!isActive ? 'opacity-80' : ''}`}
              >
                {/* Top Border Stripe */}
                <div className={`h-1.5 w-full ${isActive ? 'bg-indigo-500' : 'bg-slate-500'}`}></div>
                
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                       <div className={`p-2 rounded-lg border flex-shrink-0 ${isActive ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400'}`}>
                          <Cloud size={24} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-lg truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {token.name || token.id}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted">
                            <span className="font-mono truncate">{displayKey}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleKeyVisibility(token.id);
                              }}
                              className="p-1 hover:bg-border rounded transition-colors"
                              title={isKeyVisible ? '显示密钥' : '隐藏密钥'}
                            >
                              {isKeyVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyKey(token.key);
                              }}
                              className="p-1 hover:bg-border rounded transition-colors"
                              title="复制密钥"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end flex-shrink-0 ml-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${
                         isActive 
                           ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                           : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                       }`}>
                         {isActive ? t.status.active : t.status.disabled}
                       </span>
                       <span className="text-[10px] text-muted mt-1">{t.labels.status}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                     <StatBox label={t.labels.limit} value={formatQuota(token)} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-900/20" borderColor="border-blue-200 dark:border-blue-800" />
                     <StatBox label={t.labels.remaining} value={formatRemainingQuota(token)} color="text-green-600 dark:text-green-400" bgColor="bg-green-50 dark:bg-green-900/20" borderColor="border-green-200 dark:border-green-800" />
                     <StatBox label={t.labels.used} value={formatUsedQuota(token)} color="text-orange-600 dark:text-orange-400" bgColor="bg-orange-50 dark:bg-orange-900/20" borderColor="border-orange-200 dark:border-orange-800" />
                     <StatBox label={t.labels.expires} value={formatExpiration(token)} color="text-pink-600 dark:text-pink-400" bgColor="bg-pink-50 dark:bg-pink-900/20" borderColor="border-pink-200 dark:border-pink-800" />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border border-dashed">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         toggleStatus(token);
                       }}
                       disabled={toggleStatusLoading === token.id}
                       className={`px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                         isActive 
                           ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                           : 'bg-green-500 hover:bg-green-600 text-white'
                       }`}
                     >
                       {toggleStatusLoading === token.id ? '处理中...' : (isActive ? t.actions.disable : t.actions.enable)}
                     </button>
                     
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         deleteKey(token);
                       }}
                       className="px-4 py-1.5 rounded text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                     >
                       {t.actions.delete}
                     </button>
                     
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleEdit(token);
                       }}
                       className="px-4 py-1.5 rounded text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                     >
                       {t.actions.edit}
                     </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.total > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 rounded border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-muted">
              第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
            </span>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 rounded border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* Token Form Modal */}
      <TokenForm
        visible={formVisible}
        token={currentToken}
        isViewMode={isViewMode}
        onClose={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
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