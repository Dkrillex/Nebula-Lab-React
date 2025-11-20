import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AvatarTaskData {
  id?: string;
  avatarId?: string;
  voiceId?: string;
  backgroundId?: string;
  script?: string;
  [key: string]: any;
}

interface AvatarState {
  // 缓存不同类型的数字人任务数据
  // key 可以是 task ID 或类型标识 (e.g., 'marketing', 'talking_photo')
  taskCache: Record<string, AvatarTaskData>;
  
  setTaskData: (id: string, data: AvatarTaskData) => void;
  getTaskData: (id: string) => AvatarTaskData | undefined;
  removeTaskData: (id: string) => void;
  clearAll: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      taskCache: {},
      setTaskData: (id, data) => {
        console.log('存储数字人任务参数', id, data);
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
      name: 'avatar-store-storage',
    }
  )
);

