import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppContext } from './AppContext';

// 主题上下文类型
interface ThemeContextType {
  isDarkMode: boolean;
}

// 创建上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userSettings } = useAppContext();
  
  // 检查当前是否应该使用深色模式
  const getIsDarkMode = (): boolean => {
    const { theme } = userSettings;
    
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // 默认跟随系统
    if (theme === 'system' || !theme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  };
  
  // 应用当前主题
  useEffect(() => {
    const isDarkMode = getIsDarkMode();
    
    // 添加或移除深色模式类
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.theme]);
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (userSettings.theme === 'system') {
        const isDarkMode = mediaQuery.matches;
        
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [userSettings.theme]);
  
  // 当前深色模式状态
  const isDarkMode = getIsDarkMode();
  
  return (
    <ThemeContext.Provider value={{ isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义钩子用于访问主题上下文
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};