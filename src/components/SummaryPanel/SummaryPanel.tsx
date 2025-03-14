import React from 'react';
import SelectedProducts from './SelectedProducts';
import TotalCosts from './TotalCosts';
import ExportButton from './ExportButton';
import { SelectedProduct } from '../../types';

interface SummaryPanelProps {
  selectedProducts: SelectedProduct[];
  totalMonthly: number;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ 
  selectedProducts, 
  totalMonthly, 
  removeProduct,
  updateQuantity
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-fit sticky top-4">
      <h2 className="text-lg font-bold mb-3 pb-2 border-b border-gray-200">费用摘要</h2>
      
      {selectedProducts.length > 0 ? (
        <>
          <SelectedProducts 
            selectedProducts={selectedProducts} 
            removeProduct={removeProduct} 
            updateQuantity={updateQuantity}
          />
          <TotalCosts totalMonthly={totalMonthly} />
          <ExportButton 
            selectedProducts={selectedProducts} 
            totalMonthly={totalMonthly} 
          />
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>尚未选择任何产品</p>
          <p className="text-sm mt-2">从左侧添加产品以查看费用估算</p>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;