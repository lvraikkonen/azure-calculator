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
  onStructuredData?: (data: any) => void; // 处理结构化数据(推荐、建议等)
  onConversationId?: (conversationId: string) => void; // 单独处理会话ID的回调
}

// 聊天API服务
export const chatApi = {
  // 发送消息
  sendMessage: async (message: MessageRequest): Promise<MessageResponse> => {
    // 创建修正的请求对象
    const correctedMessage = {
      content: message.content,
      conversation_id: message.conversationId,
      conversationId: message.conversationId,
      context: message.context || {}
    };
    
    const response = await fetch(`${API_BASE_URL}/chat/messages/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(correctedMessage)
    });
    
    const responseData = await handleResponse<MessageResponse>(response);
    console.log("DEBUG - 收到响应，conversationId:", responseData.conversationId);
    return responseData;
  },
  
  // 修改sendMessageStream函数中的处理逻辑
  sendMessageStream: (message: MessageRequest, handler: StreamHandler): () => void => {
    // 添加特殊调试日志，检查参数名称
    console.log('[API-DEBUG] 请求参数检查:', message);
    console.log('[API-DEBUG] conversationId 参数存在:', message.hasOwnProperty('conversationId'));
    
    const correctedMessage = {
      content: message.content,
      // 同时传递两种格式，确保至少一个能被后端识别
      conversation_id: message.conversationId,
      conversationId: message.conversationId,
      context: message.context || {}
    };
    
    console.log('[API-DEBUG] 修正后的请求参数:', correctedMessage);let fullResponse = '';
    let abortController = new AbortController();
    let buffer = '';
    
    // 明确记录请求信息，特别是会话ID
    console.log('[API] 发送流式消息请求:', message, '会话ID:', message.conversationId);
    
    // 开始流式请求
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/messages/stream`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(correctedMessage),
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
          fullResponse += chunk;
          buffer += chunk;
          
          // 处理完整的数据行
          const lines = buffer.split('\n');
          // 保留最后一行(可能不完整)到buffer中
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                // 提取data:后面的内容
                const content = trimmedLine.substring(6);
                console.log('[API] 收到SSE数据行:', content);
                
                // 尝试解析JSON
                try {
                  const jsonData = JSON.parse(content);
                  
                  if (jsonData.conversation_id) {
                    console.log('[API] 从流式响应中提取到会话ID:', jsonData.conversation_id);
                    // 调用专门处理会话ID的回调
                    handler.onConversationId?.(jsonData.conversation_id);
                  }
                  
                  // 提取消息文本部分并发送（仅在有文本内容时）
                  const hasTextContent = extractAndSendMessageText(jsonData, handler);
                  
                  // 如果有结构化数据，单独处理
                  if (jsonData.recommendation || jsonData.suggestions) {
                    handler.onStructuredData?.(jsonData);
                  }
                } catch (jsonError) {
                  // 如果不是有效的JSON，直接发送原始内容
                  console.error('[API] JSON解析错误:', jsonError);
                  if (!content.startsWith('{')) {
                    handler.onChunk(content);
                  }
                }
              } catch (e) {
                console.error('[API] 处理数据行失败:', e);
              }
            }
          }
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
    
    // 辅助函数：从各种响应格式中提取消息文本
    function extractAndSendMessageText(data: any, handler: StreamHandler) {
      // 检测是否是JSON格式的字符串响应
      if (typeof data === 'string' && data.trim().startsWith('{') && data.includes('"message"')) {
        try {
          // 尝试解析为JSON
          const jsonData = JSON.parse(data);
          // 仅发送message字段的内容
          if (jsonData.message) {
            handler.onChunk(jsonData.message);
            return true;
          }
        } catch (e) {
          // 解析失败，将其视为普通文本
          handler.onChunk(data);
          return true;
        }
      }
      
      // 如果有直接的message字段
      if (data.message && typeof data.message === 'string') {
        handler.onChunk(data.message);
        return true;
      }
      
      // 嵌套在content中的message
      if (data.content && typeof data.content === 'string') {
        try {
          // 尝试解析content是否为JSON
          const contentJson = JSON.parse(data.content);
          if (contentJson.message && typeof contentJson.message === 'string') {
            handler.onChunk(contentJson.message);
            return true;
          }
        } catch (e) {
          // 如果content不是JSON但可能包含JSON字符串
          if (data.content.includes('{') && data.content.includes('"message"')) {
            const jsonMatch = data.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const extractedJson = JSON.parse(jsonMatch[0]);
                if (extractedJson.message) {
                  handler.onChunk(extractedJson.message);
                  return true;
                }
              } catch (err) {
                // 解析失败，继续下一步
              }
            }
          }
          
          // 如果上述尝试都失败，判断content是否是JSON字符串本身
          if (data.content.startsWith('{') && data.content.endsWith('}')) {
            // 这可能是一个完整的JSON字符串，不要直接显示
            // 而是尝试提取其中的message字段
            try {
              const jsonContent = JSON.parse(data.content);
              if (jsonContent.message) {
                handler.onChunk(jsonContent.message);
                return true;
              }
            } catch (jsonError) {
              // JSON解析失败，可能不是有效的JSON
            }
          } else {
            // 不是JSON，直接发送content作为消息
            handler.onChunk(data.content);
            return true;
          }
        }
      }
      
      // 如果是完整的JSON对象但没有message字段，不显示任何内容
      // 这种情况下可能只包含recommendation或suggestions
      if (typeof data === 'object' && 
          (data.recommendation || data.suggestions) && 
          !data.message) {
        return false;
      }
      
      // 默认情况：如果是简单字符串，则直接显示
      if (typeof data === 'string' && !data.startsWith('{')) {
        handler.onChunk(data);
        return true;
      }
      
      return false;
    }
    
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