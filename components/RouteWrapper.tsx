import React from 'react';
import { useAppOutletContext } from '../router/context';
import { translations } from '../translations';

interface RouteWrapperProps {
  component: React.LazyExoticComponent<any> | React.ComponentType<any>;
  translationKey?: string; // e.g. "createPage.textToImage" or "assetsPage"
  additionalProps?: Record<string, any>;
  // Used for special cases, e.g. needing multiple translation keys or transforming context
  mapContextToProps?: (contextT: any) => Record<string, any>;
}

/**
 * RouteWrapper
 * 
 * A generic wrapper for route components that:
 * 1. Safely injects translation data (t) from context or fallback
 * 2. Works seamlessly within KeepAliveBoundary (consumes bridged AppContext)
 */
export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  component: Component, 
  translationKey, 
  additionalProps = {},
  mapContextToProps 
}) => {
  const { t: rawT } = useAppOutletContext();
  
  // Safely get translations, provide default 'zh' if context is empty
  // This prevents white screen or loading waits when context is not yet ready
  const t = rawT || translations['zh'];

  let props: Record<string, any> = { ...additionalProps };

  // Helper to get nested property by path (e.g. "a.b.c")
  const getNestedTranslation = (obj: any, path: string) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  if (mapContextToProps) {
    try {
      props = { ...props, ...mapContextToProps(t) };
    } catch (e) {
      console.warn('RouteWrapper: mapContextToProps failed', e);
    }
  } else if (translationKey) {
    // Try to get from context t first
    let targetT = getNestedTranslation(t, translationKey);
    
    // If not found, try fallback to default 'zh' translations
    if (!targetT) {
      const defaultT = translations['zh'];
      targetT = getNestedTranslation(defaultT, translationKey);
    }
    
    if (targetT) {
      props.t = targetT;
    } else {
      console.warn(`RouteWrapper: Translation key ${translationKey} missing in both context and default`);
      // Pass empty object to prevent crashes if component expects t
      props.t = {};
    }
  }

  if (!Component) {
    return <div className="p-4 text-red-500">Error: Component failed to load</div>;
  }

  // 调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('RouteWrapper - 渲染组件, translationKey:', translationKey, 'Component:', Component.name || 'Unknown', 'props.t:', !!props.t);
  }

  return <Component {...props} />;
};

