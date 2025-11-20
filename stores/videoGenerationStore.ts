import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GenerationData {
  images: string[];
  sourcePrompt: string;
  timestamp: number;
  source: string;
}

interface VideoGenerationState {
  transferData: Record<string, GenerationData>;
  setData: (id: string, data: GenerationData) => void;
  getData: (id: string) => GenerationData | undefined;
  removeData: (id: string) => void;
}

export const useVideoGenerationStore = create<VideoGenerationState>()(
  persist(
    (set, get) => ({
      transferData: {},
      setData: (id, data) =>
        set((state) => ({
          transferData: {
            ...state.transferData,
            [id]: data,
          },
        })),
      getData: (id) => {
        return get().transferData[id];
      },
      removeData: (id) =>
        set((state) => {
          const newData = { ...state.transferData };
          delete newData[id];
          return { transferData: newData };
        }),
    }),
    {
      name: 'video-generation-storage', // unique name for localStorage key
    }
  )
);

