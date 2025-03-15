// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, mockLogin, LoginRequest, AuthError } from '../services/auth';
import { storageService } from '../services/storage';

// 用户信息接口
export interface User {
  id: string;
  username: string;
  email: string;
}

// 认证上下文接口
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>; // 返回登录是否成功
  logout: () => void;
  clearError: () => void;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 开发模式标志
const isDevelopment = import.meta.env.DEV;

// 强制使用模拟登录（仅用于开发环境）
const FORCE_MOCK_LOGIN = false;

// 上下文提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 检查初始认证状态
  useEffect(() => {
    const checkAuth = async () => {
      const token = storageService.getAuthToken();
      
      if (token) {
        try {
          // 为简单起见，我们直接根据token存在设置用户信息
          // 理想情况下，应该调用后端API验证token并获取用户信息
          setUser({
            id: '1',
            username: 'admin',
            email: 'admin@example.com'
          });
          
          // 如果需要验证token或获取用户信息，可以在这里添加API调用
          // const response = await fetch(`${API_BASE_URL}/auth/me`, {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // if (response.ok) {
          //   const userData = await response.json();
          //   setUser(userData);
          // } else {
          //   // Token无效，清除存储
          //   storageService.clearAuthToken();
          // }
        } catch (error) {
          console.error('验证token失败:', error);
          // 错误时清除token
          storageService.clearAuthToken();
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue !== null) {
        // Token被添加或更改
        setUser({
          id: '1',
          username: 'admin',
          email: 'admin@example.com'
        });
      } else if (e.key === 'auth_token' && e.newValue === null) {
        // Token被删除
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 用户登录
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 尝试使用真实的后端登录API，如果FORCE_MOCK_LOGIN设置为true则使用模拟登录
      const response = await authApi.login(credentials, FORCE_MOCK_LOGIN);
      setUser(response.user);
      
      // 触发自定义事件，通知其他组件用户已登录
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { isAuthenticated: true }
      }));
      
      return true; // 登录成功
    } catch (err) {
      setError(err instanceof AuthError ? err.message : '登录失败');
      return false; // 登录失败
    } finally {
      setIsLoading(false);
    }
  };
  
  // 用户登出
  const logout = () => {
    authApi.logout();
    setUser(null);
    
    // 触发自定义事件，通知其他组件用户已登出
    window.dispatchEvent(new CustomEvent('auth-state-changed', { 
      detail: { isAuthenticated: false }
    }));
    
    // 重定向到登录页面
    window.location.reload();
  };
  
  // 清除错误
  const clearError = () => {
    setError(null);
  };
  
  // 提供上下文值
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子用于访问上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};