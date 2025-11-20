
/**
 * Parameter serialization for GET requests (mimics Ruoyi tansParams)
 * @param params Object to serialize
 * @returns Query string
 */
export function tansParams(params: any) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}

/**
 * Stringify params with array format support (mimics qs.stringify with arrayFormat: 'repeat')
 * @param params Object to stringify
 * @param options Options including arrayFormat
 * @returns Query string
 */
export function stringifyParams(params: Record<string, any>, options: { arrayFormat?: 'repeat' | 'brackets' | 'indices' } = {}): string {
  const { arrayFormat = 'repeat' } = options;
  const parts: string[] = [];
  
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    if (Array.isArray(value)) {
      if (arrayFormat === 'repeat') {
        // arr=1&arr=2&arr=3 format
        value.forEach((item) => {
          if (item !== null && item !== undefined && item !== '') {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
          }
        });
      } else if (arrayFormat === 'brackets') {
        // arr[]=1&arr[]=2 format
        value.forEach((item) => {
          if (item !== null && item !== undefined && item !== '') {
            parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
          }
        });
      } else {
        // arr[0]=1&arr[1]=2 format
        value.forEach((item, index) => {
          if (item !== null && item !== undefined && item !== '') {
            parts.push(`${encodeURIComponent(key)}[${index}]=${encodeURIComponent(item)}`);
          }
        });
      }
    } else if (typeof value === 'object') {
      // Handle nested objects: obj[key]=value
      for (const subKey of Object.keys(value)) {
        if (value[subKey] !== null && value[subKey] !== undefined && value[subKey] !== '') {
          parts.push(`${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(value[subKey])}`);
        }
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  
  return parts.join('&');
}

export const errorCode: Record<string | number, string> = {
  '401': '认证失败，无法访问系统资源',
  '403': '当前操作没有权限',
  '404': '访问资源不存在',
  'default': '系统未知错误，请反馈给管理员'
};
