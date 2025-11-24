
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
   * Endpoint: /auth/logout
   */
  logout: () => {
    return request.post('/auth/logout', {});
  },

  /**
   * Send SMS Code
   * Endpoint: /resource/sms/code
   */
  sendSmsCode: (phonenumber: string, options?: { type?: number; checkUser?: boolean; countryCode?: string }) => {
    const { type = 1, checkUser = false, countryCode } = options || {};
    return request.get('/resource/sms/code', {
      params: {
        phonenumber,
        type,
        checkUser,
        ...(countryCode ? { countryCode } : {}),
      },
      isToken: false,
    });
  },

  /**
   * Phone Login (SMS Code)
   * Endpoint: /auth/login
   */
  phoneLogin: (data: { phonenumber: string; smsCode: string; countryCode?: string; tenantId?: string }) => {
    const loginData = {
      ...data,
      clientId: CLIENT_ID,
      grantType: 'sms',
      tenantId: data.tenantId || TENANT_ID,
    };
    console.log('phone login request data:', loginData);
    return request.post<LoginResponse>(
      '/auth/login',
      loginData,
      { isToken: false, encrypt: true }
    );
  },

  /**
   * Register
   * Endpoint: /auth/register
   */
  register: (data: {
    username: string;
    password: string;
    phoneNumber?: string;
    code?: string;
    tenantId?: string;
    userType?: string;
    registerSystem?: string;
    invitedCode?: string;
    countryCode?: string;
  }) => {
    const registerData = {
      ...data,
      clientId: CLIENT_ID,
      grantType: 'password',
      tenantId: data.tenantId || TENANT_ID,
      userType: data.userType || 'sys_user',
      registerSystem: data.registerSystem || '1',
    };
    console.log('register request data:', registerData);
    return request.post(
      '/auth/register',
      registerData,
      { isToken: false, encrypt: false }
    );
  },
};
