import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Copy, Eye, EyeOff, Trash2, Edit2, Plus, RefreshCw } from 'lucide-react';
import { keyService, TokenVO } from '../../services/keyService';
import { useAuthStore } from '../../stores/authStore';
import TokenForm from './components/TokenForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

interface KeysPageProps {}

const KeysPage: React.FC<KeysPageProps> = () => {
  const outletContext = useOutletContext<{ t: any }>();
  const t = outletContext?.t?.keysPage;

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
        name: keyword || undefined,
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
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确认删除令牌 "${token.name || token.id}" 吗？`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await keyService.deleteToken(token.id);
          await fetchTokens();
          toast.success('删除成功');
        } catch (error) {
          console.error('删除令牌失败:', error);
          toast.error('删除失败，请重试');
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
      [tokenId]: !(prev[tokenId] ?? false), // 如果未定义，默认为 false（隐藏），然后取反变成 true（显示）
    }));
  };

  // 获取密钥显示状态（true表示显示，false表示隐藏，默认false即隐藏）
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
    const expiredTime = token.expiredTime;
    
    if (expiredTime === null || expiredTime === undefined) {
      return '永不过期';
    }
    
    // 处理字符串类型
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
    
    // 处理数字类型
    if (typeof expiredTime === 'number') {
      if (expiredTime === -1) {
        return '永不过期';
      }
      if (expiredTime === 0) {
        return '已过期';
      }
      
      // 处理时间戳（可能是秒或毫秒）
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

  // 获取卡片渐变样式（参考 Nebula1）
  const getRibbonStyle = (token: TokenVO) => {
    const ribbonGradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ];
    const apiKey = String(token?.id ?? token?.name ?? '');
    const hashStringToInt = (input: string): number => {
      let hash = 0;
      for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash = Math.trunc(hash);
      }
      return Math.abs(hash);
    };
    const index = apiKey
      ? hashStringToInt(apiKey) % ribbonGradients.length
      : Math.floor(Math.random() * ribbonGradients.length);
    return { background: ribbonGradients[index] };
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

  if (!t) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <RefreshCw className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="llm-model-page" style={{ padding: '0.8rem', background: '#fff', minHeight: 'calc(100vh - 67px)' }}>
      <div className="main-content" style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* 右侧列表 */}
        <div className="assets-display" style={{ 
          flex: 1, 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          maxHeight: 'calc(100vh - 67px)',
          overflowY: 'auto'
        }}>
          <div className="toolbar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.15rem',
            paddingBottom: '0.15rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div className="toolbar-left">
              <div className="stats-info" style={{
                fontSize: '0.9rem',
                color: '#64748b',
                fontWeight: 500
              }}>
                共 {pagination.total} 个令牌
              </div>
            </div>
            <div className="toolbar-center" style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#2d3748',
              margin: 0
            }}>
              API 令牌管理
            </div>
            <div className="toolbar-right">
              <div className="toolbar-actions" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                {/* <div className="relative" style={{ width: '100%', maxWidth: '256px' }}>
                  <input 
                    type="text" 
                    placeholder="搜索密钥名称..." 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    style={{
                      width: '100%',
                      paddingLeft: '2.25rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                </div> */}
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  刷新
                </button>
                <button 
                  onClick={handleCreate}
                  className="toolbar-btn primary"
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🔑</span>
                  {t.createButton}
                </button>
              </div>
            </div>
          </div>

          {/* Cards Layout */}
          {loading && tokens.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4rem 2rem',
              minHeight: 'calc(100vh - 200px - 60px - 1.6rem)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw className="animate-spin" size={24} style={{ color: '#64748b' }} />
                <span style={{ color: '#64748b' }}>加载中...</span>
              </div>
            </div>
          ) : tokens.length === 0 ? (
            <div className="empty-state" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🔑</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>暂无令牌</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {keyword ? '未找到匹配的令牌，请尝试其他搜索条件' : '点击上方"新建 API 密钥"按钮创建您的第一个令牌'}
              </div>
            </div>
          ) : (
            <div className="assets-grid" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {tokens.map((token) => {
                const isActive = token.status === 1;
                const isKeyVisible = getKeyVisibility(token.id); // true表示显示，false表示隐藏
                const displayKey = isKeyVisible 
                  ? `sk-${token.key}`
                  : `sk-${maskKey(token.key)}`;

                return (
                  <div
                    key={token.id}
                    className="model-card"
                    style={{
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onClick={() => handleView(token)}
                  >
                    {/* Ribbon */}
                    <div 
                      className="model-ribbon"
                      style={{
                        ...getRibbonStyle(token),
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        height: '6px'
                      }}
                    />

                    {/* Card Content */}
                    <div className="model-content" style={{ padding: '1rem' }}>
                      {/* Header */}
                      <div className="model-header" style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div className="model-icon" style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <img src="img/nebula-data-logo.png" alt="token" className="icon-img" style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }} />
                        </div>
                        <div className="model-info" style={{ flex: 1, minWidth: 0 }}>
                          <div className="model-name" style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#1f2937',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }} title={token.name || String(token.id)}>
                            {token.name || token.id}
                          </div>
                          <div className="model-developer" style={{
                            fontSize: '0.85rem',
                            color: '#4b5563',
                            background: 'rgba(102, 126, 234, 0.05)',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                          }}>
                            <span>API密钥:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, minWidth: 0 }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '120px'
                              }}>{displayKey}</span>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
                                paddingLeft: '0.25rem',
                                marginLeft: '0.25rem'
                              }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleKeyVisibility(token.id);
                                  }}
                                  className="icon-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    background: '#fafafa',
                                    color: '#666',
                                    border: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#1890ff';
                                    e.currentTarget.style.background = '#f6f9ff';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(24, 144, 255, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#666';
                                    e.currentTarget.style.background = '#fafafa';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                  title={isKeyVisible ? '隐藏密钥' : '显示密钥'}
                                >
                                  {isKeyVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyKey(token.key);
                                  }}
                                  className="icon-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    background: '#fafafa',
                                    color: '#666',
                                    border: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#1890ff';
                                    e.currentTarget.style.background = '#f6f9ff';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(24, 144, 255, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#666';
                                    e.currentTarget.style.background = '#fafafa';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                  title="复制密钥"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="model-price" style={{
                          textAlign: 'right',
                          minWidth: 'fit-content',
                          background: 'rgba(255, 255, 255, 0.8)',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          alignSelf: 'flex-end'
                        }}>
                          <div 
                            className="price-value"
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                              color: isActive ? '#059669' : '#dc2626'
                            }}
                          >
                            {isActive ? '启用' : '禁用'}
                          </div>
                          <div className="price-unit" style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                          }}>
                            状态
                          </div>
                        </div>
                      </div>

                      {/* Quota Info and Action Buttons */}
                      <div className="capability-buttons" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        alignItems: 'center',
                        marginTop: '0.5rem',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                          <span className="capability-btn cap-chat" style={{
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #93c5fd',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            color: '#1e40af',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}>
                            总额度: {token.unlimitedQuota === 1 ? '无限' : formatQuota(token)}
                          </span>
                          <span className="capability-btn cap-prefix" style={{
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #86efac',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            color: '#047857',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}>
                            剩余: {token.unlimitedQuota === 1 ? '无限' : formatRemainingQuota(token)}
                          </span>
                          <span className="capability-btn cap-tools" style={{
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #fcd34d',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            color: '#b45309',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}>
                            已用: {formatUsedQuota(token)}
                          </span>
                          <span className="capability-btn cap-expire" style={{
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #f9a8d4',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                            color: '#be185d',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}>
                            过期: {formatExpiration(token)}
                          </span>
                        </div>
                        <div className="action-buttons" style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(token);
                            }}
                            disabled={toggleStatusLoading === token.id}
                            className={`action-btn status-btn ${isActive ? 'status-disable' : 'status-enable'}`}
                            style={{
                              borderRadius: '8px',
                              fontWeight: 500,
                              height: '32px',
                              padding: '0 16px',
                              transition: 'all 0.3s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '60px',
                              fontSize: '12px',
                              border: 'none',
                              color: 'white',
                              background: isActive 
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: isActive
                                ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                                : '0 4px 12px rgba(16, 185, 129, 0.3)',
                              opacity: toggleStatusLoading === token.id ? 0.5 : 1,
                              cursor: toggleStatusLoading === token.id ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              if (toggleStatusLoading !== token.id) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = isActive
                                  ? '0 6px 16px rgba(245, 158, 11, 0.4)'
                                  : '0 6px 16px rgba(16, 185, 129, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = isActive
                                ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                                : '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                            title={isActive ? '禁用令牌' : '启用令牌'}
                          >
                            {toggleStatusLoading === token.id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              isActive ? '禁用' : '启用'
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteKey(token);
                            }}
                            className="action-btn delete-btn"
                            style={{
                              borderRadius: '8px',
                              fontWeight: 500,
                              height: '32px',
                              padding: '0 16px',
                              transition: 'all 0.3s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '60px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              border: 'none',
                              background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                              color: 'white',
                              boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 101, 101, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.3)';
                            }}
                            title="删除令牌"
                          >
                            删除
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(token);
                            }}
                            className="action-btn edit-btn"
                            style={{
                              borderRadius: '8px',
                              fontWeight: 500,
                              height: '32px',
                              padding: '0 16px',
                              transition: 'all 0.3s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '60px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              border: 'none',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                            }}
                            title="编辑令牌"
                          >
                            编辑
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {/* {!loading && pagination.total > 0 && (
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: pagination.current === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: pagination.current === 1 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (pagination.current > 1) {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                上一页
              </button>
              <span style={{
                fontSize: '0.875rem',
                color: '#64748b',
                padding: '0 0.5rem'
              }}>
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: pagination.current >= Math.ceil(pagination.total / pagination.pageSize) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: pagination.current >= Math.ceil(pagination.total / pagination.pageSize) ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                下一页
              </button>
            </div>
          )} */}
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