
import { API_BASE_URL, API_TIMEOUT, CLIENT_ID } from '../constants';
import { ApiResponse } from '../types';
import { tansParams, errorCode, stringifyParams } from '../utils/ruoyi';
import { generateAesKey, encryptWithAes, encryptBase64, decryptBase64, decryptWithAes } from '../utils/crypto';
import { encrypt as rsaEncrypt, decrypt as rsaDecrypt } from '../utils/jsencrypt';
import { useAuthStore } from '../stores/authStore';

// 全局加密开关（可以通过环境变量配置，默认启用）
// 如果环境变量明确设置为 'false' 则禁用，否则启用
const ENABLE_ENCRYPT = import.meta.env.VITE_ENABLE_ENCRYPT !== 'false';

// 默认语言（可以从 localStorage 或 store 获取）
function getLanguage(): string {
  const lang = localStorage.getItem('language') || 'zh';
  // 转换为后端格式：zh -> zh_CN, en -> en_US
  return lang === 'zh' ? 'zh_CN' : 'en_US';
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

function getToken(): string | null {
  const store = useAuthStore.getState();
  return store.token || localStorage.getItem('token');
}

// 跳过认证的 API 列表
const SKIP_AUTH_APIS: string[] = [
  '/resource/sse/close',
  '/resource/sms',
  '/resource/email',
  '/auth',
  '/api/models/list',
  '/api/pricing/list',
  '/ads/labTemplate/list',
  '/tp/v1/ProductAvatarQuery',
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

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), requestTimeout);

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
        console.log('[Encrypt] Starting encryption');
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
      headers['Content-Type'] = isEncrypted 
        ? 'text/plain;charset=utf-8'  // Encrypted payload is sent as plain text
        : 'application/json;charset=utf-8';
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

    const config: RequestInit = {
      ...customConfig,
      body: requestBody,
      headers,
      signal: controller.signal,
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
      clearTimeout(id);

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
      const msg = errorCode[code] || resData.msg || errorCode['default'];

      // Business Logic Error Handling
      if (code === 200) {
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
        if (!isLogoutProcessing) {
          isLogoutProcessing = true;
          const userStore = useAuthStore.getState();
          // Use store logout if possible, or just clear storage and redirect
          if (userStore.logout) {
             await userStore.logout();
          } else {
             localStorage.removeItem('token');
             window.location.href = '/';
          }
          
          setTimeout(() => {
            isLogoutProcessing = false;
          }, 1000);
        }
        throw new ApiError('无效的会话，或者会话已过期，请重新登录。', 401);
      } 
      
      // Handle other error codes
      const errorMsg = msg || '未知错误';
      
      // Show error based on mode
      if (!_skipErrorDisplay) {
        if (errorMessageMode === 'modal') {
           alert(`错误: ${errorMsg}`); // Replace with Modal in React component context
        } else if (errorMessageMode === 'message') {
           console.error(`[API] ${errorMsg}`);
           // You can trigger a global toast/message event here
        }
      }

      throw new ApiError(errorMsg, code);

    } catch (error: any) {
      clearTimeout(id);
      
      if (error._skipErrorHint || _skipErrorDisplay) {
        throw error;
      }

      let message = error.message || '未知错误';
      if (message === 'Network Error') {
        message = '后端接口连接异常';
      } else if (message.includes('timeout')) {
        message = '系统接口请求超时';
      } else if (message.includes('Request failed with status code')) {
        message = '系统接口' + message.substr(message.length - 3) + '异常';
      } else if (error.name === 'AbortError') {
         message = '请求超时';
      }
      
      console.error('Request Error:', message);
      throw new ApiError(message, error.code || 0);
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
