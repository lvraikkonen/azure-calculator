import React from 'react';
import { formatPrice } from '../../services/format';
import { useAppContext } from '../../context/AppContext';

interface TotalCostsProps {
  totalMonthly: number;
}

const TotalCosts: React.FC<TotalCostsProps> = ({ totalMonthly }) => {
  const { userSettings } = useAppContext();
  
  return (
    <div className="py-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between py-1">
        <div className="font-medium dark:text-white">月度总费用：</div>
        <div className="font-bold text-blue-600 dark:text-blue-400">
          {formatPrice(totalMonthly, userSettings)}
        </div>
      </div>
      <div className="flex justify-between py-1">
        <div className="font-medium dark:text-white">年度总费用 (估算)：</div>
        <div className="font-bold text-blue-800 dark:text-blue-300">
          {formatPrice(totalMonthly * 12, userSettings)}
        </div>
      </div>
    </div>
  );
};

export default TotalCosts;