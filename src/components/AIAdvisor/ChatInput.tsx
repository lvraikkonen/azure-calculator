// src/components/AIAdvisor/ChatInput.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';

interface ChatInputProps {
  useStreaming?: boolean;
}

// 开发模式标志
const isDevelopment = import.meta.env.DEV;

// 使用本地存储保存API使用首选项
const API_PREF_KEY = 'azure_calculator_use_real_api';

const ChatInput: React.FC<ChatInputProps> = ({ useStreaming = true }) => {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, sendStreamMessage, streaming, thinking, useRealApi } = useChatContext();
  const [localUseRealApi, setLocalUseRealApi] = useState(useRealApi);
  
  // 当切换API使用首选项时保存到localStorage
  useEffect(() => {
    if (localUseRealApi !== useRealApi) {
      localStorage.setItem(API_PREF_KEY, JSON.stringify(localUseRealApi));
      // 触发刷新以应用新设置
      window.location.reload();
    }
  }, [localUseRealApi, useRealApi]);
  
  const isDisabled = streaming || thinking;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isDisabled) {
      // 获取消息内容，然后清空输入框
      const message = inputValue.trim();
      setInputValue('');
      
      // 发送消息，根据配置选择流式或普通发送
      if (useStreaming) {
        await sendStreamMessage(message);
      } else {
        await sendMessage(message);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-3">
      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          placeholder={isDisabled ? "请等待AI回复..." : "输入你的具体需求..."} 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isDisabled}
          className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDisabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
          }`}
        />
        <button 
          type="submit"
          disabled={isDisabled || !inputValue.trim()}
          className={`absolute right-3 top-2 ${
            isDisabled || !inputValue.trim() 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:text-blue-800'
          }`}
          aria-label="发送消息"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {streaming 
            ? "AI正在回复中..." 
            : "提示：描述你的具体业务需求，AI将为你推荐解决方案"}
        </div>
        
        {isDevelopment && (
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <span className="text-xs text-gray-500 mr-2">使用实际API</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={localUseRealApi} 
                  onChange={() => setLocalUseRealApi(!localUseRealApi)}
                />
                <div className={`block w-8 h-4 rounded-full ${localUseRealApi ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${localUseRealApi ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;