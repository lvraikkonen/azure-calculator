import React, { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import { azureProducts } from '../../data/azureProducts';
import { useAppContext } from '../../context/AppContext';

const ProductCalculator: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { addProduct, updateQuantity, selectedProducts } = useAppContext();
  
  const filteredProducts = filterCategory === 'all' 
    ? azureProducts 
    : azureProducts.filter(p => p.category === filterCategory);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold mb-4 dark:text-white">Azure 云产品选择</h2>
      
      <CategoryFilter 
        filterCategory={filterCategory} 
        setFilterCategory={setFilterCategory} 
      />
      
      <ProductGrid 
        filteredProducts={filteredProducts}
        addProduct={addProduct}
        updateQuantity={updateQuantity}
        selectedProducts={selectedProducts}
      />
    </div>
  );
};

export default ProductCalculator;