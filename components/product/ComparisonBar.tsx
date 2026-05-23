'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useComparisonStore } from '@/store/comparisonStore';

export function ComparisonBar() {
  const items = useComparisonStore((state) => state.items);
  const count = useComparisonStore((state) => state.count);
  const error = useComparisonStore((state) => state.error);
  const pendingProductIds = useComparisonStore((state) => state.pendingProductIds);
  const removeItem = useComparisonStore((state) => state.removeItem);
  const clearComparison = useComparisonStore((state) => state.clearComparison);

  if (count === 0 && !error) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-12px_32px_rgba(0,0,0,0.12)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {count > 0 && (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black uppercase tracking-tight text-foreground">
                В сравнении: {count} из 4
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {items.map((item) => {
                  const isPending = pendingProductIds.includes(item.id);

                  return (
                    <div key={item.id} className="flex min-w-48 items-center gap-2 rounded-lg border border-border bg-white px-2 py-2">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-50">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="h-full w-full bg-secondary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs text-muted-foreground">{item.brand.name}</div>
                        <div className="truncate text-sm font-bold">{item.name}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        disabled={isPending}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                        aria-label={`Убрать ${item.name} из сравнения`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => void clearComparison()}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-bold uppercase tracking-tight transition-colors hover:border-primary hover:text-primary"
              >
                Очистить
              </button>
              {count >= 2 ? (
                <Link
                  href="/compare"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold uppercase tracking-tight text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Сравнить
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-secondary px-5 text-sm font-bold uppercase tracking-tight text-muted-foreground"
                >
                  Добавьте еще 1 товар
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
