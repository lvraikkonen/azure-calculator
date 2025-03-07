import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200 bg-white shadow-sm">
      <button 
        className={`px-4 py-3 font-medium ${activeTab === 'calculator' 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => setActiveTab('calculator')}
      >
        产品计算器
      </button>
      <button 
        className={`px-4 py-3 font-medium ${activeTab === 'advisor' 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => setActiveTab('advisor')}
      >
        AI 解决方案顾问
      </button>
    </div>
  );
};

export default TabNavigation;