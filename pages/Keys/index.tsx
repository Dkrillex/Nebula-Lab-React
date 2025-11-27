import React, { useState, useEffect } from 'react';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';
import { Copy, Eye, EyeOff, Trash2, Edit2, Plus, RefreshCw, Power, PowerOff } from 'lucide-react';
import { keyService, TokenVO } from '../../services/keyService';
import { useAuthStore } from '../../stores/authStore';
import TokenForm from './components/TokenForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

interface KeysPageProps {
  t?: any;
}

const KeysPage: React.FC<KeysPageProps> = (props) => {
  const { t: rawT } = useAppOutletContext();
  const t = props.t || rawT?.keysPage || translations['zh'].keysPage;

  const { user } = useAuthStore();
  const [tokens, setTokens] = useState<TokenVO[]>([]);
  const [loading, setLoading] = useState(false);
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
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
      });
      console.log(res)
      
      // 兼容直接返回 { rows, total } 的格式（没有 code 字段的情况）
      if (res && Array.isArray(res.rows)) {
        const rows = res.rows;
        setTokens(rows);
        setPagination(prev => ({
          ...prev,
          current: pageNum,
          total: res.total || rows.length,
        }));
      }
      else if (res.code === 200) {
        const rows = res.rows || res.data || [];
        setTokens(rows);
        setPagination(prev => ({
          ...prev,
          current: pageNum,
          total: res.total || rows.length,
        }));
      }
    } catch (error) {
      // 错误提示已由封装的 request 自动处理
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
      // 错误提示已由封装的 request 自动处理
    } finally {
      setToggleStatusLoading(null);
    }
  };

  // 删除令牌
  const deleteKey = async (token: TokenVO) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确认删除令牌 "${token.name || token.id}" 吗？`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await keyService.deleteToken(token.id);
          await fetchTokens();
          // 成功提示已由封装的 request 自动处理（如果配置了 successMessageMode）
          // 如果需要显示成功提示，可以在 keyService 中设置 successMessageMode: 'message'
        } catch (error) {
          // 错误提示已由封装的 request 自动处理
        }
      },
    });
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
  const handleFormSuccess = async () => {
    // 新增成功后，重置到第一页并刷新列表
    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchTokens(1);
  };

  // 复制密钥
  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(`sk-${key}`);
      toast.success('密钥已复制');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  };

  // 切换密钥显示/隐藏
  const toggleKeyVisibility = (tokenId: string | number) => {
    setMaskKeyFlags(prev => ({
      ...prev,
      [tokenId]: !(prev[tokenId] ?? false),
    }));
  };

  // 获取密钥显示状态
  const getKeyVisibility = (tokenId: string | number) => {
    return maskKeyFlags[tokenId] ?? false;
  };

  // 掩码密钥
  const maskKey = (key?: string) => {
    if (!key) return '****';
    const len = key.length;
    if (len <= 4) return '*'.repeat(len);
    return `${key.slice(0, 2)}${'*'.repeat(len - 4)}${key.slice(-2)}`;
  };

  // 格式化额度显示
  const formatQuota = (token: TokenVO) => {
    if (token.unlimitedQuota === 1) {
      return '无限';
    }
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
    const expiredTime = token.expiredTime;
    
    if (expiredTime === null || expiredTime === undefined) {
      return '永不过期';
    }
    
    if (typeof expiredTime === 'string') {
      const timestamp = new Date(expiredTime).getTime();
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
    }
    
    if (typeof expiredTime === 'number') {
      if (expiredTime === -1) {
        return '永不过期';
      }
      if (expiredTime === 0) {
        return '已过期';
      }
      
      const timestamp = expiredTime > 1000000000000 
        ? expiredTime 
        : expiredTime * 1000;

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
    }
    
    return '永不过期';
  };

  const handlePageChange = (newPage: number) => {
    fetchTokens(newPage);
  };

  if (!t) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <RefreshCw className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-[calc(100vh-67px)] box-border">
      <div className="max-w-[1600px] mx-auto flex flex-col box-border">
        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
          <div className="flex-1 flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 m-0">
              API 令牌管理
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 m-0">
              管理您的 API 密钥以访问服务
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => fetchTokens()}
              disabled={loading}
              className={`px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
            <button 
              onClick={handleCreate}
              className="px-4 py-2 border-none rounded-md bg-black dark:bg-white text-white dark:text-black text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 whitespace-nowrap hover:opacity-80"
            >
              <Plus size={16} />
               新建 API 密钥
            </button>
          </div>
        </div>

        {/* 表格容器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && tokens.length === 0 ? (
            <div className="flex justify-center items-center py-16 px-8 min-h-[400px]">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin text-slate-500 dark:text-slate-400" size={24} />
                <span className="text-slate-500 dark:text-slate-400">加载中...</span>
              </div>
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-slate-500 dark:text-slate-400 text-center min-h-[400px]">
              <div className="text-6xl mb-4 opacity-50">🔑</div>
              <div className="text-xl font-semibold mb-2">暂无令牌</div>
              <div className="text-sm opacity-80">
                点击上方"新建 API 密钥"按钮创建您的第一个令牌
              </div>
            </div>
          ) : (
            <>
              {/* 表格 */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">名称</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">API Key</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">状态</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">额度使用</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">过期时间</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => {
                      const isActive = token.status === 1;
                      const isKeyVisible = getKeyVisibility(token.id);
                      const displayKey = isKeyVisible 
                        ? `sk-${token.key}`
                        : `sk-${maskKey(token.key)}`;

                      return (
                        <tr 
                          key={token.id}
                          className={`transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${index < tokens.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                        >
                          {/* 名称 */}
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {token.name || token.id}
                          </td>
                          {/* API Key */}
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[13px] text-gray-700 dark:text-gray-300 break-all">
                                {displayKey}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleKeyVisibility(token.id);
                                  }}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                                  title={isKeyVisible ? '隐藏密钥' : '显示密钥'}
                                >
                                  {isKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyKey(token.key);
                                  }}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                                  title="复制密钥"
                                >
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </td>
                          {/* 状态 */}
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-500'}`}></div>
                              <span className={`font-medium ${isActive ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                {isActive ? '启用' : '禁用'}
                              </span>
                            </div>
                          </td>
                          {/* 额度使用 */}
                          <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex flex-col gap-1">
                              <span>已用: {formatUsedQuota(token)}</span>
                              <span>剩余: {token.unlimitedQuota === 1 ? '无限' : formatRemainingQuota(token)}</span>
                            </div>
                          </td>
                          {/* 过期时间 */}
                          <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {formatExpiration(token)}
                          </td>
                          {/* 操作 */}
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(token);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500"
                                title="编辑"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(token);
                                }}
                                disabled={toggleStatusLoading === token.id}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded bg-transparent border-none transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 ${toggleStatusLoading === token.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={isActive ? '禁用' : '启用'}
                              >
                                {toggleStatusLoading === token.id ? (
                                  <RefreshCw size={16} className="animate-spin" />
                                ) : isActive ? (
                                  <PowerOff size={16} />
                                ) : (
                                  <Power size={16} />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteKey(token);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页底部 */}
              {!loading && pagination.total > 0 && (
                <div className="flex justify-between items-center px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    共 {pagination.total} 条记录
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 分页按钮（已注释） */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Token Form Modal */}
      <TokenForm
        visible={formVisible}
        token={currentToken}
        isViewMode={isViewMode}
        onClose={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
      
      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type="danger"
      />
    </div>
  );
};

export default KeysPage;
