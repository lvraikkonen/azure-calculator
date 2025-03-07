import React from 'react';
import { X } from 'lucide-react';

const ProductSummaryItem = ({ product, removeProduct }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <div className="flex-1">
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-gray-500">
          ${product.price.toFixed(2)} × {product.quantity}
        </div>
      </div>
      <div className="font-bold mr-2">
        ${(product.price * product.quantity).toFixed(2)}
      </div>
      <button 
        onClick={() => removeProduct(product.id)}
        className="text-gray-400 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ProductSummaryItem;