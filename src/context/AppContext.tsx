import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AzureProduct, SelectedProduct } from '../types';
import { storageService, UserSettings } from '../services/storage';

// 上下文接口定义
interface AppContextType {
  // 产品相关
  selectedProducts: SelectedProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  addProduct: (product: AzureProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  totalMonthly: number;
  
  // 界面相关
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSmallScreen: boolean;
  
  // 用户设置
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

// 创建上下文
const AppContext = createContext<AppContextType | undefined>(undefined);

// 上下文提供者组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 产品状态
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  
  // 界面状态
  const [activeTab, setActiveTab] = useState(storageService.getActiveTab());
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // 用户设置
  const [userSettings, setUserSettings] = useState<UserSettings>(
    storageService.getUserSettings()
  );
  
  // 初始化状态
  useEffect(() => {
    // 加载已选产品
    const storedProducts = storageService.getSelectedProducts();
    if (storedProducts.length > 0) {
      setSelectedProducts(storedProducts);
    }
    
    // 检测屏幕尺寸
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始检测
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 更新总费用计算
  useEffect(() => {
    const total = selectedProducts.reduce(
      (sum, product) => sum + (product.price * product.quantity), 
      0
    );
    setTotalMonthly(total);
    
    // 持久化已选产品
    storageService.saveSelectedProducts(selectedProducts);
  }, [selectedProducts]);
  
  // 持久化活动标签页
  useEffect(() => {
    storageService.saveActiveTab(activeTab);
  }, [activeTab]);
  
  // 产品操作函数
  const addProduct = (product: AzureProduct) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id ? {...p, quantity: p.quantity + 1} : p
      ));
    } else {
      // 为新增的产品添加动画效果
      const newProduct = {...product, quantity: 1, isNew: true};
      setSelectedProducts([...selectedProducts, newProduct]);
      
      // 延时移除新产品标记
      setTimeout(() => {
        setSelectedProducts(prev => 
          prev.map(p => p.id === product.id ? {...p, isNew: false} : p)
        );
      }, 2000);
    }
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(productId);
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId ? {...p, quantity: newQuantity} : p
      ));
    }
  };
  
  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };
  
  // 更新用户设置
  const updateUserSettings = (settings: Partial<UserSettings>) => {
    const updatedSettings = { ...userSettings, ...settings };
    setUserSettings(updatedSettings);
    storageService.saveUserSettings(updatedSettings);
  };
  
  // 提供上下文值
  const contextValue: AppContextType = {
    selectedProducts,
    setSelectedProducts,
    addProduct,
    updateQuantity,
    removeProduct,
    totalMonthly,
    activeTab,
    setActiveTab,
    isSmallScreen,
    userSettings,
    updateUserSettings
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义钩子用于访问上下文
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};