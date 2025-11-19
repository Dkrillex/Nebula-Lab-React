
import { request } from '../lib/request';
import { LoginResponse, UserInfoResp } from '../types';
import { CLIENT_ID, GRANT_TYPE, TENANT_ID } from '../constants';

export const authService = {
  /**
   * Login (Standard Ruoyi)
   * Endpoint: /login
   */
  login: (data: { username?: string; password?: string; code?: string; uuid?: string }) => {
    const loginData = {
      ...data,
      clientId: CLIENT_ID,
      grantType: GRANT_TYPE,
      tenantId: TENANT_ID,
    };
    console.log('login request data:', loginData);
    return request.post<LoginResponse>(
      '/auth/login',
      loginData,
      { isToken: false, encrypt: true }
    );
  },

  /**
   * Get User Info (Standard Ruoyi)
   * Endpoint: /getInfo
   */
  getInfo: () => {
    return request.get<UserInfoResp>('/system/user/getInfo');
  },

  /**
   * Logout
   * Endpoint: /logout
   */
  logout: () => {
    return request.post('/logout', {});
  },

  /**
   * (Custom) Send SMS Code - Not standard Ruoyi, keeping for UI compatibility
   */
  sendSmsCode: (phone: string) => {
    return request.get('/captcha/sms', { params: { phone } });
  }
};
