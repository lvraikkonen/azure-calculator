import React, { ReactNode } from 'react';

interface AIMessageProps {
  children: ReactNode;
}

const AIMessage: React.FC<AIMessageProps> = ({ children }) => {
  return (
    <div className="flex items-start">
      <div className="bg-blue-100 rounded-lg rounded-tl-none p-3 max-w-3/4 text-gray-800">
        {children}
      </div>
    </div>
  );
};

export default AIMessage;