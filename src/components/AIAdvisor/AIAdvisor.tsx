import React, { useState, useCallback, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { aiSolutions, azureProducts } from '../../data/azureProducts';
import { BusinessType, BusinessScale, AzureSolution, SelectedProduct } from '../../types';
import { useChatContext } from '../../context/ChatContext';

interface AIAdvisorProps {
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  setActiveTab: (tab: string) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ setSelectedProducts, setActiveTab }) => {
  const [businessType, setBusinessType] = useState<BusinessType>('');
  const [businessScale, setBusinessScale] = useState<BusinessScale>('');
  const [recommendedSolution, setRecommendedSolution] = useState<AzureSolution | null>(null);
  const [thinking, setThinking] = useState(false);
  const { sendMessage } = useChatContext();
  
  // 获取AI推荐解决方案
  const getRecommendation = useCallback(() => {
    if (!businessType || !businessScale) return;
    
    setThinking(true);
    
    // 模拟API调用的延迟
    setTimeout(() => {
      const key = `${businessType}-${businessScale}`;
      setRecommendedSolution(aiSolutions[key as keyof typeof aiSolutions] || null);
      setThinking(false);
    }, 1500);
  }, [businessType, businessScale]);
  
  // 监听业务类型和规模变化，自动获取推荐
  useEffect(() => {
    if (businessType && businessScale) {
      getRecommendation();
    }
  }, [businessType, businessScale, getRecommendation]);

  // 应用推荐解决方案
  const applySolution = () => {
    if (!recommendedSolution) return;
    
    // 先清空已选产品
    setSelectedProducts([]);
    
    // 添加解决方案中的产品
    recommendedSolution.products.forEach(product => {
      const fullProduct = azureProducts.find(p => p.id === product.id);
      if (fullProduct) {
        setSelectedProducts(prev => [...prev, {
          ...fullProduct,
          quantity: product.quantity
        }]);
      }
    });
    
    // 切换到计算器标签页
    setActiveTab('calculator');
  };

  // ChatInput 需要的发送消息处理函数
  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full border border-gray-200 flex flex-col">
      <ChatHeader />
      
      <ChatMessages 
        businessType={businessType}
        businessScale={businessScale}
        recommendedSolution={recommendedSolution}
        setBusinessType={setBusinessType}
        setBusinessScale={setBusinessScale}
        thinking={thinking}
        applySolution={applySolution}
      />
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default AIAdvisor;