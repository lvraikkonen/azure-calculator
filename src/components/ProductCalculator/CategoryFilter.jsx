import React from 'react';

const CategoryFilter = ({ filterCategory, setFilterCategory }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        产品类别筛选
      </label>
      <select 
        className="w-full p-2 border border-gray-300 rounded-md"
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