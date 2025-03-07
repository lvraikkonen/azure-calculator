import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

const ProductCard = ({ product, addProduct, updateQuantity, selectedProducts }) => {
  const isSelected = selectedProducts.some(p => p.id === product.id);
  const selectedQuantity = isSelected ? 
    selectedProducts.find(p => p.id === product.id).quantity : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="font-medium text-lg mb-1">{product.name}</div>
      <div className="text-sm text-gray-600 mb-2 h-10">{product.description}</div>
      <div className="font-bold text-blue-600 mb-2">${product.price.toFixed(2)}/月</div>
      
      {isSelected ? (
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={() => updateQuantity(product.id, selectedQuantity - 1)}
            className="text-blue-600 hover:text-blue-800"
          >
            <MinusCircle size={20} />
          </button>
          
          <span className="mx-2 font-medium">
            {selectedQuantity}
          </span>
          
          <button 
            onClick={() => updateQuantity(product.id, selectedQuantity + 1)}
            className="text-blue-600 hover:text-blue-800"
          >
            <PlusCircle size={20} />
          </button>
          
          <div className="ml-4 text-sm font-bold">
            ${(selectedQuantity * product.price).toFixed(2)}
          </div>
        </div>
      ) : (
        <button 
          onClick={() => addProduct(product)}
          className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700"
        >
          添加
        </button>
      )}
    </div>
  );
};

export default ProductCard;