import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductVideoData {
  id?: string;
  productId?: string;
  templateId?: string;
  script?: string;
  images?: string[];
  videos?: string[];
  [key: string]: any;
}

interface ProductVideoState {
  taskCache: Record<string, ProductVideoData>;
  
  setTaskData: (id: string, data: ProductVideoData) => void;
  getTaskData: (id: string) => ProductVideoData | undefined;
  removeTaskData: (id: string) => void;
  clearAll: () => void;
}

export const useProductVideoStore = create<ProductVideoState>()(
  persist(
    (set, get) => ({
      taskCache: {},
      setTaskData: (id, data) => {
        console.log('存储产品视频任务参数', id, data);
        set((state) => ({
          taskCache: {
            ...state.taskCache,
            [id]: data,
          },
        }));
      },
      getTaskData: (id) => {
        return get().taskCache[id];
      },
      removeTaskData: (id) =>
        set((state) => {
          const newCache = { ...state.taskCache };
          delete newCache[id];
          return { taskCache: newCache };
        }),
      clearAll: () => set({ taskCache: {} }),
    }),
    {
      name: 'product-video-store-storage',
    }
  )
);

