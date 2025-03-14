import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  Conversation, 
  ConversationSummary,
  BusinessType,
  BusinessScale,
  AzureSolution
} from '../types';
import { chatApi, mockResponse } from '../services/api';
import { aiSolutions } from '../data/azureProducts';

// 开发模式标志
const isDevelopment = import.meta.env.DEV;

// 聊天上下文接口
interface ChatContextType {
  // 对话状态
  currentConversation: Conversation | null;
  conversations: ConversationSummary[];
  loading: boolean;
  error: string | null;
  thinking: boolean;
  
  // AI顾问状态
  businessType: BusinessType;
  businessScale: BusinessScale;
  recommendedSolution: AzureSolution | null;
  
  // 操作函数
  sendMessage: (content: string) => Promise<void>;
  setBusinessType: (type: BusinessType) => void;
  setBusinessScale: (scale: BusinessScale) => void;
  getRecommendation: () => void;
  createNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

// 创建上下文
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 上下文提供者组件
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 对话状态
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  
  // AI顾问状态
  const [businessType, setBusinessType] = useState<BusinessType>('');
  const [businessScale, setBusinessScale] = useState<BusinessScale>('');
  const [recommendedSolution, setRecommendedSolution] = useState<AzureSolution | null>(null);
  
  // 加载对话列表
  useEffect(() => {
    const loadConversations = async () => {
      if (isDevelopment) {
        // 开发模式：使用模拟数据
        return;
      }
      
      try {
        setLoading(true);
        const data = await chatApi.getConversations();
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载对话失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
  }, []);
  
  // 监听业务类型和规模变化，自动获取推荐
  useEffect(() => {
    if (businessType && businessScale) {
      getRecommendation();
    }
  }, [businessType, businessScale]);
  
  // 创建新对话
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentConversation(newConversation);
    
    // 如果是开发模式，添加一条欢迎消息
    if (isDevelopment) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        content: '你好！我是Azure AI解决方案顾问，可以帮你找到最适合你业务需求的Azure云服务组合。请告诉我一些关于你的业务情况。',
        role: 'assistant',
        createdAt: new Date()
      };
      
      setCurrentConversation({
        ...newConversation,
        messages: [welcomeMessage]
      });
    }
  };
  
  // 加载特定对话
  const loadConversation = async (id: string) => {
    if (isDevelopment) {
      // 开发模式：直接创建新对话
      createNewConversation();
      return;
    }
    
    try {
      setLoading(true);
      const conversation = await chatApi.getConversation(id);
      setCurrentConversation(conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载对话失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 发送消息
  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      createNewConversation();
    }
    
    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      createdAt: new Date()
    };
    
    // 更新当前对话
    const updatedConversation = {
      ...currentConversation!,
      messages: [...currentConversation!.messages, userMessage],
      updatedAt: new Date()
    };
    
    setCurrentConversation(updatedConversation);
    
    if (isDevelopment) {
      // 开发模式：使用模拟响应
      setThinking(true);
      
      try {
        // 模拟API延迟
        await mockResponse(null, 1000);
        
        // 创建模拟响应消息
        const assistantMessage: Message = {
          id: uuidv4(),
          content: `我收到了你的消息: "${content}"。请问你的业务类型是什么？`,
          role: 'assistant',
          createdAt: new Date()
        };
        
        // 更新当前对话
        setCurrentConversation({
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage]
        });
      } finally {
        setThinking(false);
      }
      
      return;
    }
    
    // 生产模式：调用实际API
    setThinking(true);
    
    try {
      const response = await chatApi.sendMessage({
        content,
        conversationId: currentConversation?.id
      });
      
      // 创建助手消息
      const assistantMessage: Message = {
        id: response.id,
        content: response.content,
        role: 'assistant',
        createdAt: new Date(response.createdAt)
      };
      
      // 更新当前对话
      setCurrentConversation({
        ...updatedConversation,
        id: response.conversationId,
        messages: [...updatedConversation.messages, assistantMessage]
      });
      
      // 更新对话列表
      const conversationExists = conversations.some(conv => conv.id === response.conversationId);
      
      if (!conversationExists) {
        const newSummary: ConversationSummary = {
          id: response.conversationId,
          title: updatedConversation.title,
          lastMessagePreview: assistantMessage.content.substring(0, 50) + '...',
          createdAt: updatedConversation.createdAt,
          updatedAt: new Date()
        };
        
        setConversations([newSummary, ...conversations]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
    } finally {
      setThinking(false);
    }
  };
  
  // 获取AI推荐方案
  const getRecommendation = () => {
    if (!businessType || !businessScale) return;
    
    setThinking(true);
    
    // 模拟API调用延迟
    setTimeout(() => {
      const key = `${businessType}-${businessScale}` as keyof typeof aiSolutions;
      setRecommendedSolution(aiSolutions[key] || null);
      setThinking(false);
    }, 1500);
  };
  
  // 更新对话标题
  const updateConversationTitle = async (id: string, title: string) => {
    if (isDevelopment) {
      // 开发模式：直接更新本地状态
      if (currentConversation && currentConversation.id === id) {
        setCurrentConversation({
          ...currentConversation,
          title
        });
      }
      
      setConversations(conversations.map(conv => 
        conv.id === id ? { ...conv, title } : conv
      ));
      
      return;
    }
    
    try {
      await chatApi.updateConversationTitle(id, title);
      
      // 更新本地状态
      if (currentConversation && currentConversation.id === id) {
        setCurrentConversation({
          ...currentConversation,
          title
        });
      }
      
      setConversations(conversations.map(conv => 
        conv.id === id ? { ...conv, title } : conv
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新对话标题失败');
    }
  };
  
  // 删除对话
  const deleteConversation = async (id: string) => {
    if (isDevelopment) {
      // 开发模式：直接从本地状态移除
      setConversations(conversations.filter(conv => conv.id !== id));
      
      if (currentConversation && currentConversation.id === id) {
        setCurrentConversation(null);
      }
      
      return;
    }
    
    try {
      await chatApi.deleteConversation(id);
      
      // 更新本地状态
      setConversations(conversations.filter(conv => conv.id !== id));
      
      if (currentConversation && currentConversation.id === id) {
        setCurrentConversation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除对话失败');
    }
  };
  
  // 提供上下文值
  const contextValue: ChatContextType = {
    currentConversation,
    conversations,
    loading,
    error,
    thinking,
    businessType,
    businessScale,
    recommendedSolution,
    sendMessage,
    setBusinessType,
    setBusinessScale,
    getRecommendation,
    createNewConversation,
    loadConversation,
    updateConversationTitle,
    deleteConversation
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// 自定义钩子用于访问上下文
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};