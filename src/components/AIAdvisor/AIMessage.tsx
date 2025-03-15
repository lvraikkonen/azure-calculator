import React, { ReactNode } from 'react';

interface AIMessageProps {
  children: ReactNode;
  isStreaming?: boolean;
}

const AIMessage: React.FC<AIMessageProps> = ({ children, isStreaming = false }) => {
  return (
    <div className="flex items-start">
      <div className={`bg-blue-100 rounded-lg rounded-tl-none p-3 max-w-3/4 text-gray-800 ${
        isStreaming ? 'border-l-4 border-blue-400 animate-pulse' : ''
      }`}>
        {children}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-600 animate-blink">
            |
          </span>
        )}
      </div>
    </div>
  );
};

export default AIMessage;