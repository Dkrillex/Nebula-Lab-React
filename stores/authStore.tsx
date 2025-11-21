import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { UserInfo, LoginResponse, UserInfoResp } from '../types';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (params: { username?: string; password?: string; code?: string; uuid?: string }) => Promise<void>;
  phoneLogin: (params: { phonenumber: string; smsCode: string; countryCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

// localStorage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
};

// Initialize user info from localStorage if available
const getInitialUserInfo = (): UserInfo | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (stored) {
      return JSON.parse(stored) as UserInfo;
    }
  } catch (error) {
    console.warn('Failed to parse user info from localStorage:', error);
  }
  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getInitialUserInfo(),
      token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  loading: false,
      isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),

  login: async (params) => {
    set({ loading: true });
    try {
      const loginData = await authService.login(params);
      console.log('Login response:', loginData);
      
      if (loginData?.access_token) {
        const { access_token, is_first_login, default_password } = loginData;
        localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
        set({ token: access_token, isAuthenticated: true });
        console.log('Token saved:', access_token.substring(0, 20) + '...');
        
        // Fetch user info immediately after login
        await get().fetchUserInfo();
        
        // Handle first login prompt if needed
        if (is_first_login && default_password) {
          console.warn('首次登录，默认密码:', default_password);
          // You can add a modal or notification here to prompt user to change password
        }
      } else {
        console.error('Login response structure:', loginData);
        throw new Error('登录响应格式错误，缺少 access_token');
      }
    } finally {
      set({ loading: false });
    }
  },

  phoneLogin: async (params) => {
    set({ loading: true });
    try {
      const loginData = await authService.phoneLogin({
        phonenumber: params.phonenumber,
        smsCode: params.smsCode,
        countryCode: params.countryCode,
      });
      console.log('Phone login response:', loginData);
      
      if (loginData?.access_token) {
        const { access_token } = loginData;
        localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
        set({ token: access_token, isAuthenticated: true });
        console.log('Token saved:', access_token.substring(0, 20) + '...');
        
        // Fetch user info immediately after login
        await get().fetchUserInfo();
      } else {
        console.error('Phone login response structure:', loginData);
        throw new Error('登录响应格式错误，缺少 access_token');
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchUserInfo: async () => {
    const token = get().token;
    if (!token) {
      console.warn('No token available, cannot fetch user info');
      return;
    }

    try {
      const userInfoResp = await authService.getInfo();
      console.log('GetInfo response:', userInfoResp);

      if (!userInfoResp || !userInfoResp.user) {
        throw new Error('获取用户信息失败：响应格式错误');
      }

      // Transform backend format to frontend format
      const { permissions = [], roles = [], user, team = [] } = userInfoResp;
      
      let avatar = user.avatar || '';
      // 如果是相对路径，添加 /api 前缀以利用代理
      if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
        // 移除开头的 / 以避免双重斜杠（虽然双重斜杠通常也能工作）
        const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
        avatar = `/api/${cleanPath}`;
      }
      
      const userInfo: UserInfo = {
        userId: user.userId,
        username: user.userName,
        realName: user.nickName,
        email: user.email || '',
        avatar: avatar,
        roles: roles,
        permissions: permissions,
        inviteCode: user.inviteCode,
        channelId: user.channelId,
        channelName: user.channelName,
        nebulaApiId: user.nebulaApiId,
        team: team,
      };

      // Save to store and localStorage
      get().setUserInfo(userInfo);
      
      console.log('User info saved:', {
        userId: userInfo.userId,
        username: userInfo.username,
        realName: userInfo.realName,
      });
    } catch (error) {
      console.error("Failed to fetch user info", error);
      // If token is invalid/expired, logout
      get().logout();
    }
  },

  setUserInfo: (userInfo: UserInfo | null) => {
    if (userInfo) {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    } else {
      // Clear from localStorage
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
    set({ user: userInfo });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    // Clear all auth data
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    set({ token: null, user: null, isAuthenticated: false });
    window.location.href = '/'; // Force redirect/reload to clear state completely
  },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
