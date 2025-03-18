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

  useEffect(() => {
    console.log('[AIAdvisor] 当前会话ID:', currentConversation?.id);
  }, [currentConversation?.id]);
  
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
    
    // 查找推荐方案中的产品
    const productsToAdd: SelectedProduct[] = [];
    
    recommendedSolution.products.forEach(product => {
      // 首先尝试从预定义的产品中查找
      let fullProduct = azureProducts.find(p => p.id === product.id);
      
      // 如果找不到匹配的预定义产品，则使用推荐方案中的产品信息创建新产品
      if (!fullProduct) {
        console.log(`[AIAdvisor] 在预定义产品中未找到产品 ${product.id}，创建新产品`);
        fullProduct = {
          id: product.id,
          name: product.name,
          description: `Azure ${product.name} 服务`,
          price: getEstimatedPrice(product.id, product.name),
          category: getCategoryFromProductId(product.id)
        };
      }
      
      // 添加到产品列表
      productsToAdd.push({
        ...fullProduct,
        quantity: product.quantity || 1 // 确保有数量值
      });
    });
    
    console.log('[AIAdvisor] 应用方案，添加产品:', productsToAdd);
    
    // 更新已选产品
    setSelectedProducts(productsToAdd);
    
    // 切换到计算器标签页
    setActiveTab('calculator');
  };

  // 根据产品ID估计价格（如果在预定义产品中找不到）
  const getEstimatedPrice = (id: string, name: string): number => {
    // 这里可以根据产品名称或ID来估计价格
    // 实际生产环境中应该从API获取
    const priceMap: {[key: string]: number} = {
      'azure-storage': 5.23,
      'azure-sql-database': 15.55,
      'azure-data-factory': 12.87,
      'azure-databricks': 21.45,
      'power-bi': 9.99,
      'azure-analysis-services': 18.25,
      // 添加更多产品的估计价格
    };
    
    return priceMap[id] || 10.00; // 默认价格为10.00
  };
  
  // 根据产品ID确定产品类别
  const getCategoryFromProductId = (id: string): 'compute' | 'storage' | 'database' | 'networking' | 'data' => {
    if (id.includes('storage')) return 'storage';
    if (id.includes('sql') || id.includes('cosmos')) return 'database';
    if (id.includes('vm') || id.includes('function')) return 'compute';
    if (id.includes('network') || id.includes('cdn')) return 'networking';
    if (id.includes('data') || id.includes('analysis') || id.includes('bi')) return 'data';
    
    // 默认为数据类别
    return 'data';
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