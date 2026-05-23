'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ComparisonTable } from '@/components/product/ComparisonTable';
import { useComparisonStore } from '@/store/comparisonStore';
import type { ComparisonResponse } from '@/types/api';

type ComparisonPageClientProps = {
  initialComparison: ComparisonResponse;
};

export function ComparisonPageClient({ initialComparison }: ComparisonPageClientProps) {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const items = useComparisonStore((state) => state.items);
  const count = useComparisonStore((state) => state.count);
  const error = useComparisonStore((state) => state.error);
  const setComparison = useComparisonStore((state) => state.setComparison);
  const removeItem = useComparisonStore((state) => state.removeItem);
  const clearComparison = useComparisonStore((state) => state.clearComparison);

  useEffect(() => {
    setComparison(initialComparison);
  }, [initialComparison, setComparison]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Сравнение</h1>
          <p className="mt-2 text-muted-foreground">Сравнивайте до 4 товаров из одной категории по цене, наличию и характеристикам</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-secondary px-3 py-2 text-sm font-bold text-muted-foreground">
            {count} из 4 товаров
          </div>
          {items.length > 0 && (
            <>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold transition-colors hover:border-primary">
                <input
                  type="checkbox"
                  checked={showOnlyDifferences}
                  onChange={(event) => setShowOnlyDifferences(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Только отличия
              </label>
              <button
                type="button"
                onClick={() => void clearComparison()}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-bold uppercase tracking-tight transition-colors hover:border-primary hover:text-primary"
              >
                Очистить
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {items.length > 0 ? (
        <ComparisonTable items={items} showOnlyDifferences={showOnlyDifferences} onRemove={(productId) => void removeItem(productId)} />
      ) : (
        <div className="rounded-lg border border-border bg-background p-10 text-center">
          <h2 className="text-2xl font-black">Список сравнения пуст</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Добавляйте товары из каталога через кнопку сравнения, чтобы увидеть отличия характеристик.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 font-bold uppercase tracking-tight text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Перейти в каталог
          </Link>
        </div>
      )}
    </>
  );
}
