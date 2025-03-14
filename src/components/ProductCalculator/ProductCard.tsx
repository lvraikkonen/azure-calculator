import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { AzureProduct, SelectedProduct } from '../../types';
import { formatPrice } from '../../services/format';
import { useAppContext } from '../../context/AppContext';

interface ProductCardProps {
  product: AzureProduct;
  addProduct: (product: AzureProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  selectedProducts: SelectedProduct[];
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  addProduct, 
  updateQuantity, 
  selectedProducts 
}) => {
  const { userSettings } = useAppContext();
  const isSelected = selectedProducts.some(p => p.id === product.id);
  const selectedProduct = selectedProducts.find(p => p.id === product.id);
  const selectedQuantity = selectedProduct ? selectedProduct.quantity : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="font-medium text-lg mb-1 dark:text-white">{product.name}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 h-10 overflow-hidden">{product.description}</div>
      <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">{formatPrice(product.price, userSettings)}/月</div>
      
      {isSelected ? (
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={() => updateQuantity(product.id, selectedQuantity - 1)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            aria-label="减少数量"
          >
            <MinusCircle size={20} />
          </button>
          
          <span className="mx-2 font-medium dark:text-white">
            {selectedQuantity}
          </span>
          
          <button 
            onClick={() => updateQuantity(product.id, selectedQuantity + 1)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            aria-label="增加数量"
          >
            <PlusCircle size={20} />
          </button>
          
          <div className="ml-4 text-sm font-bold dark:text-white">
            {formatPrice(selectedQuantity * product.price, userSettings)}
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