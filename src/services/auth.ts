// src/services/auth.ts

import { storageService } from './storage';

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// 开发模式标志
const isDevelopment = import.meta.env.DEV;

// 强制使用模拟登录（仅开发环境）
const FORCE_MOCK_LOGIN = false;

// 用户登录响应
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
}

// API错误处理
export class AuthError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

// 认证API服务
export const authApi = {
  // 用户登录
  login: async (credentials: LoginRequest, useMock = false): Promise<LoginResponse> => {
    // 如果显式要求使用模拟登录
    if (useMock) {
      return mockLogin(credentials);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: credentials.username,
          password: credentials.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AuthError(
          errorData.detail || `登录失败: ${response.status}`,
          response.status
        );
      }
      
      const data = await response.json();
      
      // 保存令牌到本地存储
      storageService.saveAuthToken(data.access_token);
      
      return data;
    } catch (error) {
      // 如果在开发环境中且后端不可用，尝试模拟登录
      if (isDevelopment && error instanceof Error && error.message.includes('fetch')) {
        console.warn('后端API不可用，使用模拟登录');
        return mockLogin(credentials);
      }
      
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        error instanceof Error ? error.message : '登录失败',
        500
      );
    }
  },
  
  // 用户登出
  logout: (): void => {
    storageService.clearAuthToken();
  },
  
  // 检查是否已登录
  isAuthenticated: (): boolean => {
    return !!storageService.getAuthToken();
  }
};

// 开发模式下的模拟登录（admin用户）
export const mockLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const mockResponse: LoginResponse = {
          access_token: 'mock_jwt_token_for_development',
          token_type: 'bearer',
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com'
          }
        };
        
        // 保存令牌到本地存储
        storageService.saveAuthToken(mockResponse.access_token);
        
        resolve(mockResponse);
      } else {
        reject(new AuthError('用户名或密码错误', 401));
      }
    }, 500);
  });
};