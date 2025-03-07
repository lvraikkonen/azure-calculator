import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import TabNavigation from './components/TabNavigation/TabNavigation';
import ProductCalculator from './components/ProductCalculator/ProductCalculator';
import AIAdvisor from './components/AIAdvisor/AIAdvisor';
import SummaryPanel from './components/SummaryPanel/SummaryPanel';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // 检测屏幕尺寸变化实现响应式
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 更新总费用
  useEffect(() => {
    const total = selectedProducts.reduce((sum, product) => 
      sum + (product.price * product.quantity), 0);
    setTotalMonthly(total);
  }, [selectedProducts]);

  // 添加产品到选中列表
  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id ? {...p, quantity: p.quantity + 1} : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {...product, quantity: 1}]);
    }
  };

  // 更新产品数量
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId ? {...p, quantity: newQuantity} : p
      ));
    }
  };

  // 移除产品
  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Header />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 主内容区 */}
      <div className={`flex flex-1 p-4 ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
        {/* 左侧功能区 */}
        <div className={`${isSmallScreen ? 'w-full mb-4' : 'w-2/3 pr-4'}`}>
          {activeTab === 'calculator' ? (
            <ProductCalculator 
              addProduct={addProduct}
              updateQuantity={updateQuantity}
              selectedProducts={selectedProducts}
            />
          ) : (
            <AIAdvisor 
              setSelectedProducts={setSelectedProducts}
              setActiveTab={setActiveTab}
            />
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
}

export default App;