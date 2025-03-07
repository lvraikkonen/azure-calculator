import React, { useState } from 'react';

const ChatInput = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="border-t border-gray-200 p-3">
      <div className="relative">
        <input 
          type="text" 
          placeholder="输入你的具体需求..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button className="absolute right-3 top-2 text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div className="flex justify-center mt-2">
        <div className="text-xs text-gray-500">提示：描述你的具体业务需求，AI将为你推荐解决方案</div>
      </div>
    </div>
  );
};

export default ChatInput;