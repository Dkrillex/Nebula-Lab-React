import React, { useState, useEffect } from 'react';
import { X, Smartphone, Lock, Mail, KeyRound, Loader2, UserPlus, Globe } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { TENANT_ID } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  t: {
    loginTitle: string;
    registerTitle?: string;
    tabPassword: string;
    tabPhone: string;
    tabRegister?: string;
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
    signUp?: string;
    usernameLabel?: string;
    usernamePlaceholder?: string;
    agreePolicy?: string;
    privacyPolicy?: string;
    terms?: string;
  };
}

// 国家代码选项（参考参考项目）
const COUNTRY_CODES = [
  { value: '+86', label: '+86 中国' },
  { value: '+81', label: '+81 日本' },
  { value: '+62', label: '+62 印度尼西亚' },
  { value: '+852', label: '+852 香港' },
  { value: '+853', label: '+853 澳门' },
  { value: '+886', label: '+886 台湾' },
  { value: '+1', label: '+1 美国' },
  { value: '+44', label: '+44 英国' },
  { value: '+33', label: '+33 法国' },
  { value: '+49', label: '+49 德国' },
  { value: '+82', label: '+82 韩国' },
  { value: '+65', label: '+65 新加坡' },
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, t }) => {
  const { login, phoneLogin, loading } = useAuthStore();
  const [mode, setMode] = useState<'password' | 'phone' | 'register'>('password');
  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countryCode, setCountryCode] = useState('+86');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerCode, setRegisterCode] = useState('');
  const [registerCountryCode, setRegisterCountryCode] = useState('+86');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setMode('password');
      setErrorMsg('');
      setSuccessMsg('');
      setCountdown(0);
      setAgreePolicy(false);
      // Reset form fields
      setUsername('');
      setPassword('');
      setPhone('');
      setCode('');
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterPhone('');
      setRegisterCode('');
    }
  }, [isOpen]);

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
  const handleSendCode = async (isRegister: boolean = false) => {
    const phoneNumber = isRegister ? registerPhone : phone;
    const currentCountryCode = isRegister ? registerCountryCode : countryCode;

    if (!phoneNumber) {
      setErrorMsg('请输入手机号');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setErrorMsg('手机号格式不正确（6-15位数字）');
      return;
    }

    try {
      setSendingCode(true);
      setErrorMsg('');
      
      // 根据国家代码确定类型：+86为国内(1)，其他为国际(2)
      const smsType = currentCountryCode === '+86' ? 1 : 2;
      
      await authService.sendSmsCode(phoneNumber, {
        type: smsType,
        checkUser: false, // 登录即注册，不检查用户是否存在
        countryCode: currentCountryCode,
      });

      setSuccessMsg('验证码发送成功');
      setCountdown(60);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('发送验证码失败:', err);
      const errorMessage = err?.response?.data?.msg || err?.message || '验证码发送失败，请稍后重试';
      
      // 处理限流错误
      if (errorMessage.includes('频繁') || errorMessage.includes('frequently')) {
        setErrorMsg('访问过于频繁，请稍后再试');
      } else {
        setErrorMsg(errorMessage);
      }
    } finally {
      setSendingCode(false);
    }
  };

  // 手机号登录
  const handlePhoneLogin = async () => {
    if (!phone) {
      setErrorMsg('请输入手机号');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('手机号格式不正确（6-15位数字）');
      return;
    }

    if (!code || code.length !== 4) {
      setErrorMsg('请输入4位验证码');
      return;
    }

    if (!agreePolicy && mode === 'phone') {
      setErrorMsg('请先同意隐私政策和服务条款');
      return;
    }

    try {
      setErrorMsg('');
      await phoneLogin({
        phonenumber: phone,
        smsCode: code,
        countryCode: countryCode,
      });
      
      if (onLoginSuccess) onLoginSuccess();
      handleClose();
    } catch (err: any) {
      console.error('手机号登录失败:', err);
      setErrorMsg(err?.response?.data?.msg || err?.message || '登录失败，请检查验证码是否正确');
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!registerUsername || registerUsername.length < 2) {
      setErrorMsg('用户名至少需要2个字符');
      return;
    }

    if (registerUsername.length > 20) {
      setErrorMsg('用户名不能超过20个字符');
      return;
    }

    if (!registerPassword || registerPassword.length < 6) {
      setErrorMsg('密码至少需要6个字符');
      return;
    }

    if (!registerPhone) {
      setErrorMsg('请输入手机号');
      return;
    }

    if (!validatePhone(registerPhone)) {
      setErrorMsg('手机号格式不正确（6-15位数字）');
      return;
    }

    if (!registerCode || registerCode.length !== 4) {
      setErrorMsg('请输入4位验证码');
      return;
    }

    if (!agreePolicy) {
      setErrorMsg('请先同意隐私政策和服务条款');
      return;
    }

    try {
      setErrorMsg('');
      await authService.register({
        username: registerUsername,
        password: registerPassword,
        phoneNumber: registerPhone,
        code: registerCode,
        tenantId: TENANT_ID,
        countryCode: registerCountryCode,
      });

      setSuccessMsg('注册成功！请使用手机号登录');
      setTimeout(() => {
        setMode('phone');
        setPhone(registerPhone);
        setCode('');
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      console.error('注册失败:', err);
      setErrorMsg(err?.response?.data?.msg || err?.message || '注册失败，请重试');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'password') {
        await login({ username, password });
        if (onLoginSuccess) onLoginSuccess();
        handleClose();
      } else if (mode === 'phone') {
        await handlePhoneLogin();
      } else if (mode === 'register') {
        await handleRegister();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.msg || err?.message || '操作失败，请重试');
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
    
    alert(content);
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
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'register' ? (t.registerTitle || '注册') : t.loginTitle} 👋🏻
          </h2>
          <button 
            onClick={handleClose}
            className="rounded-full p-1 text-muted hover:bg-muted/10 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'password' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('password')}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock size={16} />
              {t.tabPassword}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'phone' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('phone')}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone size={16} />
              {t.tabPhone}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'register' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('register')}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus size={16} />
              {t.tabRegister || '注册'}
            </div>
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {errorMsg && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs">
                {successMsg}
              </div>
            )}

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
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
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
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : mode === 'phone' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.phoneLabel}</label>
                  <div className="flex gap-2">
                    <div className="relative w-32 flex-shrink-0">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      >
                        {COUNTRY_CODES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t.phonePlaceholder}
                        className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        required
                        maxLength={15}
                      />
                    </div>
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
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendCode(false)}
                      disabled={countdown > 0 || !phone || sendingCode}
                      className="min-w-[100px] rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    {t.agreePolicy || '我已阅读并同意'}
                    <button
                      type="button"
                      onClick={showPrivacyPolicy}
                      className="text-primary hover:underline ml-1"
                    >
                      {t.privacyPolicy || '隐私政策'} & {t.terms || '服务条款'}
                    </button>
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.usernameLabel || '用户名'}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="text" 
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder={t.usernamePlaceholder || '请输入用户名（2-20个字符）'}
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                      minLength={2}
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.passwordLabel}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="password" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.phoneLabel}</label>
                  <div className="flex gap-2">
                    <div className="relative w-32 flex-shrink-0">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <select
                        value={registerCountryCode}
                        onChange={(e) => setRegisterCountryCode(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      >
                        {COUNTRY_CODES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input 
                        type="tel" 
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t.phonePlaceholder}
                        className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        required
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.codeLabel}</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={registerCode}
                      onChange={(e) => setRegisterCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder={t.codePlaceholder}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendCode(true)}
                      disabled={countdown > 0 || !registerPhone || sendingCode}
                      className="min-w-[100px] rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    id="agreePolicyRegister"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="agreePolicyRegister" className="text-xs text-muted cursor-pointer">
                    {t.agreePolicy || '我已阅读并同意'}
                    <button
                      type="button"
                      onClick={showPrivacyPolicy}
                      className="text-primary hover:underline ml-1"
                    >
                      {t.privacyPolicy || '隐私政策'} & {t.terms || '服务条款'}
                    </button>
                  </label>
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'register' ? (t.signUp || '注册') : t.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
