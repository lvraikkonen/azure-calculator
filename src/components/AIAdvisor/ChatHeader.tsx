import React from 'react';

interface ChatHeaderProps {
  isStreaming?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isStreaming = false }) => {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-white p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
            <path d="M21.2 8.4c.5.9.8 1.9.8 3" />
            <path d="M12 2c1.2 0 2.4.3 3.4.7" />
            <path d="M16.7 3.5c1 .6 1.9 1.4 2.6 2.3" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-lg">Azure AI 解决方案顾问</h2>
          <p className="text-xs text-blue-100">由Azure AI技术提供支持</p>
        </div>
      </div>
      
      {isStreaming && (
        <div className="flex items-center">
          <span className="text-xs bg-blue-700 text-white px-2 py-1 rounded-full animate-pulse">
            AI正在回复...
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;