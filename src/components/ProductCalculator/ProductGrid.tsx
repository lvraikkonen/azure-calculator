import React from 'react';
import ProductCard from './ProductCard';
import { AzureProduct, SelectedProduct } from '../../types';

interface ProductGridProps {
  filteredProducts: AzureProduct[];
  addProduct: (product: AzureProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  selectedProducts: SelectedProduct[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  filteredProducts, 
  addProduct, 
  updateQuantity, 
  selectedProducts 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProducts.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          addProduct={addProduct}
          updateQuantity={updateQuantity}
          selectedProducts={selectedProducts}
        />
      ))}
    </div>
  );
};

export default ProductGrid;