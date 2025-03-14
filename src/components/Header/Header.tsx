import React from 'react';
import UserSettings from '../UserSettings/UserSettings';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-2xl font-bold mr-2">Microsoft Azure</div>
          <div className="text-xl">云产品计算器</div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-white rounded-full p-2">
            <UserSettings />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;