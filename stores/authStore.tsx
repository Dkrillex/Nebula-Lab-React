import { create } from 'zustand';
import { authService } from '../services/authService';
import { UserInfo } from '../types';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (params: { username?: string; password?: string; code?: string; uuid?: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (params) => {
    set({ loading: true });
    try {
      const res = await authService.login(params);
      // Ruoyi returns code 200 and token in the root or data
      if (res.code === 200 && res.token) {
        const newToken = res.token;
        localStorage.setItem('token', newToken);
        set({ token: newToken, isAuthenticated: true });
        // Fetch user info immediately after login
        await get().fetchUserInfo();
      } else {
        throw new Error(res.msg || 'Login failed');
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchUserInfo: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const res = await authService.getInfo();
      if (res.code === 200) {
        // The Ruoyi /getInfo response structure usually has { user, roles, permissions }
        set({ user: res as unknown as UserInfo });
      } else {
        throw new Error('Failed to fetch user info');
      }
    } catch (error) {
      console.error("Failed to fetch user info", error);
      // If token is invalid/expired, logout
      get().logout();
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
    window.location.href = '/'; // Force redirect/reload to clear state completely
  },
}));
