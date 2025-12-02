
/**
 * 获取带版本和环境的存储命名空间
 * 用于确保版本更新后缓存隔离
 */
export const getAppNamespace = (): string => {
    const version = import.meta.env.VITE_APP_VERSION || '0.0.0';
    const env = import.meta.env.MODE || 'development';
    const appName = 'nebula-lab';

    return `${appName}-${version}-${env}`;
};

/**
 * 获取带命名空间的存储键
 * @param key 原始键名
 */
export const getStorageKey = (key: string): string => {
    return `${getAppNamespace()}-${key}`;
};

