import React from 'react';
import ProductSummaryItem from './ProductSummaryItem';

const SelectedProducts = ({ selectedProducts, removeProduct }) => {
  return (
    <div className="mb-4 max-h-64 overflow-y-auto">
      {selectedProducts.map(product => (
        <ProductSummaryItem 
          key={product.id} 
          product={product} 
          removeProduct={removeProduct} 
        />
      ))}
    </div>
  );
};

export default SelectedProducts;