
import { request } from '../lib/request';
import { LoginResponse, UserInfo } from '../types';
import { generateAesKey, encryptWithAes, encryptBase64 } from '../utils/crypto';

export const authService = {
  /**
   * Login (Standard Ruoyi)
   * Endpoint: /login
   */
  login: (data: { username?: string; password?: string; code?: string; uuid?: string }) => {
    // Note: If your backend requires encryption, you would typically:
    // 1. Generate AES Key
    // const aesKey = generateAesKey();
    // 2. Encrypt Password
    // const encryptedPassword = encryptWithAes(data.password || '', aesKey);
    // 3. Send encrypted password and key (often key is RSA encrypted)
    // For now, we proceed with standard submission.
    
    return request.post<LoginResponse>('/auth/login', data, { isToken: false });
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
