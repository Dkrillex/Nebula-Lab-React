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
      'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
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
    <div className="llm-model-page" style={{ 
      padding: '24px', 
      background: '#fff', 
      minHeight: 'calc(100vh - 67px)',
      boxSizing: 'border-box'
    }}>
      <div className="main-content" style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        {/* 工具栏 */}
        <div className="toolbar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div className="toolbar-left" style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1f2937',
              margin: 0
            }}>
              API 令牌管理
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              管理您的 API 密钥以访问服务
            </p>
          </div>
          <div className="toolbar-right" style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}>
            <button 
              onClick={() => fetchTokens()}
              disabled={loading}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                opacity: loading ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
            <button 
              onClick={handleCreate}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: '#000',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} />
               新建 API 密钥
            </button>
          </div>
        </div>

        {/* 表格容器 */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {loading && tokens.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4rem 2rem',
              minHeight: '400px'
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
              textAlign: 'center',
              minHeight: '400px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🔑</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>暂无令牌</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                点击上方"新建 API 密钥"按钮创建您的第一个令牌
              </div>
            </div>
          ) : (
            <>
              {/* 表格 */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>名称</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>API Key</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>状态</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>额度使用</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>过期时间</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>操作</th>
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
                          style={{
                            borderBottom: index < tokens.length - 1 ? '1px solid #e5e7eb' : 'none',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {/* 名称 */}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px',
                            color: '#1f2937'
                          }}>
                            {token.name || token.id}
                          </td>
                          {/* API Key */}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                color: '#374151',
                                wordBreak: 'break-all'
                              }}>
                                {displayKey}
                              </span>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexShrink: 0
                              }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleKeyVisibility(token.id);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.color = '#1f2937';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6b7280';
                                  }}
                                  title={isKeyVisible ? '隐藏密钥' : '显示密钥'}
                                >
                                  {isKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyKey(token.key);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.color = '#1f2937';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6b7280';
                                  }}
                                  title="复制密钥"
                                >
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </td>
                          {/* 状态 */}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isActive ? '#10b981' : '#6b7280'
                              }}></div>
                              <span style={{
                                color: isActive ? '#10b981' : '#6b7280',
                                fontWeight: 500
                              }}>
                                {isActive ? '启用' : '禁用'}
                              </span>
                            </div>
                          </td>
                          {/* 额度使用 */}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px',
                            color: '#374151'
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <span>已用: {formatUsedQuota(token)}</span>
                              <span>剩余: {token.unlimitedQuota === 1 ? '无限' : formatRemainingQuota(token)}</span>
                            </div>
                          </td>
                          {/* 过期时间 */}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px',
                            color: '#374151'
                          }}>
                            {formatExpiration(token)}
                          </td>
                          {/* 操作 */}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(token);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#6b7280',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#eff6ff';
                                  e.currentTarget.style.color = '#3b82f6';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#6b7280';
                                }}
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
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: toggleStatusLoading === token.id ? 'not-allowed' : 'pointer',
                                  color: '#6b7280',
                                  transition: 'all 0.2s ease',
                                  opacity: toggleStatusLoading === token.id ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (toggleStatusLoading !== token.id) {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.color = '#1f2937';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (toggleStatusLoading !== token.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6b7280';
                                  }
                                }}
                                title={isActive ? '禁用' : '启用'}
                              >
                                {toggleStatusLoading === token.id ? (
                                  <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                  <EyeOff size={16} />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteKey(token);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#6b7280',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef2f2';
                                  e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#6b7280';
                                }}
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  borderTop: '1px solid #e5e7eb',
                  background: '#f9fafb'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    共 {pagination.total} 条记录
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {/* <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        fontSize: '14px',
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
                        if (pagination.current > 1) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      上一页
                    </button>
                    <span style={{
                      fontSize: '14px',
                      color: '#374151',
                      padding: '0 12px'
                    }}>
                      {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        fontSize: '14px',
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
                        if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      下一页
                    </button> */}
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