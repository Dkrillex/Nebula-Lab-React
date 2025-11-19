
import { API_BASE_URL, API_TIMEOUT } from '../constants';
import { ApiResponse } from '../types';
import { tansParams, errorCode } from '../utils/ruoyi';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  isToken?: boolean; // Default true
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
  const { 
    params, 
    timeout = API_TIMEOUT, 
    isToken = true,
    headers: customHeaders,
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

  // 2. Headers Handling
  const headers: HeadersInit = {
    'Content-Type': 'application/json;charset=utf-8',
    ...customHeaders,
  };

  // Inject Token
  if (getToken() && isToken) {
    (headers as any)['Authorization'] = 'Bearer ' + getToken();
  }

  const config: RequestInit = {
    ...customConfig,
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

  post: <T = any>(url: string, body: any, options?: RequestOptions) => 
    http<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T = any>(url: string, body: any, options?: RequestOptions) => 
    http<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),

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
