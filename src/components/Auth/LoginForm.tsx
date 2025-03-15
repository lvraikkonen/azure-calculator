// src/components/Auth/LoginForm.tsx

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/auth';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [useMockLogin, setUseMockLogin] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() && password) {
      try {
        if (useMockLogin) {
          // 直接使用模拟登录
          const response = await authApi.login({ username, password }, true);
          clearError();
          window.location.reload(); // 刷新页面以应用新登录状态
        } else {
          // 使用正常登录流程
          const success = await login({ username, password });
          
          // 如果登录成功，刷新页面应用新登录状态
          if (success) {
            window.location.reload();
          }
        }
      } catch (err) {
        // 错误已由login函数处理
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">登录Azure计算器</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={clearError}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>关闭</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            用户名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入用户名"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入密码"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </div>
        
        {isDevelopment && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center mb-2">
              <label className="flex items-center cursor-pointer">
                <span className="mr-2">使用模拟登录</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={useMockLogin} 
                    onChange={() => setUseMockLogin(!useMockLogin)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${useMockLogin ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useMockLogin ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            <p className="mb-1">{useMockLogin ? '已启用模拟登录' : '已连接到实际后端API'}</p>
            <p>开发环境模拟账号: 用户名 "admin" / 密码 "admin"</p>
          </div>
        )}
      </form>
    </div>
  );
};

// 环境判断
const isDevelopment = import.meta.env.DEV;

export default LoginForm;