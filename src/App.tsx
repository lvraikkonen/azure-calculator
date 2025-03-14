import React from 'react';
import Header from './components/Header/Header';
import TabNavigation from './components/TabNavigation/TabNavigation';
import ProductCalculator from './components/ProductCalculator/ProductCalculator';
import AIAdvisor from './components/AIAdvisor/AIAdvisor';
import SummaryPanel from './components/SummaryPanel/SummaryPanel';
import { AppProvider, useAppContext } from './context/AppContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';

// 主应用组件包装器
const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

// 应用内容组件
const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isSmallScreen,
    selectedProducts, 
    totalMonthly,
    updateQuantity,
    removeProduct
  } = useAppContext();

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 主内容区 */}
      <div className={`flex flex-1 p-4 ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
        {/* 左侧功能区 */}
        <div className={`${isSmallScreen ? 'w-full mb-4' : 'w-2/3 pr-4'}`}>
          {activeTab === 'calculator' ? (
            <ProductCalculator />
          ) : (
            <AIAdvisor />
          )}
        </div>
        
        {/* 右侧摘要面板 */}
        <div className={`${isSmallScreen ? 'w-full' : 'w-1/3'}`}>
          <SummaryPanel 
            selectedProducts={selectedProducts}
            totalMonthly={totalMonthly}
            removeProduct={removeProduct}
            updateQuantity={updateQuantity}
          />
        </div>
      </div>
    </div>
  );
};

export default App;