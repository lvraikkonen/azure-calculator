// src/components/Auth/PrivateRoute.tsx

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import LoginForm from './LoginForm';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasToken, setHasToken] = useState(false);
  
  // 直接检查localStorage中是否有token，这是一个额外的检查
  useEffect(() => {
    const token = storageService.getAuthToken();
    setHasToken(!!token);
    
    // 监听localStorage变化
    const handleStorageChange = () => {
      const updatedToken = storageService.getAuthToken();
      setHasToken(!!updatedToken);
    };
    
    // 监听自定义认证状态变化事件
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.isAuthenticated === 'boolean') {
        setHasToken(event.detail.isAuthenticated);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
    };
  }, []);

  // 显示加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未认证且没有token，显示登录表单
  if (!isAuthenticated && !hasToken) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  // 认证成功或有token，渲染子组件
  return <>{children}</>;
};

export default PrivateRoute;