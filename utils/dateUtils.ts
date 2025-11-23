/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期为 yyyy-MM-dd HH:mm:ss 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串，格式：yyyy-MM-dd HH:mm:ss
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

/**
 * 解析日期字符串为 Date 对象
 * 支持多种格式，包括 yyyy-MM-dd HH:mm:ss
 * @param dateString 日期字符串
 * @returns Date 对象，如果解析失败返回 null
 */
export function parseDateTime(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    // 尝试解析标准格式 yyyy-MM-dd HH:mm:ss
    const standardFormat = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/;
    const match = dateString.match(standardFormat);
    
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
    }
    
    // 尝试使用 Date 构造函数解析
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

/**
 * 格式化日期为后端可接受的格式（yyyy-MM-dd HH:mm:ss）
 * 用于提交数据时格式化日期字段
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串，如果无效则返回 undefined
 */
export function formatDateForBackend(date: Date | string | number | null | undefined): string | undefined {
  const formatted = formatDateTime(date);
  return formatted || undefined;
}

