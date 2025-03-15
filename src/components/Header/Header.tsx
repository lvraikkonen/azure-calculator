import React, { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import UserSettings from '../UserSettings/UserSettings';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-2xl font-bold mr-2">Microsoft Azure</div>
          <div className="text-xl">云产品计算器</div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 用户设置按钮 */}
          <div className="bg-white rounded-full p-2 text-gray-600 hover:text-blue-800 cursor-pointer">
            <UserSettings />
          </div>
          
          {/* 用户信息 */}
          <div className="relative">
            <button
              onClick={toggleUserDropdown}
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 rounded-full px-3 py-1.5"
            >
              <User size={18} />
              <span>{user?.username || 'User'}</span>
            </button>
            
            {/* 用户下拉菜单 */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <div className="font-semibold">{user?.username}</div>
                    <div className="text-gray-500 text-xs truncate">{user?.email}</div>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;