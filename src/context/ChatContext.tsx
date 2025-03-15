// src/context/ChatContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  Conversation, 
  ConversationSummary,
  BusinessType,
  BusinessScale,
  AzureSolution
} from '../types';
import { chatApi, mockResponse, mockStreamResponse, StreamHandler } from '../services/api';
import { aiSolutions } from '../data/azureProducts';

// 开发模式标志
const isDevelopment = import.meta.env.DEV;

// 从本地存储读取API使用首选项
const getUseRealApi = (): boolean => {
  const API_PREF_KEY = 'azure_calculator_use_real_api';
  const savedPref = localStorage.getItem(API_PREF_KEY);
  return savedPref ? JSON.parse(savedPref) : true;
};

// 是否强制使用模拟数据（开发环境）
const FORCE_MOCK_CHAT = !getUseRealApi();

// 聊天上下文接口
interface ChatContextType {
  // 对话状态
  currentConversation: Conversation | null;
  conversations: ConversationSummary[];
  loading: boolean;
  error: string | null;
  thinking: boolean;
  streaming: boolean;
  
  // AI顾问状态
  businessType: BusinessType;
  businessScale: BusinessScale;
  recommendedSolution: AzureSolution | null;
  
  // 操作函数
  sendMessage: (content: string) => Promise<void>;
  sendStreamMessage: (content: string) => Promise<void>;
  setBusinessType: (type: BusinessType) => void;
  setBusinessScale: (scale: BusinessScale) => void;
  getRecommendation: () => void;
  createNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  cancelStreaming: () => void;
  useRealApi: boolean;
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
  const [streaming, setStreaming] = useState(false);
  const [useRealApi, setUseRealApi] = useState(getUseRealApi);
  
  // 流式响应控制
  const cancelStreamRef = useRef<(() => void) | null>(null);
  
  // AI顾问状态
  const [businessType, setBusinessType] = useState<BusinessType>('');
  const [businessScale, setBusinessScale] = useState<BusinessScale>('');
  const [recommendedSolution, setRecommendedSolution] = useState<AzureSolution | null>(null);
  
  // 监听API使用首选项变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'azure_calculator_use_real_api') {
        setUseRealApi(e.newValue ? JSON.parse(e.newValue) : true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 取消流式响应
  const cancelStreaming = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
      setStreaming(false);
    }
  };
  
  // 组件卸载时取消流式响应
  useEffect(() => {
    return () => {
      cancelStreaming();
    };
  }, []);
  
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
  
  // 发送普通消息
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
    
    if (isDevelopment && FORCE_MOCK_CHAT) {
      // 开发模式且强制使用模拟数据：使用模拟响应
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
    
    // 默认情况：调用实际API
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
      updateConversationsList(response.conversationId, updatedConversation, assistantMessage);
    } catch (err) {
      // 如果API调用失败，检查是否是开发环境，如果是则回退到模拟数据
      if (isDevelopment) {
        console.warn('聊天API调用失败，使用模拟数据:', err);
        // 创建模拟响应消息
        const assistantMessage: Message = {
          id: uuidv4(),
          content: `[模拟响应] 我收到了你的消息: "${content}"。请问你的业务类型是什么？`,
          role: 'assistant',
          createdAt: new Date()
        };
        
        // 更新当前对话
        setCurrentConversation({
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage]
        });
      } else {
        setError(err instanceof Error ? err.message : '发送消息失败');
      }
    } finally {
      setThinking(false);
    }
  };
  
  // 发送流式消息
  const sendStreamMessage = async (content: string) => {
    // 取消任何正在进行的流式响应
    cancelStreaming();
    
    if (!currentConversation) {
      createNewConversation();
    }
    
    console.log('[Chat] 开始发送流式消息:', content);
    
    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      createdAt: new Date()
    };
    
    // 创建初始的空助手消息
    const assistantMessageId = uuidv4();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      createdAt: new Date()
    };
    
    // 更新当前对话，添加用户消息和空的助手消息
    const updatedConversation = {
      ...currentConversation!,
      messages: [...currentConversation!.messages, userMessage, assistantMessage],
      updatedAt: new Date()
    };
    
    setCurrentConversation(updatedConversation);
    setStreaming(true);
    
    // 处理流式响应
    const streamHandler: StreamHandler = {
      onChunk: (chunk: string) => {
        console.log('[Chat] 收到消息块:', chunk);
        
        setCurrentConversation(prevConversation => {
          if (!prevConversation) return prevConversation;
          
          const updatedMessages = [...prevConversation.messages];
          const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
          
          if (assistantMessageIndex !== -1) {
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              content: updatedMessages[assistantMessageIndex].content + chunk
            };
          }
          
          return {
            ...prevConversation,
            messages: updatedMessages
          };
        });
      },
      onComplete: (fullResponse: string) => {
        console.log('[Chat] 流式消息接收完成, 完整响应:', fullResponse);
        
        setStreaming(false);
        cancelStreamRef.current = null;
        
        let messageContent = fullResponse;
        
        // 检查是否收到了JSON响应（可能是结构化数据）
        try {
          // 尝试解析为JSON，如果成功则可能是特殊格式的响应
          const jsonResponse = JSON.parse(fullResponse);
          console.log('[Chat] 检测到JSON响应:', jsonResponse);
          
          // 使用专门的函数处理推荐方案
          messageContent = handleRecommendationResponse(jsonResponse);
          
          // 更新助手消息内容为处理后的内容
          setCurrentConversation(prevConversation => {
            if (!prevConversation) return prevConversation;
            
            const updatedMessages = [...prevConversation.messages];
            const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
            
            if (assistantMessageIndex !== -1 && typeof messageContent === 'string') {
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: messageContent
              };
            }
            
            return {
              ...prevConversation,
              messages: updatedMessages
            };
          });
        } catch (e) {
          // 不是JSON，使用原始响应内容
          console.log('[Chat] 不是JSON响应，使用原始内容');
        }
        
        // 更新对话列表
        const finalAssistantMessage = {
          ...assistantMessage,
          content: typeof messageContent === 'string' ? messageContent : fullResponse
        };
        
        updateConversationsList(updatedConversation.id, updatedConversation, finalAssistantMessage);
      },
      onError: (error: Error) => {
        console.error('[Chat] 流式消息处理错误:', error);
        
        // 如果是开发环境，在出错时提供模拟响应
        if (isDevelopment) {
          console.warn('[Chat] 使用模拟数据替代错误响应');
          
          // 模拟数据以替代API响应
          setCurrentConversation(prevConversation => {
            if (!prevConversation) return prevConversation;
            
            const updatedMessages = [...prevConversation.messages];
            const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
            
            if (assistantMessageIndex !== -1) {
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: `[模拟响应] 我收到了你的消息: "${content}"。请问你的业务类型是什么？`
              };
            }
            
            return {
              ...prevConversation,
              messages: updatedMessages
            };
          });
        } else {
          setError(error.message);
        }
        
        setStreaming(false);
        cancelStreamRef.current = null;
      }
    };
    
    if (isDevelopment && FORCE_MOCK_CHAT) {
      // 开发模式且强制使用模拟数据：使用模拟流式响应
      console.log('[Chat] 使用模拟流式数据');
      const mockChunks = [
        '我收到了你的消息',
        '：',
        `"${content}"`,
        '。',
        '请问你的业务类型是什么？'
      ];
      
      cancelStreamRef.current = mockStreamResponse(mockChunks, streamHandler, 300);
    } else {
      // 使用实际流式API
      try {
        console.log('[Chat] 调用实际流式API');
        cancelStreamRef.current = chatApi.sendMessageStream({
          content,
          conversationId: currentConversation?.id
        }, streamHandler);
      } catch (err) {
        console.error('[Chat] 调用流式API初始化失败:', err);
        
        // 如果API调用失败，检查是否是开发环境，如果是则回退到模拟数据
        if (isDevelopment) {
          console.warn('[Chat] 回退到模拟数据');
          const mockChunks = [
            '[模拟响应] 我收到了',
            '你的消息：',
            `"${content}"`,
            '。',
            '请问你的业务类型是什么？'
          ];
          
          cancelStreamRef.current = mockStreamResponse(mockChunks, streamHandler, 300);
        } else {
          setError(err instanceof Error ? err.message : '发送消息失败');
          setStreaming(false);
        }
      }
    }
  };
  
  // 更新对话列表
  const updateConversationsList = (
    conversationId: string, 
    conversation: Conversation, 
    assistantMessage: Message
  ) => {
    const conversationExists = conversations.some(conv => conv.id === conversationId);
    
    if (!conversationExists) {
      const newSummary: ConversationSummary = {
        id: conversationId,
        title: conversation.title,
        lastMessagePreview: assistantMessage.content.substring(0, 50) + '...',
        createdAt: conversation.createdAt,
        updatedAt: new Date()
      };
      
      setConversations([newSummary, ...conversations]);
    } else {
      setConversations(conversations.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessagePreview: assistantMessage.content.substring(0, 50) + '...',
              updatedAt: new Date()
            }
          : conv
      ));
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

  // 处理推荐方案响应
  const handleRecommendationResponse = (jsonResponse: any) => {
    console.log('[Chat] 处理推荐方案响应:', jsonResponse);
    
    try {
      // 如果是JSON字符串，先解析它
      const data = typeof jsonResponse === 'string' ? JSON.parse(jsonResponse) : jsonResponse;
      
      // 如果存在消息内容
      if (data.message) {
        console.log('[Chat] 从响应中提取消息内容:', data.message);
      }
      
      // 如果存在推荐方案
      if (data.recommendation) {
        const recommendation = data.recommendation;
        console.log('[Chat] 设置推荐方案:', recommendation);
        
        // 设置推荐方案
        setRecommendedSolution(recommendation);
        
        // 根据业务类型和规模设置相应状态
        // 根据响应内容分析业务类型和规模，这是简化逻辑，实际应根据后端返回调整
        if (recommendation.name.includes('数据分析')) {
          setBusinessType('data');
          
          // 基于方案名称或描述猜测业务规模
          if (recommendation.name.includes('基础')) {
            setBusinessScale('small');
          } else {
            setBusinessScale('medium');
          }
        } else if (recommendation.name.includes('Web')) {
          setBusinessType('web');
          
          // 基于方案名称或描述猜测业务规模
          if (recommendation.name.includes('基础')) {
            setBusinessScale('small');
          } else {
            setBusinessScale('medium');
          }
        }
      }
      
      // 处理可能的建议选项
      if (data.suggestions && Array.isArray(data.suggestions)) {
        console.log('[Chat] 收到建议选项:', data.suggestions);
        // 这里可以将建议选项保存到状态中，供UI使用
      }
      
      // 如果有会话ID，更新当前会话ID
      if (data.conversation_id && currentConversation) {
        console.log('[Chat] 更新会话ID:', data.conversation_id);
        // 更新会话ID
        setCurrentConversation(prev => prev ? {
          ...prev,
          id: data.conversation_id
        } : null);
      }
      
      return data.message || jsonResponse;
    } catch (err) {
      console.error('[Chat] 处理推荐响应失败:', err);
      return jsonResponse;
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
    streaming,
    businessType,
    businessScale,
    recommendedSolution,
    sendMessage,
    sendStreamMessage,
    setBusinessType,
    setBusinessScale,
    getRecommendation,
    createNewConversation,
    loadConversation,
    updateConversationTitle,
    deleteConversation,
    cancelStreaming,
    useRealApi
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