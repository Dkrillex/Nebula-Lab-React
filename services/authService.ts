
import { request } from '../lib/request';
import { LoginResponse, UserInfo } from '../types';

export const authService = {
  /**
   * Login (Standard Ruoyi)
   * Endpoint: /login
   */
  login: (data: { username?: string; password?: string; code?: string; uuid?: string }) => {
    // Ruoyi typically takes username/password/code/uuid
    return request.post<LoginResponse>('/login', data, { isToken: false });
  },

  /**
   * Get User Info (Standard Ruoyi)
   * Endpoint: /getInfo
   */
  getInfo: () => {
    return request.get<UserInfo>('/getInfo');
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
