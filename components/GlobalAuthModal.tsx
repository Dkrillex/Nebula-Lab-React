import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import { getAuthModalManager } from '../lib/authModalManager';
import { useAuthStore } from '../stores/authStore';

/**
 * 全局 AuthModal 组件
 * 连接到全局管理器，自动处理显示/隐藏和翻译
 */
const GlobalAuthModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const manager = getAuthModalManager();
  const { fetchUserInfo } = useAuthStore();

  // 订阅管理器状态变化
  useEffect(() => {
    const unsubscribe = manager.subscribe((open) => {
      setIsOpen(open);
    });

    return () => {
      unsubscribe();
    };
  }, [manager]);

  // 处理关闭
  const handleClose = () => {
    manager.hideAuthModal();
  };

  // 处理登录成功
  const handleLoginSuccess = () => {
    // 获取用户信息
    fetchUserInfo();
    // 触发所有登录成功回调
    manager.triggerLoginSuccess();
    // 关闭弹窗
    manager.hideAuthModal();
  };

  // 获取语言和翻译
  const lang = manager.getLang();
  const translations = manager.getTranslations();
  const t = translations.auth || {};

  // 如果翻译对象不完整，提供默认值
  const safeT = {
    loginTitle: t.loginTitle || '欢迎回来',
    tabPassword: t.tabPassword || '账号密码',
    tabPhone: t.tabPhone || '手机验证码',
    accountLabel: t.accountLabel || '账号',
    accountPlaceholder: t.accountPlaceholder || '请输入账号',
    passwordLabel: t.passwordLabel || '密码',
    passwordPlaceholder: t.passwordPlaceholder || '请输入密码',
    phoneLabel: t.phoneLabel || '手机号',
    phonePlaceholder: t.phonePlaceholder || '请输入手机号',
    codeLabel: t.codeLabel || '验证码',
    codePlaceholder: t.codePlaceholder || '请输入验证码',
    sendCode: t.sendCode || '发送验证码',
    codeSent: t.codeSent || '验证码已发送',
    signIn: t.signIn || '登录',
    agreePolicy: t.agreePolicy,
    privacyPolicy: t.privacyPolicy || '隐私政策',
    terms: t.terms || '服务条款',
    loginSubtitle: t.loginSubtitle,
    countries: t.countries,
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      onLoginSuccess={handleLoginSuccess}
      lang={lang}
      t={safeT}
    />
  );
};

export default GlobalAuthModal;

