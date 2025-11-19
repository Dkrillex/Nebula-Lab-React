
import { API_BASE_URL, API_TIMEOUT, CLIENT_ID } from '../constants';
import { ApiResponse } from '../types';
import { tansParams, errorCode } from '../utils/ruoyi';
import { generateAesKey, encryptWithAes, encryptBase64 } from '../utils/crypto';
import { encrypt as rsaEncrypt } from '../utils/jsencrypt';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  isToken?: boolean; // Default true
  encrypt?: boolean; // Default true
  repeatSubmit?: boolean; // Default true (simulated)
}

/**
 * Custom Error class for API errors
 */
export class ApiError extends Error {
  public code: number;
  public data?: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

// Flags for state management
let isReloginShow = false;

function getToken() {
  return localStorage.getItem('token'); // Matches Ruoyi's typical storage key
}

/**
 * Internal fetch wrapper mimicking Ruoyi Axios Interceptors
 */
async function http<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  // Extract custom options first to avoid conflicts with RequestInit properties
  const encrypt = options.encrypt ?? false;
  const isToken = options.isToken ?? true;
  const timeout = options.timeout ?? API_TIMEOUT;
  const params = options.params;
  const customHeaders = options.headers || {};
  
  // Extract other RequestInit properties (excluding custom options already extracted)
  const { 
    params: _params,
    timeout: _timeout,
    isToken: _isToken,
    encrypt: _encrypt,
    headers: _headers,
    ...customConfig 
  } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // 1. URL & Params Handling (tansParams)
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    let queryString = tansParams(params);
    if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
        // Trim trailing &
        if (url.endsWith('&')) url = url.slice(0, -1);
    }
  }

  // 2. Encrypt body if needed
  let requestBody = customConfig.body;
  let isEncrypted = false;
  let encryptKeyHeader: string | null = null;
  
  // Check if body is FormData
  const isFormData = requestBody instanceof FormData;

  if (encrypt && requestBody && typeof requestBody === 'string') {
    try {
      console.log('[Encrypt] Starting encryption, original body:', requestBody);
      // Parse the JSON body
      const bodyData = JSON.parse(requestBody);
      
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
      console.log('[Encrypt] Encryption successful, encrypted body:', typeof encryptedData === 'string' ? encryptedData.substring(0, 100) + '...' : encryptedData);
    } catch (error) {
      console.warn('[Encrypt] Encryption failed, sending original body:', error);
      // If encryption fails, send original body
      isEncrypted = false;
      encryptKeyHeader = null;
    }
  } else {
    console.log('[Encrypt] Encryption skipped:', { encrypt, hasBody: !!requestBody, bodyType: typeof requestBody });
  }

  // 3. Headers Handling
  const headers: any = {
    // Add ClientID header (required by backend)
    'Clientid': CLIENT_ID,
    ...customHeaders,
  };

  // Only set default Content-Type if not present and NOT FormData
  // FormData needs browser to set boundary automatically
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
  if (getToken() && isToken) {
    headers['Authorization'] = 'Bearer ' + getToken();
  }

  const config: RequestInit = {
    ...customConfig,
    body: requestBody,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(id);

    // Handle non-200 HTTP status codes (Network/Server errors)
    if (!response.ok) {
      const msg = errorCode[response.status] || response.statusText || errorCode['default'];
      throw new ApiError(msg, response.status);
    }

    // Handle Binary Data (Blob)
    const contentType = response.headers.get('content-type');
    if (contentType && (contentType.includes('blob') || contentType.includes('arraybuffer'))) {
       // If return type is expected to be blob, we might need to change logic, 
       // but for now we parse everything as JSON unless specific endpoint logic exists.
       // Ruoyi request.js returns res.data directly for blobs.
    }

    // Parse JSON Body
    const resData = await response.json();
    
    // Ruoyi Standard: { code, msg, data }
    const code = resData.code || 200;
    const msg = errorCode[code] || resData.msg || errorCode['default'];

    // 3. Business Logic Error Handling
    if (code === 401) {
      if (!isReloginShow) {
        isReloginShow = true;
        // Use native confirm instead of ElementUI MessageBox
        if (window.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录。点击确定重新登录。')) {
           isReloginShow = false;
           localStorage.removeItem('token');
           window.location.href = '/'; // Or trigger a global event
        } else {
           isReloginShow = false;
        }
      }
      throw new ApiError('无效的会话，或者会话已过期，请重新登录。', 401);
    } 
    else if (code === 500) {
      console.error(`[API Error] ${msg}`);
      throw new ApiError(msg, 500);
    } 
    else if (code === 601) {
      console.warn(`[API Warning] ${msg}`);
      throw new ApiError(msg, 601);
    } 
    else if (code !== 200) {
      console.error(`[API Notification] ${msg}`);
      throw new ApiError(msg, code);
    }

    // Success
    return resData as ApiResponse<T>;

  } catch (error: any) {
    clearTimeout(id);
    
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

// Exported HTTP Methods
export const request = {
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
    
  // Upload helper
  upload: <T = any>(url: string, file: File, options?: RequestOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    const { headers, ...rest } = options || {};
    // Remove Content-Type to let browser set boundary for Multipart
    const newHeaders = { ...headers } as any;
    delete newHeaders['Content-Type']; 
    
    return http<T>(url, { 
      ...rest, 
      method: 'POST', 
      body: formData,
      headers: newHeaders
    });
  }
};
