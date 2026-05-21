import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { ProductCard as ProductCardType } from '@/types/api';

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const imageUrl = product.imageUrl?.replace(/^\//, '').startsWith('products/') ? null : product.imageUrl;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-white border border-gray-200 hover:border-red-600 transition-colors"
      aria-label={`${product.name}, бренд ${product.brand.name}`}
    >
      <div className="aspect-square relative bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Нет изображения
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Нет в наличии</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">{product.brand.name}</div>
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline justify-between pt-2">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </div>
          {lowStock && (
            <div className="text-xs text-red-600 font-medium">
              Осталось {product.stock} шт.
            </div>
          )}
        </div>

        {inStock && (
          <div className="text-sm text-green-600 font-medium">В наличии</div>
        )}
      </div>
    </Link>
  );
}
