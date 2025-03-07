import React, { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import { azureProducts } from '../../data/azureProducts';

const ProductCalculator = ({ addProduct, updateQuantity, selectedProducts }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  
  const filteredProducts = filterCategory === 'all' 
    ? azureProducts 
    : azureProducts.filter(p => p.category === filterCategory);

  return (
    <div>
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