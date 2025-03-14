import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <button 
        className={`px-4 py-3 font-medium ${activeTab === 'calculator' 
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        onClick={() => setActiveTab('calculator')}
      >
        产品计算器
      </button>
      <button 
        className={`px-4 py-3 font-medium ${activeTab === 'advisor' 
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        onClick={() => setActiveTab('advisor')}
      >
        AI 解决方案顾问
      </button>
    </div>
  );
};

export default TabNavigation;