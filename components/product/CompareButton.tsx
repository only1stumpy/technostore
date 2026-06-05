'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useComparisonStore } from '@/store/comparisonStore';
import type { ProductCard } from '@/types/api';

type CompareButtonProps = {
  product: ProductCard;
  className?: string;
};

export function CompareButton({ product, className }: CompareButtonProps) {
  const router = useRouter();
  const items = useComparisonStore((state) => state.items);
  const pendingProductIds = useComparisonStore((state) => state.pendingProductIds);
  const errorCode = useComparisonStore((state) => state.errorCode);
  const addItem = useComparisonStore((state) => state.addItem);
  const removeItem = useComparisonStore((state) => state.removeItem);
  const isCompared = items.some((item) => item.id === product.id) || Boolean(product.isCompared && !errorCode);
  const isLoading = pendingProductIds.includes(product.id);

  async function toggleComparison() {
    if (isLoading) return;

    const success = isCompared ? await removeItem(product.id) : await addItem(product);

    if (!success && useComparisonStore.getState().errorCode === 'UNAUTHORIZED') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleComparison}
      disabled={isLoading}
      title={isCompared ? 'Убрать из сравнения' : 'Добавить к сравнению'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-red-600 hover:text-red-600 disabled:opacity-60',
        isCompared && 'border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white',
        className
      )}
      aria-label={isCompared ? 'Убрать из сравнения' : 'Добавить к сравнению'}
      aria-pressed={isCompared}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-4.5-13L21 8m0 0-4.5 4.5M21 8H3" />
      </svg>
    </button>
  );
}
