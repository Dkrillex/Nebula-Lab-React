import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Copy, Key as KeyIcon } from 'lucide-react';
import { keyService, TokenVO, TokenForm as TokenFormType } from '../../../services/keyService';
import { modelService } from '../../../services/modelService';
import { useAuthStore } from '../../../stores/authStore';
import { AIModel } from '../../../types';
import toast from 'react-hot-toast';
import { useAppOutletContext } from '../../../router/context';
import { translations } from '../../../translations';

interface TokenFormProps {
  visible: boolean;
  token?: TokenVO | null;
  isViewMode?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TokenForm: React.FC<TokenFormProps> = ({
  visible,
  token,
  isViewMode = false,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { t: rawT } = useAppOutletContext();
  const lang = localStorage.getItem('language') || 'zh';
  const keysPageT = rawT?.keysPage || translations[lang]?.keysPage || translations['zh'].keysPage;
  const t = keysPageT.form;
  const [formData, setFormData] = useState<Partial<TokenFormType>>({
    name: '',
    status: 1,
    unlimitedQuota: 0,
    quotaRmb: undefined,
    modelLimitsEnabled: 0,
    modelLimits: [],
    expiredTime: null,
    nebulaApiId: user?.nebulaApiId,
  });
  const [expiredTimeDate, setExpiredTimeDate] = useState<string>('');
  const [keyVisible, setKeyVisible] = useState(false);
  const [modelOptions, setModelOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [modelSearchValue, setModelSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 永不过期的日期：2099-12-31 23:59:59
  const NEVER_EXPIRE_DATE = '2099-12-31T23:59:59';

  // 将 Date 对象转换为本地时间字符串（格式：YYYY-MM-DDTHH:mm）
  const toLocalDateTimeString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 加载模型列表
  const loadModels = async (search?: string) => {
    try {
      const response = await modelService.getModels(search);
      // modelService.getModels() 返回 { models: AIModel[], vendors: [], tags: [], ... }
      const modelsArray = Array.isArray(response?.models) ? response.models : [];
      setModelOptions(
        modelsArray.map((model) => ({
          label: model.name,
          value: model.name,
        }))
      );
    } catch (error) {
      // 错误提示已由封装的 request 自动处理
      setModelOptions([]);
    }
  };

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (token) {
        // 编辑或查看模式
        const quotaRmb =
          token.unlimitedQuota === 0 && (token.remainQuota || token.usedQuota)
            ? Number(((token.remainQuota + token.usedQuota) * 7.3 / 500000).toFixed(2))
            : undefined;

        setFormData({
          id: token.id,
          name: token.name,
          status: token.status,
          unlimitedQuota: token.unlimitedQuota,
          quotaRmb,
          modelLimitsEnabled: token.modelLimitsEnabled,
          modelLimits: token.modelLimits
            ? (typeof token.modelLimits === 'string'
                ? token.modelLimits.split(',').filter((item) => item.trim())
                : token.modelLimits)
            : [],
          expiredTime: token.expiredTime,
          nebulaApiId: user?.nebulaApiId,
        });

        // 设置过期时间显示（参考旧项目：-1 表示永不过期，0 表示已过期）
        if (token.expiredTime && token.expiredTime !== null && token.expiredTime !== -1 && token.expiredTime !== 0) {
          let timestamp: number;
          if (typeof token.expiredTime === 'string') {
            timestamp = new Date(token.expiredTime).getTime();
          } else {
            // 时间戳可能是秒或毫秒
            timestamp = token.expiredTime > 1000000000000 ? token.expiredTime : token.expiredTime * 1000;
          }
          const date = new Date(timestamp);
          setExpiredTimeDate(toLocalDateTimeString(date));
        } else {
          // 永不过期时，设置为2099-12-31 23:59:59
          setExpiredTimeDate(NEVER_EXPIRE_DATE.slice(0, 16));
        }
      } else {
        // 新建模式
        setFormData({
          name: '',
          status: 1,
          unlimitedQuota: 0,
          quotaRmb: undefined,
          modelLimitsEnabled: 0,
          modelLimits: [],
          expiredTime: null,
          nebulaApiId: user?.nebulaApiId,
        });
        setExpiredTimeDate(NEVER_EXPIRE_DATE.slice(0, 16));
      }
      setKeyVisible(false);
      loadModels();
    }
  }, [visible, token, user?.nebulaApiId]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = t.errors.nameRequired;
    }

    if (formData.unlimitedQuota === 0) {
      if (!formData.quotaRmb || formData.quotaRmb <= 0) {
        newErrors.quotaRmb = t.errors.quotaRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: TokenFormType = {
        ...formData,
        nebulaApiId: user?.nebulaApiId,
        userId: user?.nebulaApiId || user?.userId, // 添加userId字段，参考Nebula1的payload
        status: formData.status ?? 1, // 确保status有默认值
      } as TokenFormType;

      // 转换 quotaRmb 为 remainQuota
      if (submitData.quotaRmb && submitData.quotaRmb > 0) {
        submitData.remainQuota = Math.round(submitData.quotaRmb * (500000 / 7.3));
      }

      // 处理过期时间（参考旧项目：-1 表示永不过期）
      // 如果日期是2099-12-31 23:59:59，表示永不过期，转换为-1
      if (expiredTimeDate && expiredTimeDate !== NEVER_EXPIRE_DATE.slice(0, 16)) {
        submitData.expiredTime = Math.floor(new Date(expiredTimeDate).getTime() / 1000);
      } else {
        submitData.expiredTime = -1; // 永不过期（使用 -1，参考旧项目）
      }

      // 处理模型限制
      if (Array.isArray(submitData.modelLimits)) {
        submitData.modelLimits = submitData.modelLimits.join(',');
      } else if (!submitData.modelLimits) {
        submitData.modelLimits = '';
      }

      // 添加其他可能需要的字段（参考Nebula1的payload）
      if (!submitData.group && !submitData.userGroup) {
        submitData.group = submitData.userGroup || '';
      }
      if (!submitData.allowIps) {
        submitData.allowIps = '';
      }
      if (submitData.accessedTime === undefined) {
        submitData.accessedTime = 0;
      }
      // 确保unlimitedQuota有默认值
      if (submitData.unlimitedQuota === undefined) {
        submitData.unlimitedQuota = 0;
      }
      // 确保modelLimitsEnabled有默认值
      if (submitData.modelLimitsEnabled === undefined) {
        submitData.modelLimitsEnabled = 0;
      }

      // 生成随机key的辅助函数（如果需要前端生成）
      const generateRandomKey = (length: number = 22): string => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      if (token?.id) {
        // 更新
        await keyService.updateToken({
          ...submitData,
          id: token.id,
          userId: token.userId,
          key: token.key,
        });
      } else {
        // 新建 - 添加key字段（参考Nebula1的payload格式）
        // 如果后端需要key字段，生成一个随机key；如果后端会生成，可以传递空字符串
        const createData = {
          ...submitData,
          key: generateRandomKey(), // 生成随机key，匹配Nebula1的payload格式
        };
        await keyService.createToken(createData);
      }

      onSuccess();
      onClose();
      // 成功提示已由封装的 request 自动处理（如果配置了 successMessageMode）
    } catch (error) {
      // 错误提示已由封装的 request 自动处理
    } finally {
      setLoading(false);
    }
  };

  // 设置快捷过期时间（以当前时间为基准）
  const setQuickExpire = (type: 'never' | 'hour' | 'day' | 'month') => {
    // 始终以当前时间为基准进行计算，特别是在编辑模式下
    const now = new Date();
    let targetTime: Date;

    switch (type) {
      case 'never':
        setExpiredTimeDate(NEVER_EXPIRE_DATE.slice(0, 16));
        return;
      case 'hour':
        // 从当前时间开始，添加1小时
        targetTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'day':
        // 从当前时间开始，添加1天
        targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // 从当前时间开始，添加30天
        targetTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    // 使用本地时间格式，而不是 UTC 时间
    setExpiredTimeDate(toLocalDateTimeString(targetTime));
  };

  // 掩码密钥
  const maskKey = (key?: string) => {
    if (!key) return '****';
    const len = key.length;
    if (len <= 4) return '*'.repeat(len);
    return `${key.slice(0, 2)}${'*'.repeat(len - 4)}${key.slice(-2)}`;
  };

  // 复制密钥
  const copyKey = async () => {
    if (token?.key) {
      try {
        await navigator.clipboard.writeText(`sk-${token.key}`);
        toast.success(keysPageT.messages.copySuccess);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  // 格式化过期时间显示
  const getExpiredTimeDisplay = (): string => {
    const locale = lang === 'en' ? 'en-US' : lang === 'id' ? 'id-ID' : 'zh-CN';
    
    if (!token?.expiredTime || token.expiredTime === null) {
      return keysPageT.values.never;
    }
    if (token.expiredTime === -1) {
      return keysPageT.values.never;
    }

    let timestamp: number;
    if (typeof token.expiredTime === 'string') {
      timestamp = new Date(token.expiredTime).getTime();
    } else {
      timestamp = token.expiredTime > 1000000000000 ? token.expiredTime : token.expiredTime * 1000;
    }

    if (timestamp < Date.now()) {
      return keysPageT.values.expired;
    }

    return new Date(timestamp).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');
  };

  if (!visible) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ opacity: visible ? 1 : 0 }}
      />
      
      {/* 抽屉 */}
      <div 
        className={`fixed right-0 top-0 bottom-0 z-50 bg-surface border-l border-border shadow-2xl w-full md:max-w-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ maxHeight: '100vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            {token && <h2 className="text-lg font-semibold text-foreground">{token.name || token.id}</h2>}
            {!token && <h2 className="text-lg font-semibold text-foreground">{t.title}</h2>}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground hover:bg-surface rounded-lg p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-4">
            {/* 令牌名称 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.name} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  errors.name ? 'border-red-500' : 'border-border'
                } disabled:opacity-50`}
                placeholder={t.namePlaceholder}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* API密钥（仅查看模式） */}
            {isViewMode && token?.key && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.apiKey}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={keyVisible ? `sk-${token.key}` : `sk-${maskKey(token.key)}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono"
                    style={{ wordBreak: 'break-all', minWidth: 0 }}
                  />
                  <button
                    onClick={() => setKeyVisible(!keyVisible)}
                    className="p-2 border border-border rounded-lg hover:bg-surface transition-colors"
                    title={keyVisible ? keysPageT.actions.hideKey : keysPageT.actions.showKey}
                  >
                    {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={copyKey}
                    className="p-2 border border-border rounded-lg hover:bg-surface transition-colors"
                    title={keysPageT.actions.copyKey}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* 启用模型限制 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.enableModelLimits}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.modelLimitsEnabled === 1}
                    onChange={() => setFormData({ ...formData, modelLimitsEnabled: 1 })}
                    disabled={isViewMode}
                    className="disabled:opacity-50"
                  />
                  <span>{t.yes}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.modelLimitsEnabled === 0}
                    onChange={() => setFormData({ ...formData, modelLimitsEnabled: 0 })}
                    disabled={isViewMode}
                    className="disabled:opacity-50"
                  />
                  <span>{t.no}</span>
                </label>
              </div>
            </div>

            {/* 模型限制 */}
            {formData.modelLimitsEnabled === 1 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t.modelLimits}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={modelSearchValue}
                    onChange={(e) => {
                      setModelSearchValue(e.target.value);
                      loadModels(e.target.value);
                    }}
                    disabled={isViewMode}
                    placeholder={t.searchModel}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50"
                  />
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                    {modelOptions.map((model) => {
                      const isSelected = Array.isArray(formData.modelLimits)
                        ? formData.modelLimits.includes(model.value)
                        : false;
                      return (
                        <label
                          key={model.value}
                          className="flex items-center gap-2 p-2 hover:bg-surface rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const current = Array.isArray(formData.modelLimits)
                                ? formData.modelLimits
                                : [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  modelLimits: [...current, model.value],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  modelLimits: current.filter((v) => v !== model.value),
                                });
                              }
                            }}
                            disabled={isViewMode}
                            className="disabled:opacity-50"
                          />
                          <span className="text-sm">{model.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 无限额度 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t.unlimitedQuota}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.unlimitedQuota === 1}
                    onChange={() => setFormData({ ...formData, unlimitedQuota: 1 })}
                    disabled={isViewMode}
                    className="disabled:opacity-50"
                  />
                  <span>{t.yes}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.unlimitedQuota === 0}
                    onChange={() => setFormData({ ...formData, unlimitedQuota: 0 })}
                    disabled={isViewMode}
                    className="disabled:opacity-50"
                  />
                  <span>{t.no}</span>
                </label>
              </div>
            </div>

            {/* 总额度 */}
            {formData.unlimitedQuota === 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t.totalQuota} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quotaRmb || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quotaRmb: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  disabled={isViewMode}
                  min="0.01"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                    errors.quotaRmb ? 'border-red-500' : 'border-border'
                  } disabled:opacity-50`}
                  placeholder={t.totalQuotaPlaceholder}
                />
                {errors.quotaRmb && (
                  <p className="text-red-500 text-xs mt-1">{errors.quotaRmb}</p>
                )}
              </div>
            )}

            {/* 已用额度（仅查看模式） */}
            {isViewMode && token && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.usedQuota}</label>
                <div className="text-gray-700 dark:text-gray-300 font-semibold">
                  ￥{((token.usedQuota || 0) * 7.3 / 500000).toFixed(2)}
                </div>
              </div>
            )}

            {/* 剩余额度（仅查看模式） */}
            {isViewMode && token && token.unlimitedQuota === 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.remainingQuota}</label>
                <div className="text-gray-700 dark:text-gray-300 font-semibold">
                  ￥{((token.remainQuota || 0) * 7.3 / 500000).toFixed(2)}
                </div>
              </div>
            )}

            {/* 过期时间 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.expirationTime} {isViewMode ? '' : <span className="text-red-500">*</span>}
              </label>
              {isViewMode ? (
                <div className="px-3 py-2 border border-border rounded-lg bg-background">
                  {getExpiredTimeDisplay()}
                </div>
              ) : (
                <>
                  <input
                    type="datetime-local"
                    value={expiredTimeDate}
                    onChange={(e) => setExpiredTimeDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => setQuickExpire('never')}
                      className="px-3 py-1 text-xs border border-border rounded hover:bg-surface transition-colors"
                    >
                      {t.quickExpire.never}
                    </button>
                    <button
                      onClick={() => setQuickExpire('hour')}
                      className="px-3 py-1 text-xs border border-border rounded hover:bg-surface transition-colors"
                    >
                      {t.quickExpire.oneHour}
                    </button>
                    <button
                      onClick={() => setQuickExpire('day')}
                      className="px-3 py-1 text-xs border border-border rounded hover:bg-surface transition-colors"
                    >
                      {t.quickExpire.oneDay}
                    </button>
                    <button
                      onClick={() => setQuickExpire('month')}
                      className="px-3 py-1 text-xs border border-border rounded hover:bg-surface transition-colors"
                    >
                      {t.quickExpire.oneMonth}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          {!isViewMode && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gray-800 dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.buttons.saving : t.buttons.save}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-lg hover:bg-surface transition-colors text-foreground"
          >
            {t.buttons.close}
          </button>
        </div>
      </div>
    </>
  );
};

export default TokenForm;

