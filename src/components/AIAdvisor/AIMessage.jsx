import React from 'react';

const AIMessage = ({ children }) => {
  return (
    <div className="flex items-start">
      <div className="bg-blue-100 rounded-lg rounded-tl-none p-3 max-w-3/4 text-gray-800">
        {children}
      </div>
    </div>
  );
};

export default AIMessage;