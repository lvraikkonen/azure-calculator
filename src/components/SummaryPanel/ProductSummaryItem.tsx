import React, { useEffect, useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { SelectedProduct } from '../../types';
import { formatPrice } from '../../services/format';
import { useAppContext } from '../../context/AppContext';

interface ProductSummaryItemProps {
  product: SelectedProduct;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
}

const ProductSummaryItem: React.FC<ProductSummaryItemProps> = ({ 
  product, 
  removeProduct,
  updateQuantity
}) => {
  const { userSettings } = useAppContext();
  const [highlight, setHighlight] = useState(false);
  
  // 检测产品是否是新添加的
  useEffect(() => {
    if ('isNew' in product && product.isNew) {
      setHighlight(true);
      
      // 2秒后移除高亮
      const timer = setTimeout(() => {
        setHighlight(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [product]);
  
  return (
    <div className={`flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 transition-colors duration-500 ${
      highlight ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    }`}>
      <div className="flex-1">
        <div className="font-medium dark:text-white">{product.name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatPrice(product.price, userSettings)} × {product.quantity}
        </div>
      </div>
      
      <div className="flex items-center mr-2">
        <div className="flex flex-col mx-1">
          <button 
            onClick={() => updateQuantity(product.id, product.quantity + 1)}
            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            aria-label="增加数量"
          >
            <ChevronUp size={14} />
          </button>
          <button 
            onClick={() => updateQuantity(product.id, product.quantity - 1)}
            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            aria-label="减少数量"
            disabled={product.quantity <= 1}
          >
            <ChevronDown size={14} />
          </button>
        </div>
        
        <div className={`font-bold min-w-16 text-right dark:text-white ${
          highlight ? 'text-blue-600 dark:text-blue-400' : ''
        }`}>
          {formatPrice(product.price * product.quantity, userSettings)}
        </div>
      </div>
      
      <button 
        onClick={() => removeProduct(product.id)}
        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
        aria-label="移除产品"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ProductSummaryItem;