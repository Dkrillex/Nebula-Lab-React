import { create } from 'zustand';

interface CacheState {
  // 需要缓存的组件名称集合
  cachedComponents: Set<string>;
  // 需要排除缓存的组件名称集合
  excludeCachedComponents: Set<string>;
  // 更新缓存的组件列表
  updateCachedComponents: (components: string[]) => void;
  // 添加需要缓存的组件
  addCachedComponent: (componentName: string) => void;
  // 移除缓存的组件
  removeCachedComponent: (componentName: string) => void;
  // 添加需要排除缓存的组件
  addExcludeCachedComponent: (componentName: string) => void;
  // 移除排除缓存的组件
  removeExcludeCachedComponent: (componentName: string) => void;
  // 清空所有缓存
  clearCache: () => void;
}

export const useCacheStore = create<CacheState>((set) => ({
  cachedComponents: new Set<string>(),
  excludeCachedComponents: new Set<string>(),

  updateCachedComponents: (components) => {
    set({ cachedComponents: new Set(components) });
  },

  addCachedComponent: (componentName) => {
    set((state) => {
      const newSet = new Set(state.cachedComponents);
      newSet.add(componentName);
      return { cachedComponents: newSet };
    });
  },

  removeCachedComponent: (componentName) => {
    set((state) => {
      const newSet = new Set(state.cachedComponents);
      newSet.delete(componentName);
      return { cachedComponents: newSet };
    });
  },

  addExcludeCachedComponent: (componentName) => {
    set((state) => {
      const newSet = new Set(state.excludeCachedComponents);
      newSet.add(componentName);
      return { excludeCachedComponents: newSet };
    });
  },

  removeExcludeCachedComponent: (componentName) => {
    set((state) => {
      const newSet = new Set(state.excludeCachedComponents);
      newSet.delete(componentName);
      return { excludeCachedComponents: newSet };
    });
  },

  clearCache: () => {
    set({
      cachedComponents: new Set<string>(),
      excludeCachedComponents: new Set<string>(),
    });
  },
}));

