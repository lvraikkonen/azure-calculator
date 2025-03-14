import React from 'react';

const ThinkingAnimation: React.FC = () => {
  return (
    <div className="flex items-start">
      <div className="bg-blue-100 rounded-lg rounded-tl-none p-3 max-w-3/4 flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        <span className="text-sm text-gray-500">分析您的需求中...</span>
      </div>
    </div>
  );
};

export default ThinkingAnimation;