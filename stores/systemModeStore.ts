import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../constants';

// 系统模式：'creation' 创作中心 | 'model' 模型中心
export type SystemMode = 'creation' | 'model';

interface SystemModeState {
  currentMode: SystemMode;
  setMode: (mode: SystemMode) => void;
}

// 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，默认显示创作中心
const getDefaultMode = (): SystemMode => {
  if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) {
    return 'creation';
  }
  if (CURRENT_SYSTEM === SYSTEM_TYPE.CREATION_CENTER) {
    return 'creation';
  }
  return 'model';
};

export const useSystemModeStore = create<SystemModeState>()(
  persist(
    (set) => ({
      currentMode: getDefaultMode(),
      setMode: (mode) => set({ currentMode: mode }),
    }),
    {
      name: 'system-mode-storage', // localStorage key
    }
  )
);

