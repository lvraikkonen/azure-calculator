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
          // 获取存储的用户信息
          const storedUser = storageService.getUserInfo();
          
          if (storedUser) {
            // 使用存储的用户信息
            setUser(storedUser);
          } else {
            // 如果没有存储的用户信息，尝试从后端获取
            try {
              // 调用/auth/me端点获取用户信息
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                // 保存用户信息到本地存储
                storageService.saveUserInfo(userData);
              } else {
                // Token无效，清除存储
                storageService.clearAuthToken();
                storageService.clearUserInfo();
              }
            } catch (error) {
              console.error('获取用户信息失败:', error);
              // 在开发环境中使用默认用户以便测试
              if (isDevelopment) {
                setUser({
                  id: '1',
                  username: 'admin',
                  email: 'admin@example.com'
                });
              } else {
                // 生产环境中清除令牌
                storageService.clearAuthToken();
                storageService.clearUserInfo();
              }
            }
          }
        } catch (error) {
          console.error('验证token失败:', error);
          // 错误时清除token
          storageService.clearAuthToken();
          storageService.clearUserInfo();
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
        // Token被添加或更改 - 应该从localStorage中获取用户信息
        const storedUser = storageService.getUserInfo();
        if (storedUser) {
          setUser(storedUser);
        }
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
      
      // 保存用户信息到localStorage
      storageService.saveUserInfo(response.user);
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
    storageService.clearUserInfo();
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