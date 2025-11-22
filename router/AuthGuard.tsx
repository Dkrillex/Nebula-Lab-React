import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// 路由白名单（不需要登录的路由）
const WHITE_LIST = ['/', '/privacy'];

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 检查当前路径是否在白名单中
  const isWhiteList = WHITE_LIST.some(path => {
    if (path.endsWith('*')) {
      return location.pathname.startsWith(path.slice(0, -1));
    }
    return location.pathname === path;
  });

  useEffect(() => {
    // 如果没有 Token 且不在白名单，跳转到登录页（或者首页并弹出登录框）
    // 这里我们跳转到首页，并可以通过 URL 参数或状态控制显示登录框
    // 但为了简单起见，如果需要强登录，可以重定向到 /auth/login（如果存在）
    // 目前项目主要是在 Layout 中控制 AuthModal
    
    // 在实际业务中，通常是直接重定向
    // if (!token && !isWhiteList) {
    //   navigate('/', { replace: true, state: { openLogin: true, from: location } });
    // }
  }, [token, isWhiteList, navigate, location]);

  // 如果有 Token，正常渲染
  if (token || isWhiteList) {
    return <>{children}</>;
  }
  
  // 如果没有 Token 且需要权限
  // 此时可以选择返回 null 等待 useEffect 跳转，或者直接渲染 Navigate 组件
  // 这里为了配合 AuthModal 的模式，我们暂时允许渲染，
  // 但 Layout 中的 Header 会检测并在点击受限链接时弹出登录框。
  // 如果要实现严格的路由级拦截，应该这样做：
  /*
  return <Navigate to="/" replace state={{ openLogin: true, from: location }} />;
  */
 
  // 为了保持现有行为（通过 Layout 控制 AuthModal），我们暂时直接返回 children
  // 但在 create/keys 等页面内部可能还会做二次检查
  return <>{children}</>;
};

// 路由元数据类型
export interface RouteMeta {
  title: string;
  icon?: string;
  hideInMenu?: boolean;
  roles?: string[]; // 允许的角色
  requiresAuth?: boolean; // 是否需要登录
}

// 扩展的路由对象类型
export interface AppRouteObject {
  path?: string;
  element?: React.ReactNode;
  children?: AppRouteObject[];
  meta?: RouteMeta;
  index?: boolean;
}

