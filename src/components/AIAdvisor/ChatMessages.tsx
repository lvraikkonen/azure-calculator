import React, { useRef, useEffect } from 'react';
import AIMessage from './AIMessage';
import UserMessage from './UserMessage';
import ThinkingAnimation from './ThinkingAnimation';
import QuickReplyOptions from './QuickReplyOptions';
import RecommendationCard from './RecommendationCard';
import SuggestionChips from './SuggestionChips'; // 新增
import { AzureSolution, BusinessType, BusinessScale } from '../../types';
import { useChatContext } from '../../context/ChatContext';

interface ChatMessagesProps {
  businessType: BusinessType;
  businessScale: BusinessScale;
  recommendedSolution: AzureSolution | null;
  setBusinessType: (type: BusinessType) => void;
  setBusinessScale: (scale: BusinessScale) => void;
  thinking: boolean;
  streaming: boolean;
  applySolution: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  businessType, 
  businessScale, 
  recommendedSolution,
  setBusinessType,
  setBusinessScale,
  thinking,
  streaming,
  applySolution
}) => {
  const { currentConversation, suggestions, sendSuggestion } = useChatContext(); // 更新
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const businessTypeOptions = [
    { value: 'web', label: 'Web应用开发' },
    { value: 'data', label: '数据处理与分析' }
  ];
  
  const businessScaleOptions = [
    { value: 'small', label: '小型 (1-50 用户)' },
    { value: 'medium', label: '中型 (51-200 用户)' }
  ];

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息发生变化或者正在流式响应时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation, streaming, suggestions]); // 添加suggestions依赖

  // 如果有对话历史，则显示历史消息
  if (currentConversation && currentConversation.messages.length > 0) {
    return (
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4" style={{height: '400px'}}>
        {currentConversation.messages.map((message) => (
          message.role === 'assistant' ? (
            <AIMessage key={message.id} isStreaming={streaming && message === currentConversation.messages[currentConversation.messages.length - 1]}>
              <p>{message.content}</p>
            </AIMessage>
          ) : (
            <UserMessage key={message.id}>
              <p>{message.content}</p>
            </UserMessage>
          )
        ))}
        
        {thinking && <ThinkingAnimation />}
        
        {/* 添加建议问题区域 */}
        {!thinking && !streaming && suggestions.length > 0 && (
          <SuggestionChips 
            suggestions={suggestions} 
            onSuggestionClick={sendSuggestion}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  }

  // 否则显示默认的引导流程
  return (
    <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4" style={{height: '400px'}}>
      {/* AI欢迎消息 */}
      <AIMessage>
        <p>你好！我是Azure AI解决方案顾问，可以帮你找到最适合你业务需求的Azure云服务组合。请告诉我一些关于你的业务情况。</p>
      </AIMessage>
      
      {/* 业务类型选择 */}
      {!businessType && (
        <QuickReplyOptions 
          label="请选择你的业务类型："
          options={businessTypeOptions}
          onSelect={setBusinessType}
        />
      )}
      
      {/* 用户选择的业务类型 */}
      {businessType && (
        <UserMessage>
          <p>我的业务类型是: {businessType === 'web' ? 'Web应用开发' : '数据处理与分析'}</p>
        </UserMessage>
      )}
      
      {/* AI响应业务类型 */}
      {businessType && !businessScale && (
        <>
          <AIMessage>
            <p>了解了！你选择的是{businessType === 'web' ? 'Web应用开发' : '数据处理与分析'}。接下来，能告诉我你的业务规模吗？</p>
          </AIMessage>
          
          <QuickReplyOptions 
            label="请选择你的业务规模："
            options={businessScaleOptions}
            onSelect={setBusinessScale}
          />
        </>
      )}
      
      {/* 用户选择的业务规模 */}
      {businessType && businessScale && (
        <UserMessage>
          <p>我的业务规模是: {businessScale === 'small' ? '小型 (1-50 用户)' : '中型 (51-200 用户)'}</p>
        </UserMessage>
      )}
      
      {/* AI思考中动画 */}
      {businessType && businessScale && thinking && <ThinkingAnimation />}
      
      {/* AI推荐方案结果 */}
      {recommendedSolution && (
        <AIMessage>
          <p className="mb-2">根据你的需求，我为你定制了这个解决方案：</p>
          <RecommendationCard 
            recommendation={recommendedSolution} 
            onApply={applySolution}
          />
          <p className="mt-3">这个方案能满足你的需求吗？你也可以在应用后在产品计算器中进一步调整。</p>
        </AIMessage>
      )}
      
      {/* 建议问题区域 */}
      {!thinking && suggestions.length > 0 && (
        <SuggestionChips 
          suggestions={suggestions} 
          onSuggestionClick={sendSuggestion}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;