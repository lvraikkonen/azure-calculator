import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  Conversation, 
  ConversationSummary,
  BusinessType,
  BusinessScale,
  AzureSolution,
  AzureSolutionProduct
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
  
  // 新增：建议相关属性
  suggestions: string[];
  
  // 操作函数
  sendMessage: (content: string) => Promise<void>;
  sendStreamMessage: (content: string) => Promise<void>;
  sendSuggestion: (suggestion: string) => Promise<void>; // 新增
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
  
  // 建议问题状态
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
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
  
  // 发送建议问题
  const sendSuggestion = async (suggestion: string) => {
    await sendMessage(suggestion);
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
  
  // 处理推荐方案和建议问题
  const processStructuredData = (data: any) => {
    let processedData = { ...data };
    delete processedData.content; // 移除content字段，避免重复处理
    // 提取和处理推荐方案
    if (data.recommendation) {
      try {
        // 确保推荐方案格式正确
        const recommendation: AzureSolution = {
          name: data.recommendation.name || "Azure推荐方案",
          description: data.recommendation.description || "基于您的需求定制的Azure云服务组合",
          products: []
        };
        
        // 处理产品列表，确保每个产品都有必要的字段
        if (Array.isArray(data.recommendation.products)) {
          recommendation.products = data.recommendation.products.map((product: any) => {
            // 确保每个产品对象都有必要的字段
            const processedProduct: AzureSolutionProduct = {
              id: product.id || `product-${Math.random().toString(36).substring(2, 9)}`,
              name: product.name || "Azure服务",
              quantity: typeof product.quantity === 'number' ? product.quantity : 
                      (parseInt(product.quantity) || 1)
            };
            return processedProduct;
          });
        }
        
        console.log('[Chat] 处理后的推荐方案:', recommendation);
        
        // 设置推荐方案状态
        setRecommendedSolution(recommendation);
        
        // 根据推荐方案名称自动推断业务类型和规模（如果尚未设置）
        if (!businessType || !businessScale) {
          if (recommendation.name.includes('数据分析') || recommendation.name.includes('数据处理')) {
            setBusinessType('data');
          } else if (recommendation.name.includes('Web') || recommendation.name.includes('网站')) {
            setBusinessType('web');
          }
          
          if (recommendation.name.includes('基础') || recommendation.name.includes('小型')) {
            setBusinessScale('small');
          } else if (recommendation.name.includes('标准') || recommendation.name.includes('中型')) {
            setBusinessScale('medium');
          }
        }
      } catch (error) {
        console.error('[Chat] 处理推荐方案时出错:', error);
        // 错误时不更新状态，保持现有推荐方案
      }
    }
    
    // 处理建议问题
    if (data.suggestions) {
      try {
        // 确保建议是一个数组
        if (Array.isArray(data.suggestions)) {
          // 过滤掉空字符串，并限制最多显示5个建议
          const processedSuggestions = data.suggestions
            .filter((suggestion: any) => typeof suggestion === 'string' && suggestion.trim() !== '')
            .slice(0, 5);
          
          console.log('[Chat] 处理后的建议问题:', processedSuggestions);
          
          // 设置建议问题状态
          setSuggestions(processedSuggestions);
        }
      } catch (error) {
        console.error('[Chat] 处理建议问题时出错:', error);
        // 错误时清空建议列表
        setSuggestions([]);
      }
    }
    
    // 处理对话ID
    if (data.conversation_id) {
      try {
        const conversationId = data.conversation_id.toString();
        setCurrentConversation(prev => prev ? {...prev, id: conversationId} : prev);
      } catch (error) {
        console.error('[Chat] 处理对话ID时出错:', error);
      }
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
        
        // 确保收到的消息块不是空字符串
        if (chunk.trim() === '') return;
        
        setCurrentConversation(prevConversation => {
          if (!prevConversation) return prevConversation;
          
          const updatedMessages = [...prevConversation.messages];
          const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
          
          if (assistantMessageIndex !== -1) {
            // 直接追加消息块，实现打字机效果
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
      
      onStructuredData: (data: any) => {
        console.log('[Chat] 收到结构化数据:', data);
        
        // 尝试处理各种可能的响应格式
        let processData = { ...data };
        
        // 尝试从嵌套JSON中提取数据
        if (data.content && typeof data.content === 'string') {
          try {
            const contentJson = JSON.parse(data.content);
            // 合并顶层数据和content中的数据
            processData = { ...processData, ...contentJson };
          } catch (e) {
            console.error('[Chat] 解析嵌套JSON失败:', e);
          }
        }
        
        // 使用统一的处理函数处理结构化数据
        processStructuredData(processData);
      },
      
      onComplete: (fullResponse: string) => {
        console.log('[Chat] 流式消息接收完成, 完整响应:', fullResponse);
        
        setStreaming(false);
        cancelStreamRef.current = null;
        
        // 尝试清理最终显示的消息，移除任何JSON结构
        setCurrentConversation(prevConversation => {
          if (!prevConversation) return prevConversation;
          
          const updatedMessages = [...prevConversation.messages];
          const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
          
          if (assistantMessageIndex !== -1) {
            const currentContent = updatedMessages[assistantMessageIndex].content;
            let cleanedContent = currentContent;
            
            // 检查内容是否是JSON或包含JSON
            if (currentContent.trim().startsWith('{') && currentContent.includes('"message"')) {
              try {
                // 尝试解析为JSON并提取message
                const jsonContent = JSON.parse(currentContent);
                if (jsonContent.message) {
                  // 替换为纯文本消息
                  cleanedContent = jsonContent.message;
                }
              } catch (e) {
                // 解析失败，可能只是部分JSON或格式不正确
                // 尝试用正则表达式提取message字段
                const messageMatch = currentContent.match(/"message"\s*:\s*"([\s\S]*?)(?:"|$)(?=\s*,|\s*})/);
                if (messageMatch && messageMatch[1]) {
                  // 替换为提取的消息
                  cleanedContent = messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                }
              }
            }
            
            // 更新消息内容
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              content: cleanedContent
            };
          }
          
          return {
            ...prevConversation,
            messages: updatedMessages
          };
        });
        
        // 尝试从完整响应中解析结构化数据
        try {
          let jsonResponse;
          if (fullResponse.startsWith('{')) {
            jsonResponse = JSON.parse(fullResponse);
          } else if (fullResponse.includes('{') && fullResponse.includes('}')) {
            // 尝试提取JSON部分
            const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonResponse = JSON.parse(jsonMatch[0]);
            }
          }
          
          if (jsonResponse) {
            console.log('[Chat] 从完整响应中提取到JSON:', jsonResponse);
            streamHandler.onStructuredData?.(jsonResponse);
          }
        } catch (e) {
          console.log('[Chat] 完整响应解析JSON失败:', e);
        }
        
        // 更新对话列表 - 使用清理后的消息
        setTimeout(() => {
          const cleanedAssistantMessage = {
            ...assistantMessage,
            content: currentConversation?.messages.find(m => m.id === assistantMessageId)?.content || ''
          };
          
          updateConversationsList(updatedConversation.id, updatedConversation, cleanedAssistantMessage);
        }, 50); // 短暂延时确保状态已更新
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
    suggestions,
    sendMessage,
    sendStreamMessage,
    sendSuggestion,
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