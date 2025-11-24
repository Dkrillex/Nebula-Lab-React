import React from 'react';
import { useAppOutletContext } from '../../router';

interface RouteWrapperProps {
  component: React.LazyExoticComponent<any> | React.ComponentType<any>;
  translationKey?: string;
  additionalProps?: Record<string, any>;
  // 用于处理特殊情况，比如需要多个 translation key
  mapContextToProps?: (contextT: any) => Record<string, any>;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  component: Component, 
  translationKey, 
  additionalProps = {},
  mapContextToProps 
}) => {
  const { t } = useAppOutletContext();
  
  let props: Record<string, any> = { ...additionalProps };

  if (mapContextToProps) {
    props = { ...props, ...mapContextToProps(t) };
  } else if (translationKey && t?.createPage) {
    props.t = t.createPage[translationKey];
  }

  return <Component {...props} />;
};

