import { SelectedProduct } from '../types';
import { User } from '../context/AuthContext';

// 本地存储键
const STORAGE_KEYS = {
  SELECTED_PRODUCTS: 'azure_calculator_selected_products',
  ACTIVE_TAB: 'azure_calculator_active_tab',
  USER_SETTINGS: 'azure_calculator_user_settings',
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info'
};

// 用户设置接口
export interface UserSettings {
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

// 本地存储服务
export const storageService = {
  // 产品选择持久化
  saveSelectedProducts: (products: SelectedProduct[]): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PRODUCTS, JSON.stringify(products));
  },
  
  getSelectedProducts: (): SelectedProduct[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_PRODUCTS);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored) as SelectedProduct[];
    } catch (error) {
      console.error('Failed to parse stored products:', error);
      return [];
    }
  },
  
  // 活动标签页持久化
  saveActiveTab: (tab: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
  },
  
  getActiveTab: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'calculator';
  },
  
  // 用户设置持久化
  saveUserSettings: (settings: UserSettings): void => {
    const currentSettings = storageService.getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updatedSettings));
  },
  
  getUserSettings: (): UserSettings => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!stored) return {};
    
    try {
      return JSON.parse(stored) as UserSettings;
    } catch (error) {
      console.error('Failed to parse user settings:', error);
      return {};
    }
  },
  
  // 认证令牌持久化
  saveAuthToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  getAuthToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  clearAuthToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  // 用户信息持久化
  saveUserInfo: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
  },
  
  getUserInfo: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as User;
    } catch (error) {
      console.error('Failed to parse user info:', error);
      return null;
    }
  },
  
  clearUserInfo: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  },
  
  // 清除所有持久化数据
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};