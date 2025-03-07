import React from 'react';

const TotalCosts = ({ totalMonthly }) => {
  return (
    <div className="py-2 border-t border-gray-200">
      <div className="flex justify-between py-1">
        <div className="font-medium">月度总费用：</div>
        <div className="font-bold text-blue-600">${totalMonthly.toFixed(2)}</div>
      </div>
      <div className="flex justify-between py-1">
        <div className="font-medium">年度总费用 (估算)：</div>
        <div className="font-bold text-blue-800">${(totalMonthly * 12).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default TotalCosts;