import { translations } from '../translations';
import { getStorageKey } from '../utils/storageNamespace';

/**
 * 登录成功回调函数类型
 */
type LoginSuccessCallback = () => void;

/**
 * 全局 AuthModal 管理器
 * 使用单例模式管理登录弹窗的显示状态
 */
class AuthModalManager {
  private isOpen: boolean = false;
  private listeners: Set<(isOpen: boolean) => void> = new Set();
  private loginSuccessCallbacks: Set<LoginSuccessCallback> = new Set();

  /**
   * 获取当前语言
   */
  private getLanguage(): string {
    return localStorage.getItem(getStorageKey('language')) || 'zh';
  }

  /**
   * 获取当前语言的翻译对象
   */
  getTranslations() {
    const lang = this.getLanguage();
    return translations[lang] || translations['zh'];
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (isOpen: boolean) => void) {
    this.listeners.add(listener);
    // 立即通知当前状态
    listener(this.isOpen);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有订阅者状态变化
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.isOpen));
  }

  /**
   * 显示登录弹窗
   * @param onLoginSuccess 登录成功后的回调函数（可选）
   */
  showAuthModal(onLoginSuccess?: LoginSuccessCallback) {
    if (onLoginSuccess) {
      this.loginSuccessCallbacks.add(onLoginSuccess);
    }
    
    if (!this.isOpen) {
      this.isOpen = true;
      this.notify();
    }
  }

  /**
   * 隐藏登录弹窗
   */
  hideAuthModal() {
    if (this.isOpen) {
      this.isOpen = false;
      this.notify();
    }
  }

  /**
   * 获取当前显示状态
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * 触发登录成功回调
   */
  triggerLoginSuccess() {
    this.loginSuccessCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Login success callback error:', error);
      }
    });
    // 清空回调列表
    this.loginSuccessCallbacks.clear();
  }

  /**
   * 获取当前语言
   */
  getLang(): string {
    return this.getLanguage();
  }
}

// 创建单例实例
const authModalManager = new AuthModalManager();

/**
 * 显示登录弹窗
 * @param onLoginSuccess 登录成功后的回调函数（可选）
 */
export const showAuthModal = (onLoginSuccess?: LoginSuccessCallback) => {
  authModalManager.showAuthModal(onLoginSuccess);
};

/**
 * 隐藏登录弹窗
 */
export const hideAuthModal = () => {
  authModalManager.hideAuthModal();
};

/**
 * 获取管理器实例（供组件内部使用）
 */
export const getAuthModalManager = () => authModalManager;

