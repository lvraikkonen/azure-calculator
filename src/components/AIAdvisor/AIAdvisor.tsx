import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { azureProducts } from '../../data/azureProducts';
import { SelectedProduct } from '../../types';
import { useChatContext } from '../../context/ChatContext';

interface AIAdvisorProps {
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  setActiveTab: (tab: string) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ setSelectedProducts, setActiveTab }) => {
  const { 
    businessType, 
    businessScale, 
    recommendedSolution, 
    setBusinessType, 
    setBusinessScale,
    thinking, 
    streaming,
    currentConversation,
    createNewConversation
  } = useChatContext();
  
  // 组件挂载时初始化对话（如果还没有）
  useEffect(() => {
    if (!currentConversation) {
      createNewConversation();
    }
  }, [currentConversation, createNewConversation]);
  
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

  return (
    <div className="bg-white rounded-lg shadow-md h-full border border-gray-200 flex flex-col">
      <ChatHeader isStreaming={streaming} />
      
      <ChatMessages 
        businessType={businessType}
        businessScale={businessScale}
        recommendedSolution={recommendedSolution}
        setBusinessType={setBusinessType}
        setBusinessScale={setBusinessScale}
        thinking={thinking}
        streaming={streaming}
        applySolution={applySolution}
      />
      
      <ChatInput useStreaming={true} />
    </div>
  );
};

export default AIAdvisor;