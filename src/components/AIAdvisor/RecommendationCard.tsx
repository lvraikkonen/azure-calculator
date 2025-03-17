import React from 'react';
import { AzureSolution } from '../../types';

interface RecommendationCardProps {
  recommendation: AzureSolution;
  onApply: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onApply 
}) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
      <h3 className="font-bold text-blue-800 text-lg mb-2">{recommendation.name}</h3>
      <p className="text-gray-700 mb-3 text-sm">{recommendation.description}</p>
      
      <h4 className="font-medium text-gray-700 mb-1 text-sm">包含的服务：</h4>
      <ul className="list-disc pl-5 mb-3">
        {recommendation.products.map(product => (
          <li key={product.id} className="text-gray-600 text-sm">
            <span className="font-medium">{product.name}</span> × {product.quantity}
          </li>
        ))}
      </ul>
      
      <button 
        onClick={onApply}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center text-sm transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        应用此解决方案
      </button>
    </div>
  );
};

export default RecommendationCard;