import React, { useState, useEffect, useMemo } from 'react';
import { X, Smartphone, Lock, Mail, KeyRound, Loader2, Globe } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  lang?: string; // 添加语言参数
  t: {
    loginTitle: string;
    tabPassword: string;
    tabPhone: string;
    accountLabel: string;
    accountPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    sendCode: string;
    codeSent: string;
    signIn: string;
    agreePolicy?: string;
    privacyPolicy?: string;
    terms?: string;
    loginSubtitle?: string; // 新增国际化字段
  };
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, lang = 'zh', t }) => {
  const { login, phoneLogin, loading } = useAuthStore();
  const [mode, setMode] = useState<'password' | 'phone'>('password');
  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // 根据语言排序国家代码选项（参考 Vue3 实现）
  const countryCodeOptions = useMemo(() => {
    // 使用动态翻译的国家名称
    const options = [
      { value: '+86', label: `+86 ${t.countries?.china || '中国大陆'}`, locale: 'zh' },
      { value: '+81', label: `+81 ${t.countries?.japan || '日本'}`, locale: 'ja' },
      { value: '+62', label: `+62 ${t.countries?.indonesia || '印度尼西亚'}`, locale: 'id' },
    ];
    const currentLocale = lang.toLowerCase();

    // 确定首选国家代码
    let preferredValue = '+86'; // 默认中国
    if (currentLocale.startsWith('id')) {
      preferredValue = '+62'; // 印度尼西亚
    } else if (currentLocale.startsWith('ja')) {
      preferredValue = '+81'; // 日本
    } else if (currentLocale.startsWith('zh')) {
      preferredValue = '+86'; // 中国
    } else if (currentLocale.startsWith('en')) {
      preferredValue = '+1'; // 美国
    } else if (currentLocale.startsWith('ko')) {
      preferredValue = '+82'; // 韩国
    }

    // 将首选项移到最前面
    const index = options.findIndex((item) => item.value === preferredValue);
    if (index > 0) {
      const preferredOption = options[index];
      options.splice(index, 1);
      options.unshift(preferredOption);
    }

    return options;
  }, [lang, t]);

  // 获取默认国家代码（排序后的第一项）
  const defaultCountryCode = useMemo(() => {
    return countryCodeOptions[0]?.value ?? '+86';
  }, [countryCodeOptions]);

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountryCode);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setMode('password');
      setCountdown(0);
      setAgreePolicy(false);
      // Reset form fields
      setUsername('');
      setPassword('');
      setPhone('');
      setCode('');
      // 重置为当前语言对应的默认国家代码
      setCountryCode(defaultCountryCode);
    }
  }, [isOpen, defaultCountryCode]);

  // Countdown timer for code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  // 验证手机号格式
  const validatePhone = (phoneNumber: string): boolean => {
    return /^\d{6,15}$/.test(phoneNumber);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      toast.error('请输入手机号');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('手机号格式不正确（6-15位数字）');
      return;
    }

    try {
      setSendingCode(true);
      
      // 根据国家代码确定类型：+86为国内(1)，其他为国际(2)
      const smsType = countryCode === '+86' ? 1 : 2;
      
      await authService.sendSmsCode(phone, {
        type: smsType,
        checkUser: false, // 登录即注册，不检查用户是否存在
        countryCode: countryCode,
      });

      toast.success('验证码发送成功');
      setCountdown(60);
    } catch (err: any) {
      console.error('发送验证码失败:', err);
      const errorMessage = err?.response?.data?.msg || err?.message || '验证码发送失败，请稍后重试';
      
      // 处理限流错误
      if (errorMessage.includes('频繁') || errorMessage.includes('frequently')) {
        toast.error('访问过于频繁，请稍后再试');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSendingCode(false);
    }
  };

  // 手机号登录
  const handlePhoneLogin = async () => {
    if (!phone) {
      toast.error('请输入手机号');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('手机号格式不正确（6-15位数字）');
      return;
    }

    if (!code || code.length !== 4) {
      toast.error('请输入4位验证码');
      return;
    }

    if (!agreePolicy && mode === 'phone') {
      toast.error('请先同意隐私政策和服务条款');
      return;
    }

    try {
      await phoneLogin({
        phonenumber: phone,
        smsCode: code,
        countryCode: countryCode,
      });
      
      if (onLoginSuccess) onLoginSuccess();
      handleClose();
    } catch (err: any) {
      console.error('手机号登录失败:', err);
      toast.error(err?.response?.data?.msg || err?.message || '登录失败，请检查验证码是否正确');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'password') {
        await login({ username, password });
        if (onLoginSuccess) onLoginSuccess();
        handleClose();
      } else if (mode === 'phone') {
        await handlePhoneLogin();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || err?.message || '操作失败，请重试');
    }
  };

  // 显示隐私政策
  const showPrivacyPolicy = () => {
    const content = `
欢迎您注册并使用我们的平台。为了保障您的个人信息安全，在您使用本系统前，请务必仔细阅读以下内容：

1. 我们会收集您的登录信息、操作记录等用于系统正常运转及优化。

2. 我们承诺不向第三方泄露您的个人信息，除非依法依规或获得您明确同意。

3. 使用本系统即代表您同意本隐私政策与服务条款。

4. 更多详情请访问我们的官网或联系客服。
    `.trim();
    
    toast(content, { duration: 6000 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            {t.loginTitle}
          </h2>
          <button 
            onClick={handleClose}
            className="rounded-full p-2 text-muted hover:bg-muted/10 hover:text-foreground transition-colors"
          >
            <X size={22} />
          </button>
        </div>
        {/* 副标题国际化 */}
        <p className="text-center text-muted text-base mb-2">
          {t.loginSubtitle || '请输入您的手机号码以开始您的创意之旅'}
        </p>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/5 rounded-t-xl overflow-hidden">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-all ${mode === 'password' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('password')}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock size={16} />
              {t.tabPassword}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-all ${mode === 'phone' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('phone')}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone size={16} />
              {t.tabPhone}
            </div>
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {mode === 'password' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.accountLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.accountPlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-9 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.passwordLabel}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-9 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.phoneLabel}</label>
                  <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-[180px] text-base font-normal rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                      {countryCodeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                          {option.label}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t.phonePlaceholder}
                      className="w-[220px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        required
                        maxLength={15}
                      />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.codeLabel}</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder={t.codePlaceholder}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || !phone || sendingCode}
                      className="min-w-[100px] rounded-lg border border-border bg-surface px-3 py-3 text-sm font-medium text-foreground hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {sendingCode ? (
                        <Loader2 size={14} className="animate-spin mx-auto" />
                      ) : countdown > 0 ? (
                        `${countdown}s`
                      ) : (
                        t.sendCode
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreePolicy"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="agreePolicy" className="text-xs text-muted cursor-pointer">
                    使用未注册手机号登录即视为您已同意
                    <button
                      type="button"
                      onClick={showPrivacyPolicy}
                      className="text-primary hover:underline mx-1"
                    >
                      {t.privacyPolicy || '隐私政策'} & {t.terms || '服务条款'}
                    </button>
                    并自动创建账号
                  </label>
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'phone' ? '登录/注册' : t.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
