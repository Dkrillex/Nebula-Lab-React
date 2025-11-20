import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DictData {
  label: string;
  value: string | number;
  [key: string]: any;
}

interface DictState {
  // key 是字典类型 (e.g., 'sys_user_sex'), value 是字典项列表
  dictCache: Record<string, DictData[]>;
  
  setDict: (type: string, data: DictData[]) => void;
  getDict: (type: string) => DictData[] | undefined;
  clearAll: () => void;
}

export const useDictStore = create<DictState>()(
  persist(
    (set, get) => ({
      dictCache: {},
      setDict: (type, data) =>
        set((state) => ({
          dictCache: {
            ...state.dictCache,
            [type]: data,
          },
        })),
      getDict: (type) => {
        return get().dictCache[type];
      },
      clearAll: () => set({ dictCache: {} }),
    }),
    {
      name: 'dict-storage',
    }
  )
);

