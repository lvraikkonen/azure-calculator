import React from 'react';
import ProductSummaryItem from './ProductSummaryItem';
import { SelectedProduct } from '../../types';

interface SelectedProductsProps {
  selectedProducts: SelectedProduct[];
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
}

const SelectedProducts: React.FC<SelectedProductsProps> = ({ 
  selectedProducts, 
  removeProduct,
  updateQuantity
}) => {
  return (
    <div className="mb-4 max-h-64 overflow-y-auto">
      {selectedProducts.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          暂无选择的产品
        </div>
      ) : (
        selectedProducts.map(product => (
          <ProductSummaryItem 
            key={product.id} 
            product={product} 
            removeProduct={removeProduct}
            updateQuantity={updateQuantity}
          />
        ))
      )}
    </div>
  );
};

export default SelectedProducts;