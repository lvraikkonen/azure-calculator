import { 
  MessageRequest, 
  MessageResponse, 
  Conversation, 
  ConversationSummary, 
  FeedbackRequest, 
  FeedbackResponse 
} from '../types';

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 获取认证头
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// API错误处理
class ApiError extends Error {
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