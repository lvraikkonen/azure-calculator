import React from 'react';
import { Download } from 'lucide-react';

const ExportButton = ({ selectedProducts, totalMonthly }) => {
  const handleExport = () => {
    // 准备CSV数据
    const headers = ['产品名称', '月度单价', '数量', '月度小计'];
    
    const rows = selectedProducts.map(product => [
      product.name,
      `¥${product.price.toFixed(2)}`,
      product.quantity,
      `¥${(product.price * product.quantity).toFixed(2)}`
    ]);
    
    // 添加总计行
    rows.push(['', '', '月度总计', `¥${totalMonthly.toFixed(2)}`]);
    rows.push(['', '', '年度总计', `¥${(totalMonthly * 12).toFixed(2)}`]);
    
    // 转换为CSV格式
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 设置文件名和下载属性
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `Azure费用估算_${formattedDate}.csv`);
    
    // 模拟点击下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleExport}
      className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
    >
      <Download size={16} className="mr-2" />
      导出估算
    </button>
  );
};

export default ExportButton;