import React, { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff, Trash2, Edit2, Plus, RefreshCw } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[80vh]">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
           <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t.title}</h1>
           <p className="text-sm text-muted mt-1">管理您的 API 密钥以访问服务</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="搜索密钥名称..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
          </div>

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-surface transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            刷新
          </button>

          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            {t.createButton}
          </button>
        </div>
      </div>

      {/* Table Layout */}
      <div className="rounded-lg border border-border bg-surface/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface border-b border-border text-muted font-medium">
              <tr>
                <th className="px-6 py-3 w-[200px]">名称</th>
                <th className="px-6 py-3 w-[550px]">API Key</th>
                <th className="px-6 py-3 w-[120px]">状态</th>
                <th className="px-6 py-3 w-[220px]">额度使用</th>
                <th className="px-6 py-3 w-[180px]">过期时间</th>
                <th className="px-6 py-3 text-right w-[160px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {loading && tokens.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-muted">
                     <div className="flex flex-col items-center gap-2">
                       <RefreshCw className="animate-spin" size={20} />
                       <span>加载中...</span>
                     </div>
                   </td>
                 </tr>
              ) : tokens.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-muted">
                     暂无 API 密钥
                   </td>
                 </tr>
              ) : (
                tokens.map((token) => {
                  const isActive = token.status === 1;
                  const isKeyVisible = getKeyVisibility(token.id);
                  const displayKey = isKeyVisible 
                    ? `sk-${token.key}`
                    : `sk-${maskKey(token.key)}`;

                  return (
                    <tr key={token.id} className="group hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground truncate max-w-[180px]" title={token.name}>
                          {token.name || token.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 bg-surface/50 rounded px-2 py-1 w-fit border border-border/50">
                          <span className="font-mono text-muted text-xs">{displayKey}</span>
                          <div className="flex items-center border-l border-border/50 pl-2 ml-1 gap-1">
                            <button
                              onClick={() => toggleKeyVisibility(token.id)}
                              className="text-muted hover:text-foreground transition-colors"
                              title={isKeyVisible ? '隐藏' : '显示'}
                            >
                              {isKeyVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              onClick={() => copyKey(token.key)}
                              className="text-muted hover:text-foreground transition-colors"
                              title="复制"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          isActive 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`}></span>
                          {isActive ? '启用' : '禁用'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex justify-between items-center gap-4">
                             <span className="text-muted">已用:</span>
                             <span className="font-mono">{formatUsedQuota(token)}</span>
                          </div>
                          {token.unlimitedQuota !== 1 && (
                            <div className="flex justify-between items-center gap-4">
                               <span className="text-muted">剩余:</span>
                               <span className="font-mono text-foreground">{formatRemainingQuota(token)}</span>
                            </div>
                          )}
                          {token.unlimitedQuota === 1 && (
                             <span className="text-muted">无限额度</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {formatExpiration(token)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(token)}
                            className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
                            title="编辑"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                             onClick={() => toggleStatus(token)}
                             disabled={toggleStatusLoading === token.id}
                             className={`p-1.5 rounded transition-colors ${isActive ? 'text-muted hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                             title={isActive ? '禁用' : '启用'}
                          >
                            {toggleStatusLoading === token.id ? <RefreshCw size={14} className="animate-spin"/> : (isActive ? <EyeOff size={14} /> : <Eye size={14} />)}
                          </button>
                          <button 
                            onClick={() => deleteKey(token)}
                            className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {!loading && pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-border bg-surface/30 flex items-center justify-between">
                <span className="text-sm text-muted">
                    共 {pagination.total} 条记录
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                        className="px-2 py-1 rounded border border-border text-xs hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        上一页
                    </button>
                    <span className="text-xs text-muted">
                        {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                        className="px-2 py-1 rounded border border-border text-xs hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        下一页
                    </button>
                </div>
            </div>
        )}
      </div>

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

export default KeysPage;