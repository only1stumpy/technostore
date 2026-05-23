'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { FavoriteButton } from '@/components/product/FavoriteButton';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { RatingSummary } from '@/components/product/RatingSummary';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import type { ProductDetail } from '@/types/api';

type CartMessage = {
  type: 'success' | 'error';
  text: string;
};

export function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<CartMessage | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }

    void fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || isAddingToCart) return;

    setCartMessage(null);
    setIsAddingToCart(true);

    try {
      const added = await addItem(product.id, 1);

      if (added) {
        setCartMessage({ type: 'success', text: 'Товар добавлен в корзину' });
        return;
      }

      const { error: errorMessage, errorCode } = useCartStore.getState();

      if (errorCode === 'UNAUTHORIZED') {
        router.push(`/login?redirect=/product/${product.id}`);
        return;
      }

      setCartMessage({
        type: 'error',
        text: errorMessage || 'Не удалось добавить товар в корзину',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12 text-center">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="mt-4 text-[#666666]">Загрузка товара...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12 text-center text-[#ef4444]">
        <p>Ошибка: {error}</p>
      </Container>
    );
  }

  if (!product) {
    return null;
  }

  const favoriteProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    imageUrl: product.images[0] ?? null,
    stock: product.stock,
    ratingAverage: product.ratingAverage,
    reviewsCount: product.reviewsCount,
    brand: product.brand,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
  };

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-[#1a1a1a] uppercase tracking-tight">
              {product.name}
            </h1>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-[#ff0000]">
                {formatPrice(product.price)}
              </p>
              <RatingSummary ratingAverage={product.ratingAverage} reviewsCount={product.reviewsCount} size="md" />
            </div>

            {product.description && (
              <div className="text-[#1a1a1a]">
                <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Описание</h2>
                <p>{product.description}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {product.stock > 0 ? (
                <span className="text-[#10b981] font-medium">В наличии ({product.stock})</span>
              ) : (
                <span className="text-[#ef4444] font-medium">Нет в наличии</span>
              )}
              <Button
                variant="primary"
                disabled={product.stock === 0}
                isLoading={isAddingToCart}
                onClick={handleAddToCart}
              >
                Добавить в корзину
              </Button>
              <FavoriteButton product={favoriteProduct} className="h-11 w-11" />
            </div>

            {cartMessage && (
              <p className={cartMessage.type === 'success' ? 'text-[#10b981]' : 'text-[#ef4444]'}>
                {cartMessage.text}
              </p>
            )}
          </div>
        </div>

        {product.specs && <ProductSpecs specs={product.specs} />}
        <ProductReviews productId={product.id} ratingAverage={product.ratingAverage} reviewsCount={product.reviewsCount} />
      </div>
    </Container>
  );
}
