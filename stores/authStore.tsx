import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { UserInfo, LoginResponse, UserInfoResp } from '../types';
import toast from 'react-hot-toast';

interface FirstLoginInfo {
  isFirstLogin: boolean;
  defaultPassword: string;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  firstLoginInfo: FirstLoginInfo | null; // 首次登录信息，用于全局显示提示
  login: (params: { username?: string; password?: string; code?: string; uuid?: string; channelId?: string; teamId?: string; inviteCode?: string }) => Promise<FirstLoginInfo | null>;
  phoneLogin: (params: { phonenumber: string; smsCode: string; countryCode?: string; channelId?: string; teamId?: string; inviteCode?: string }) => Promise<FirstLoginInfo | null>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<UserInfo | null>;
  setUserInfo: (userInfo: UserInfo | null) => void;
  clearFirstLoginInfo: () => void; // 清除首次登录信息
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
      firstLoginInfo: null,

  login: async (params) => {
    set({ loading: true });
    try {
      // 步骤1: 登录
      const loginData = await authService.login(params);
      console.log('Login response:', loginData);
      
      if (loginData?.access_token) {
        const { access_token, is_first_login, default_password } = loginData;
        localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
        set({ token: access_token, isAuthenticated: true });
        console.log('Token saved:', access_token.substring(0, 20) + '...');
        
        // 步骤2: 处理邀请（如果 URL 中有邀请参数）
        // 注意：inviteCode 在注册时已经处理，这里只处理 channelId 和 teamId
        // 无论新用户还是老用户，都调用 handleInviteJoin 处理邀请
        // 后端接口应该是幂等的，重复调用不会出错
        // 即使后端在注册时已经处理了邀请，再次调用也不会影响结果
        const urlParams = new URLSearchParams(window.location.search);
        const channelId = urlParams.get('channelId');
        const teamId = urlParams.get('teamId');
        const inviteCode = urlParams.get('inviteCode');
        
        if (channelId || teamId) {
          console.log('检测到邀请参数，调用 handleInviteJoin，channelId:', channelId, 'teamId:', teamId);
          try {
            await authService.handleInviteJoin(channelId || '', teamId || '');
            console.log('邀请处理完成');
            
            // 显示成功提示
            if (channelId && teamId) {
              toast.success('加入企业和团队成功', {
                duration: 3000,
              });
            } else if (channelId) {
              toast.success('加入企业成功', {
                duration: 3000,
              });
            } else if (teamId) {
              toast.success('加入团队成功', {
                duration: 3000,
              });
            }
          } catch (error) {
            console.error('处理邀请参数失败:', error);
            // 即使邀请处理失败，也继续获取用户信息
          }
        }
        
        // 清除 URL 中的邀请参数（无论新用户还是老用户）
        if (channelId || teamId) {
          urlParams.delete('channelId');
          urlParams.delete('teamId');
          const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', newUrl);
          console.log('已清除 URL 中的邀请参数');
        }
        
        // 清除 inviteCode 参数（如果存在）
        if (inviteCode) {
          urlParams.delete('inviteCode');
          const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', newUrl);
          console.log('已清除 URL 中的 inviteCode 参数');
        }
        
        // 步骤3: 获取用户信息
        const userInfo = await get().fetchUserInfo();
        
        // Store and return first login info if applicable
        if (is_first_login && default_password) {
          console.log('首次登录，默认密码:', default_password);
          const firstLoginInfo = {
            isFirstLogin: true,
            defaultPassword: default_password,
          };
          set({ firstLoginInfo });
          // 首次登录不显示"欢迎回来"，而是显示首次登录提示对话框
          return firstLoginInfo;
        }
        
        // 非首次登录才显示"欢迎回来"
        if (userInfo?.realName) {
          toast.success(`登录成功，欢迎回来：${userInfo.realName}`, {
            duration: 3000,
          });
        } else {
          toast.success('登录成功', {
            duration: 3000,
          });
        }
        
        return null;
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
      // 步骤1: 登录
      const loginData = await authService.phoneLogin({
        phonenumber: params.phonenumber,
        smsCode: params.smsCode,
        countryCode: params.countryCode,
        channelId: params.channelId,
        teamId: params.teamId,
        inviteCode: params.inviteCode,
      });
      console.log('Phone login response:', loginData);
      
      if (loginData?.access_token) {
        const { access_token, is_first_login, default_password } = loginData;
        localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
        set({ token: access_token, isAuthenticated: true });
        console.log('Token saved:', access_token.substring(0, 20) + '...');
        
        // 步骤2: 处理邀请（如果 URL 中有邀请参数）
        // 注意：inviteCode 在注册时已经处理，这里只处理 channelId 和 teamId
        // 无论新用户还是老用户，都调用 handleInviteJoin 处理邀请
        // 后端接口应该是幂等的，重复调用不会出错
        // 即使后端在注册时已经处理了邀请，再次调用也不会影响结果
        const urlParams = new URLSearchParams(window.location.search);
        const channelId = urlParams.get('channelId');
        const teamId = urlParams.get('teamId');
        const inviteCode = urlParams.get('inviteCode');
        
        if (channelId || teamId) {
          console.log('检测到邀请参数，调用 handleInviteJoin，channelId:', channelId, 'teamId:', teamId);
          try {
            await authService.handleInviteJoin(channelId || '', teamId || '');
            console.log('邀请处理完成');
            
            // 显示成功提示
            if (channelId && teamId) {
              toast.success('加入企业和团队成功', {
                duration: 3000,
              });
            } else if (channelId) {
              toast.success('加入企业成功', {
                duration: 3000,
              });
            } else if (teamId) {
              toast.success('加入团队成功', {
                duration: 3000,
              });
            }
          } catch (error) {
            console.error('处理邀请参数失败:', error);
            // 即使邀请处理失败，也继续获取用户信息
          }
        }
        
        // 清除 URL 中的邀请参数（无论新用户还是老用户）
        if (channelId || teamId) {
          urlParams.delete('channelId');
          urlParams.delete('teamId');
          const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', newUrl);
          console.log('已清除 URL 中的邀请参数');
        }
        
        // 清除 inviteCode 参数（如果存在）
        if (inviteCode) {
          urlParams.delete('inviteCode');
          const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', newUrl);
          console.log('已清除 URL 中的 inviteCode 参数');
        }
        
        // 步骤3: 获取用户信息
        const userInfo = await get().fetchUserInfo();
        
        // Store and return first login info if applicable
        if (is_first_login && default_password) {
          console.log('首次登录，默认密码:', default_password);
          const firstLoginInfo = {
            isFirstLogin: true,
            defaultPassword: default_password,
          };
          set({ firstLoginInfo });
          // 首次登录不显示"欢迎回来"，而是显示首次登录提示对话框
          return firstLoginInfo;
        }
        
        // 非首次登录才显示"欢迎回来"
        if (userInfo?.realName) {
          toast.success(`登录成功，欢迎回来：${userInfo.realName}`, {
            duration: 3000,
          });
        } else {
          toast.success('登录成功', {
            duration: 3000,
          });
        }
        
        return null;
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
      return null;
    }

    try {
      // 在获取用户信息之前，检查URL参数中是否有邀请参数
      // 注意：如果登录请求中已经传递了 channelId 和 teamId，URL 参数应该已经被清除
      // 这里只处理老用户通过邀请链接访问的情况（已登录用户）
      const urlParams = new URLSearchParams(window.location.search);
      const channelId = urlParams.get('channelId');
      const teamId = urlParams.get('teamId');
      const inviteCode = urlParams.get('inviteCode');

      // 如果存在邀请参数，先处理邀请逻辑（老用户通过邀请链接加入）
      // 这种情况是：用户已经登录，然后访问邀请链接
      // 注意：inviteCode 只在注册时有效，已登录用户访问 inviteCode 链接不需要处理
      if (channelId || teamId) {
        console.log('检测到邀请参数（老用户已登录场景），channelId:', channelId, 'teamId:', teamId);
        try {
          await authService.handleInviteJoin(channelId || '', teamId || '');
          console.log('邀请处理完成');

          // 显示成功提示
          if (channelId && teamId) {
            toast.success('加入企业和团队成功', {
              duration: 3000,
            });
          } else if (channelId) {
            toast.success('加入企业成功', {
              duration: 3000,
            });
          } else if (teamId) {
            toast.success('加入团队成功', {
              duration: 3000,
            });
          }

          // 清除URL中的邀请参数，避免重复处理
          urlParams.delete('channelId');
          urlParams.delete('teamId');
          const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', newUrl);
        } catch (error) {
          console.error('处理邀请参数失败:', error);
          // 即使邀请处理失败，也继续获取用户信息
        }
      }
      
      // 清除 inviteCode 参数（如果存在，已登录用户不需要处理 inviteCode）
      if (inviteCode) {
        urlParams.delete('inviteCode');
        const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
        console.log('已清除 URL 中的 inviteCode 参数（已登录用户）');
      }

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
      
      return userInfo;
    } catch (error) {
      console.error("Failed to fetch user info", error);
      // If token is invalid/expired, logout
      get().logout();
      return null;
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
    set({ token: null, user: null, isAuthenticated: false, firstLoginInfo: null });
    window.location.href = '/'; // Force redirect/reload to clear state completely
  },

  clearFirstLoginInfo: () => {
    set({ firstLoginInfo: null });
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
