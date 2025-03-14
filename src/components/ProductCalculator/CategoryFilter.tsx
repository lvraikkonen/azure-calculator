import React from 'react';

interface CategoryFilterProps {
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  filterCategory, 
  setFilterCategory 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        产品类别筛选
      </label>
      <select 
        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-gray-900 dark:text-white"
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="all">所有类别</option>
        <option value="compute">计算</option>
        <option value="storage">存储</option>
        <option value="database">数据库</option>
        <option value="networking">网络</option>
        <option value="data">数据分析</option>
      </select>
    </div>
  );
};

export default CategoryFilter;