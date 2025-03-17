// src/services/api.ts

import { 
  MessageRequest, 
  MessageResponse, 
  Conversation, 
  ConversationSummary, 
  FeedbackRequest, 
  FeedbackResponse 
} from '../types';

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// 开发模式标志
const isDevelopment = import.meta.env.DEV;

// 从本地存储读取API使用首选项
const getUseRealApi = (): boolean => {
  const API_PREF_KEY = 'azure_calculator_use_real_api';
  const savedPref = localStorage.getItem(API_PREF_KEY);
  return savedPref ? JSON.parse(savedPref) : true;
};

// 是否强制使用模拟数据（即使在开发模式下）
const FORCE_MOCK_CHAT = !getUseRealApi();

// 获取认证头
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// API错误处理
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// 处理API响应
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || `请求失败: ${response.status}`,
      response.status
    );
  }
  
  return response.json() as Promise<T>;
};

// 流式处理器接口
export interface StreamHandler {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

// 聊天API服务
export const chatApi = {
  // 发送消息
  sendMessage: async (message: MessageRequest): Promise<MessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(message)
    });
    
    return handleResponse<MessageResponse>(response);
  },
  
  // 修改sendMessageStream函数中的处理逻辑
  sendMessageStream: (message: MessageRequest, handler: StreamHandler): () => void => {
    let fullResponse = '';
    let abortController = new AbortController();
    let responseText = '';
    
    console.log('[API] 开始发送流式消息请求:', message);
    
    // 开始流式请求
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/messages/stream`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(message),
          signal: abortController.signal
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.detail || `请求失败: ${response.status}`,
            response.status
          );
        }
        
        if (!response.body) {
          throw new Error('响应体为空');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        console.log('[API] 开始读取流式响应');
        
        // 持续读取流
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('[API] 流式响应接收完成');
            handler.onComplete(fullResponse);
            break;
          }
          
          // 解码并处理数据块
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          console.log('[API] 收到原始数据块:', chunk);
          
          // 处理SSE格式的响应
          const lines = responseText.split('\n');
          
          // 处理除最后一行外的所有行
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('data: ')) {
              try {
                // 提取data:后面的JSON字符串
                const jsonStr = line.substring(6);
                console.log('[API] 解析SSE数据行:', jsonStr);
                
                // 尝试解析JSON
                const eventData = JSON.parse(jsonStr);
                
                // 检查是否有消息文本
                if (eventData.message) {
                  console.log('[API] 提取的消息内容:', eventData.message);
                  // 只发送文本部分作为块
                  handler.onChunk(eventData.message);
                }
                
                // 如果响应包含完整的推荐信息，作为最终响应处理
                if (eventData.recommendation) {
                  console.log('[API] 接收到包含推荐的完整响应');
                  fullResponse = jsonStr;
                  handler.onComplete(fullResponse);
                  return;
                }
              } catch (err) {
                console.error('[API] 解析SSE数据行出错:', err, line);
              }
            }
          }
          
          // 保留最后一行为下一次拼接
          responseText = lines[lines.length - 1];
        }
      } catch (error: unknown) {
        console.error('[API] 流式响应处理错误:', error);
        if (error instanceof Error && error.name !== 'AbortError') {
          handler.onError(error);
        } else if (error !== 'AbortError') {
          handler.onError(new Error(String(error)));
        }
      }
    })();
    
    // 返回取消函数
    return () => {
      console.log('[API] 取消流式请求');
      abortController.abort();
    };
  },
  
  // 获取对话列表
  getConversations: async (): Promise<ConversationSummary[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<ConversationSummary[]>(response);
  },
  
  // 获取特定对话及其消息
  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<Conversation>(response);
  },
  
  // 更新对话标题
  updateConversationTitle: async (conversationId: string, title: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });
    
    return handleResponse<void>(response);
  },
  
  // 删除对话
  deleteConversation: async (conversationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || `删除失败: ${response.status}`,
        response.status
      );
    }
  },
  
  // 发送反馈
  sendFeedback: async (feedback: FeedbackRequest): Promise<FeedbackResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/feedback/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedback)
    });
    
    return handleResponse<FeedbackResponse>(response);
  }
};

// 模拟API响应（开发阶段使用，连接真实后端后移除）
export const mockResponse = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// 模拟流式响应（开发阶段使用）
export const mockStreamResponse = (
  chunks: string[], 
  handler: StreamHandler, 
  chunkDelay = 300
): () => void => {
  let isCancelled = false;
  let fullResponse = '';
  
  // 模拟流式响应
  (async () => {
    try {
      for (const chunk of chunks) {
        if (isCancelled) break;
        
        await new Promise(resolve => setTimeout(resolve, chunkDelay));
        fullResponse += chunk;
        handler.onChunk(chunk);
      }
      
      if (!isCancelled) {
        handler.onComplete(fullResponse);
      }
    } catch (error) {
      if (!isCancelled) {
        handler.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  })();
  
  // 返回取消函数
  return () => {
    isCancelled = true;
  };
};