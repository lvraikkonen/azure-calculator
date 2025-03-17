// 产品相关类型定义
export interface AzureProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'compute' | 'storage' | 'database' | 'networking' | 'data';
  quantity?: number;
}

export interface SelectedProduct extends AzureProduct {
  quantity: number;
}

// AI解决方案相关类型定义
export interface AzureSolutionProduct {
  id: string;
  name: string;
  quantity: number;
}

export interface AzureSolution {
  name: string;
  description: string;
  products: AzureSolutionProduct[];
}

export type BusinessType = 'web' | 'data' | '';
export type BusinessScale = 'small' | 'medium' | '';

// 聊天相关类型定义
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessagePreview: string;
  createdAt: Date;
  updatedAt: Date;
}

// API相关类型定义
export interface MessageRequest {
  content: string;
  conversationId?: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  role: 'assistant';
  createdAt: string;
  conversationId: string;
}

export interface FeedbackRequest {
  messageId: string;
  feedbackType: 'thumbsUp' | 'thumbsDown';
  comment?: string;
}

export interface FeedbackResponse extends FeedbackRequest {
  id: string;
  createdAt: string;
}