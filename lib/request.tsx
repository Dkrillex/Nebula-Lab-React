
import { API_BASE_URL, API_TIMEOUT, CLIENT_ID } from '../constants';
import { ApiResponse } from '../types';
import { tansParams, errorCode, stringifyParams } from '../utils/ruoyi';
import { generateAesKey, encryptWithAes, encryptBase64, decryptBase64, decryptWithAes } from '../utils/crypto';
import { encrypt as rsaEncrypt, decrypt as rsaDecrypt } from '../utils/jsencrypt';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import React from 'react';
import { translations } from '../translations';

// 全局加密开关（可以通过环境变量配置，默认启用）
// 如果环境变量明确设置为 'false' 则禁用，否则启用
const ENABLE_ENCRYPT = import.meta.env.VITE_ENABLE_ENCRYPT !== 'false';

// 默认语言（可以从 localStorage 或 store 获取）
function getLanguage(): string {
  const lang = localStorage.getItem('language') || 'zh';
  // 转换为后端格式：zh -> zh_CN, en -> en_US, id -> id_ID
  if (lang === 'zh') return 'zh_CN';
  if (lang === 'id') return 'id_ID';
  return 'en_US';
}

/**
 * 获取当前语言的翻译对象
 */
function getCurrentTranslation() {
  const lang = localStorage.getItem('language') || 'zh';
  return translations[lang] || translations['zh'];
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  isToken?: boolean; // Default true
  encrypt?: boolean; // Default false (only encrypt when explicitly set)
  repeatSubmit?: boolean; // Default true (simulated)
  _skipAuth?: boolean; // Skip authentication check
  _skipErrorDisplay?: boolean; // Skip error display
  errorMessageMode?: 'modal' | 'message' | 'none'; // Error display mode
  successMessageMode?: 'modal' | 'message' | 'none'; // Success message mode
  isTransformResponse?: boolean; // Whether to transform response data
  isReturnNativeResponse?: boolean; // Whether to return native response
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text'; // Response type
}

/**
 * Custom Error class for API errors
 */
export class ApiError extends Error {
  public code: number;
  public data?: any;
  public _skipErrorHint?: boolean;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

// Flags for state management
let isLogoutProcessing = false;

/**
 * Show success message based on mode
 */
function showSuccessMessage(message: string, mode?: 'modal' | 'message' | 'none') {
  if (mode === 'none' || !mode) {
    return;
  }
  
  const translation = getCurrentTranslation();

  if (mode === 'modal') {
    // Use toast.custom to create a modal-like appearance
    toast.custom((toastInstance) => (
      <div
        className={`${toastInstance.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {translation.error.successTitle}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => toast.dismiss(toastInstance.id)}
              >
                <span className="sr-only">{translation.error.close}</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 3000,
    });
  } else {
    toast.success(message || translation.error.operationSuccess);
  }
}

/**
 * Show error message based on mode
 */
function showErrorMessage(message: string, mode?: 'modal' | 'message' | 'none') {
  if (mode === 'none') {
    return;
  }
  
  const translation = getCurrentTranslation();

  if (mode === 'modal') {
    // Use toast.custom to create a modal-like appearance
    toast.custom((toastInstance) => (
      <div
        className={`${toastInstance.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {translation.error.errorTitle}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => toast.dismiss(toastInstance.id)}
              >
                <span className="sr-only">{translation.error.close}</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  } else {
    // Default to 'message' mode
    toast.error(message);
  }
}

function getToken(): string | null {
  const store = useAuthStore.getState();
  return store.token || localStorage.getItem('token');
}

// 跳过认证的 API 列表
const SKIP_AUTH_APIS: string[] = [
  '/resource/sse/close',
  '/resource/sms',
  '/resource/email',
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/api/models/list',
  '/api/pricing/list',
  '/ads/labTemplate/list',
];

/**
 * Create a request client with specified options
 */
function createRequestClient(
  baseURL: string = API_BASE_URL,
  isTransformResponse: boolean = true,
  timeout: number = API_TIMEOUT,
) {
  /**
   * Internal fetch wrapper mimicking Ruoyi Axios Interceptors
   */
  async function http<T = any>(endpoint: string, options: RequestOptions = {}): Promise<any> {
    // Extract custom options first to avoid conflicts with RequestInit properties
    const encrypt = options.encrypt ?? false;
    const isToken = options.isToken ?? true;
    const requestTimeout = options.timeout ?? timeout;
    const params = options.params;
    const customHeaders = options.headers || {};
    const errorMessageMode = options.errorMessageMode ?? 'message';
    const successMessageMode = options.successMessageMode ?? 'none';
    const isTransform = options.isTransformResponse ?? isTransformResponse;
    const isReturnNativeResponse = options.isReturnNativeResponse ?? false;
    const responseType = options.responseType ?? 'json';
    const _skipAuth = options._skipAuth ?? false;
    const _skipErrorDisplay = options._skipErrorDisplay ?? false;

    // Extract other RequestInit properties (excluding custom options already extracted)
    const {
      params: _params,
      timeout: _timeout,
      isToken: _isToken,
      encrypt: _encrypt,
      headers: _headers,
      errorMessageMode: _errorMessageMode,
      successMessageMode: _successMessageMode,
      isTransformResponse: _isTransformResponse,
      isReturnNativeResponse: _isReturnNativeResponse,
      responseType: _responseType,
      _skipAuth: __skipAuth,
      _skipErrorDisplay: __skipErrorDisplay,
      ...customConfig
    } = options;

    // 使用外部提供的 signal 或创建新的 AbortController
    const externalSignal = (customConfig as any).signal;
    const controller = externalSignal ?
      { signal: externalSignal, abort: () => { } } as AbortController :
      new AbortController();
    const id = externalSignal ? null : setTimeout(() => controller.abort(), requestTimeout);

    // 1. URL & Params Handling (tansParams)
    let url = `${baseURL}${endpoint}`;
    if (params) {
      // For GET/DELETE requests, format params
      if (['GET', 'DELETE'].includes((customConfig.method || 'GET').toUpperCase())) {
        const queryString = stringifyParams(params, { arrayFormat: 'repeat' });
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      } else {
        // For other methods, manual stringify might be needed if not handled by body
        const queryString = tansParams(params);
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
          if (url.endsWith('&')) url = url.slice(0, -1);
        }
      }
    }

    // 2. Encrypt body if needed
    let requestBody = customConfig.body;
    let isEncrypted = false;
    let encryptKeyHeader: string | null = null;

    // Check if body is FormData
    const isFormData = requestBody instanceof FormData;

    if (ENABLE_ENCRYPT && encrypt && requestBody && !isFormData && ['POST', 'PUT'].includes((customConfig.method || '').toUpperCase())) {
      try {
        // Parse the JSON body if it's a string
        const bodyData = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;

        // Generate AES key
        const aesKey = generateAesKey();

        // Encrypt the entire body data as JSON string
        const encryptedData = encryptWithAes(JSON.stringify(bodyData), aesKey);

        // Encode AES key to base64
        const base64AesKey = encryptBase64(aesKey);

        // Encrypt AES key with RSA public key
        const rsaEncryptedKey = rsaEncrypt(base64AesKey);
        if (rsaEncryptedKey) {
          encryptKeyHeader = rsaEncryptedKey;
        } else {
          throw new Error('RSA加密AES密钥失败');
        }

        // Send encrypted data directly as base64 string (CryptoJS returns base64 by default)
        requestBody = encryptedData;
        isEncrypted = true;
      } catch (error) {
        console.warn('[Encrypt] Encryption failed, sending original body:', error);
        // If encryption fails, send original body
        isEncrypted = false;
        encryptKeyHeader = null;
      }
    }

    // 3. Headers Handling
    const headers: any = {
      // Add ClientID header (required by backend)
      'Clientid': CLIENT_ID,
      'Accept-Language': getLanguage(),
      'Content-Language': getLanguage(),
      ...customHeaders,
    };

    // Only set default Content-Type if not present and NOT FormData
    if (!headers['Content-Type'] && !isFormData) {
      headers['Content-Type'] = 'application/json;charset=utf-8';
    }

    // Add encrypt-key header if encryption is enabled
    if (isEncrypted && encryptKeyHeader) {
      headers['encrypt-key'] = encryptKeyHeader;
    }

    // Inject Token
    // Check if auth is needed
    const needsAuth = !_skipAuth && !SKIP_AUTH_APIS.some(api => url.includes(api));
    const token = getToken();

    if (needsAuth && token && isToken) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    // 优先使用外部传入的 signal
    const signal = (customConfig as any).signal || controller.signal;

    // 保存 signal 引用，用于在 catch 块中检查标记
    // 这样可以确保检查的是同一个对象
    const requestSignal = signal;

    const config: RequestInit = {
      ...customConfig,
      body: requestBody,
      headers,
      signal: requestSignal,
    };

    try {
      // Pre-request validation
      if (needsAuth && !token) {
        const noTokenError = new Error('用户未登录, 需要登录注册');
        (noTokenError as any).code = 'NO_TOKEN';
        (noTokenError as any)._skipErrorHint = true;
        throw noTokenError;
      }

      const response = await fetch(url, config);
      if (id) clearTimeout(id);

      // Handle non-200 HTTP status codes (Network/Server errors)
      if (!response.ok) {
        const msg = errorCode[response.status] || response.statusText || errorCode['default'];
        throw new ApiError(msg, response.status);
      }

      // Handle Binary Data (Blob)
      const contentType = response.headers.get('content-type');
      if (responseType === 'blob' || (contentType && (contentType.includes('blob') || contentType.includes('arraybuffer')))) {
        return await response.blob();
      }

      // Parse JSON Body
      let resData: any;
      try {
        const text = await response.text();
        resData = text ? JSON.parse(text) : {};
      } catch (e) {
        resData = {};
      }

      // Decrypt response if needed
      const encryptKey = response.headers.get('encrypt-key');
      if (encryptKey) {
        try {
          const base64Str = rsaDecrypt(encryptKey);
          if (base64Str) {
            const aesSecret = decryptBase64(base64Str.toString());
            const decryptData = decryptWithAes(resData, aesSecret);
            resData = JSON.parse(decryptData);
          }
        } catch (e) {
          console.error('Decryption failed', e);
        }
      }

      // Return native response if requested
      if (isReturnNativeResponse) {
        return {
          data: resData,
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
          config
        };
      }

      // Transform Response
      if (!isTransform) {
        return resData;
      }

      // Ruoyi Standard: { code, msg, data }
      const code = resData.code || 200;
      // 优先使用后端返回的 msg，如果没有则使用错误码映射，最后使用默认错误消息
      const msg = resData.msg || errorCode[code] || errorCode['default'];

      // Business Logic Error Handling
      if (code === 200 || code === '200') {
        // Success - Handle success message based on successMessageMode
        let successMsg = msg;

        // 如果后端返回了msg且不为空，使用后端的msg；否则使用默认成功消息
        if (!successMsg || successMsg.trim() === '') {
          const t = getCurrentTranslation();
          successMsg = t.error.operationSuccess;
        }

        // 根据successMessageMode显示成功消息
        // 注意：这里使用_skipErrorDisplay来控制是否显示，但实际上应该用单独的标志
        // 为了保持与旧系统一致，这里也使用_skipErrorDisplay
        if (!_skipErrorDisplay) {
          showSuccessMessage(successMsg, successMessageMode);
        }

        // Handle TopView style result structure
        if (resData.result !== undefined) {
          return resData.result;
        }
        // Success
        // Handle pagination format (rows, total) or data
        if (resData.data !== undefined) {
          return resData.data;
        }
        // If no data field but has rows/total (pagination)
        if (resData.rows !== undefined) {
          return { rows: resData.rows, total: resData.total };
        }
        // If no standard data fields, return everything except code/msg
        const { code: _, msg: __, ...others } = resData;
        return others;
      }

      // Error handling
      if (code === 401) {
        const t = getCurrentTranslation();
        const authErrorMsg = t.error.sessionExpired;
        
        // 防止多个请求同时触发登出流程和重复显示错误消息
        if (!isLogoutProcessing) {
          isLogoutProcessing = true;

          // 显示401错误消息（只显示一次）
          if (!_skipErrorDisplay) {
            showErrorMessage(authErrorMsg, errorMessageMode);
          }
          
          // 清除认证状态
          const userStore = useAuthStore.getState();
          
          // 清除 localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          
          // 重置 store 状态
          userStore.setUserInfo(null);
          
          // 延迟重定向，让用户看到错误提示
          setTimeout(() => {
            isLogoutProcessing = false;
            // 跳转到首页，会自动触发登录弹窗
            window.location.href = '/';
          }, 1500);
        }
        
        throw new ApiError(authErrorMsg, 401);
      }

      // Handle other error codes
      const t = getCurrentTranslation();
      const errorMsg = msg || t.error.unknownError;

      // Show error based on mode (统一使用showErrorMessage函数)
      if (!_skipErrorDisplay) {
        showErrorMessage(errorMsg, errorMessageMode);
      }

      throw new ApiError(errorMsg, code);

    } catch (error: any) {
      if (id) clearTimeout(id);

      // 如果是ApiError且已经处理过消息，直接抛出
      if (error instanceof ApiError) {
        throw error;
      }

      if (error._skipErrorHint || _skipErrorDisplay) {
        throw error;
      }

      let skipErrorHint = false;

      const t = getCurrentTranslation();
      let message = error.message || t.error.unknownError;
      if (message === 'Network Error') {
        message = t.error.networkError;
      } else if (message.includes('timeout')) {
        message = t.error.timeout;
      } else if (message.includes('Request failed with status code')) {
        message = t.error.requestFailed + ': ' + message.substr(message.length - 3);
      } else if (error.name === 'AbortError') {
        // 检查是否是主动取消（通过 signal 上的 _isManualCancel 标记）
        // 使用 requestSignal（在请求开始时保存的 signal 引用）进行检查
        // 这样可以确保检查的是同一个对象，标记应该在这个对象上
        const signalsToCheck = [
          requestSignal,            // 请求开始时保存的 signal 引用（最优先）
          externalSignal,           // 外部传入的原始 signal
          (config as any)?.signal,  // 实际传递给 fetch 的 signal
          signal,                   // signal 变量
          controller.signal          // 内部 controller 的 signal
        ].filter(Boolean); // 过滤掉 null/undefined

        let isManualCancel = false;
        let checkedSignal: AbortSignal | null = null;

        // 检查所有可能的 signal，只要有一个有标记就认为是主动取消
        // 优先使用 WeakMap 检查，然后检查对象属性（兼容旧方式）
        for (const sig of signalsToCheck) {
          if (sig) {
            // 先检查 WeakMap
            if (manualCancelSignals.get(sig) === true) {
              isManualCancel = true;
              checkedSignal = sig;
              break;
            }
            // 兼容旧方式：检查对象属性
            if ((sig as any)._isManualCancel === true) {
              isManualCancel = true;
              checkedSignal = sig;
              break;
            }
          }
        }

        if (isManualCancel) {
          // 主动取消：设置错误消息，并标记跳过错误提示，让调用方决定是否显示
          message = '请求已取消';
          skipErrorHint = true;
        } else {
          // 超时：显示请求超时错误
          message = '请求超时';
        }
        message = t.error.timeout;
      }

      // 对于网络错误等，也根据errorMessageMode显示
      // 如果是主动取消，根据 skipErrorHint 决定是否显示
      if (!_skipErrorDisplay && !skipErrorHint) {
        showErrorMessage(message, errorMessageMode);
      }

      console.error('Request Error:', message);
      const apiError = new ApiError(message, error.code || 0);
      if (skipErrorHint) {
        apiError._skipErrorHint = true;
      }
      throw apiError;
    }
  }

  return {
    get: <T = any>(url: string, options?: RequestOptions) =>
      http<T>(url, { ...options, method: 'GET' }),

    post: <T = any>(url: string, body: any, options?: RequestOptions) => {
      const isFormData = body instanceof FormData;
      return http<T>(url, {
        ...options,
        method: 'POST',
        body: isFormData ? body : JSON.stringify(body)
      });
    },

    put: <T = any>(url: string, body: any, options?: RequestOptions) => {
      const isFormData = body instanceof FormData;
      return http<T>(url, {
        ...options,
        method: 'PUT',
        body: isFormData ? body : JSON.stringify(body)
      });
    },

    delete: <T = any>(url: string, options?: RequestOptions) =>
      http<T>(url, { ...options, method: 'DELETE' }),

    upload: <T = any>(url: string, file: File, options?: RequestOptions) => {
      const formData = new FormData();
      formData.append('file', file);
      const { headers, ...rest } = options || {};
      const newHeaders = { ...headers } as any;
      delete newHeaders['Content-Type'];

      return http<T>(url, {
        ...rest,
        method: 'POST',
        body: formData,
        headers: newHeaders
      });
    },

    // Direct http access
    request: http
  };
}


// Export different client instances
export const requestClient = createRequestClient(API_BASE_URL);
export const ygRequestClient = createRequestClient(API_BASE_URL, false); // No transform
export const DownloadRequestClient = createRequestClient(API_BASE_URL, true, 120000); // Long timeout
export const baseRequestClient = createRequestClient(API_BASE_URL, false);

// Default export for backward compatibility
export const request = requestClient;
