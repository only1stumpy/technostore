import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { CompareButton } from '@/components/product/CompareButton';
import { FavoriteButton } from '@/components/product/FavoriteButton';
import { RatingSummary } from '@/components/product/RatingSummary';
import type { ProductCard as ProductCardType } from '@/types/api';

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const imageUrl = product.imageUrl?.replace(/^\//, '').startsWith('products/') ? null : product.imageUrl;

  return (
    <div className="group relative bg-white border border-gray-200 hover:border-red-600 transition-colors flex flex-col h-full">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <CompareButton product={product} />
        <FavoriteButton product={product} />
      </div>

      <Link
        href={`/product/${product.id}`}
        className="flex flex-col flex-1"
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

        <div className="p-4 flex flex-col flex-1">
          <div className="text-sm text-gray-500">{product.brand.name}</div>
          <h3 className="mt-2 font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-2">
            <RatingSummary ratingAverage={product.ratingAverage} reviewsCount={product.reviewsCount} />
          </div>

          <div className="mt-auto pt-4 space-y-2">
            <div className="flex items-baseline justify-between">
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
        </div>
      </Link>
    </div>
  );
}
