'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFavoriteStore } from '@/store/favoriteStore';
import type { ProductCard } from '@/types/api';

type FavoriteButtonProps = {
  product: ProductCard;
  className?: string;
};

export function FavoriteButton({ product, className }: FavoriteButtonProps) {
  const router = useRouter();
  const items = useFavoriteStore((state) => state.items);
  const pendingProductIds = useFavoriteStore((state) => state.pendingProductIds);
  const errorCode = useFavoriteStore((state) => state.errorCode);
  const addItem = useFavoriteStore((state) => state.addItem);
  const removeItem = useFavoriteStore((state) => state.removeItem);
  const isFavorite = items.some((item) => item.id === product.id) || Boolean(product.isFavorite && errorCode !== 'UNAUTHORIZED');
  const isLoading = pendingProductIds.includes(product.id);

  async function toggleFavorite() {
    if (isLoading) return;

    const success = isFavorite ? await removeItem(product.id) : await addItem(product);

    if (!success && useFavoriteStore.getState().errorCode === 'UNAUTHORIZED') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-red-600 hover:text-red-600 disabled:opacity-60',
        isFavorite && 'border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white',
        className
      )}
      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      aria-pressed={isFavorite}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );
}
