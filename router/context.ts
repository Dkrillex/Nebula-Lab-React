import { createContext, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';

export interface AppOutletContextType {
  t: any;
  handleNavClick: (href: string) => void;
  onSignIn: () => void;
}

export const AppContext = createContext<AppOutletContextType | null>(null);

// 为了保持组件中使用的 useOutletContext 类型提示，这里导出一个 hook
export function useAppOutletContext() {
  // 优先尝试从自定义 AppContext 获取（用于 KeepAlive 组件）
  const customContext = useContext(AppContext);

  const outletContext = useOutletContext<AppOutletContextType>();

  const context = customContext || outletContext;

  // 如果 context 为 null，返回一个默认值，避免子组件报错
  if (!context) {
    // console.warn('useAppOutletContext: context is null, returning default value');
    // Return a safe default object to prevent destructuring errors
    return {
      t: {}, // Return empty object instead of null to allow safe property access (e.g. t.header)
      handleNavClick: () => { console.warn('handleNavClick called but context missing'); },
      onSignIn: () => { console.warn('onSignIn called but context missing'); }
    };
  }

  return context;
}
