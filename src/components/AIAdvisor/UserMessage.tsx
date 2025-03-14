import React, { ReactNode } from 'react';

interface UserMessageProps {
  children: ReactNode;
}

const UserMessage: React.FC<UserMessageProps> = ({ children }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white rounded-lg rounded-tr-none p-3 max-w-3/4">
        {children}
      </div>
    </div>
  );
};

export default UserMessage;