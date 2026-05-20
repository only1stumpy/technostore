import type { ProductCard as ProductCardType } from '@/types/api';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductCardType[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4 text-gray-300">□</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
