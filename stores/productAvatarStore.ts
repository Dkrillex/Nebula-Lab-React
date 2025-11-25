import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductAvatarTaskData {
  taskId?: string;
  avatarId?: string;
  templateImageFileId?: string;
  productImageFileId?: string;
  productImageWithoutBackgroundFileId?: string;
  userFaceImageFileId?: string;
  imageEditPrompt?: string;
  productSize?: string;
  location?: [[number | string, number | string], [number | string, number | string], [number | string, number | string], [number | string, number | string]];
  generateImageMode?: 'manual' | 'auto';
  [key: string]: any;
}

interface ProductAvatarState {
  cache: Record<string, ProductAvatarTaskData>;
  setData: (id: string, data: ProductAvatarTaskData) => void;
  getData: (id: string) => ProductAvatarTaskData | undefined;
  removeData: (id: string) => void;
  clearAll: () => void;
}

export const useProductAvatarStore = create<ProductAvatarState>()(
  persist(
    (set, get) => ({
      cache: {},
      setData: (id, data) => {
        console.log('存储产品数字人任务参数', id, data);
        set((state) => ({
          cache: {
            ...state.cache,
            [id]: data,
          },
        }));
      },
      getData: (id) => {
        return get().cache[id];
      },
      removeData: (id) =>
        set((state) => {
          const newCache = { ...state.cache };
          delete newCache[id];
          return { cache: newCache };
        }),
      clearAll: () => set({ cache: {} }),
    }),
    {
      name: 'product-avatar-storage', // unique name for localStorage key
    }
  )
);

