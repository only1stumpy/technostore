'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters, type FilterState } from '@/components/product/ProductFilters';
import type { CursorPaginatedResponse, ProductCard } from '@/types/api';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.trim() || searchParams.get('search')?.trim() || '';
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (cursor?: string, reset = false) => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (reset) {
      setProductsLoading(true);
      setLoadingMore(false);
    } else {
      setLoadingMore(true);
    }

    if (!searchQuery) {
      setProducts([]);
      setNextCursor(null);
      setHasMore(false);
      setProductsLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set('search', searchQuery);
      if (cursor) params.set('cursor', cursor);
      if (filters.brandId) params.set('brandId', filters.brandId);
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters.inStock) params.set('inStock', 'true');
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);
      params.set('limit', '24');

      const response = await fetch(`/api/products?${params}`, {
        signal: abortController.signal,
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить результаты поиска');
      }
      const data: CursorPaginatedResponse<ProductCard> = await response.json();

      if (abortControllerRef.current !== abortController) return;

      setProducts((prev) => reset ? data.data : [...prev, ...data.data]);
      setNextCursor(data.pagination?.nextCursor || null);
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Не удалось загрузить результаты поиска:', error);
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        if (reset) {
          setProductsLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchProducts(undefined, true);
    });

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    router.replace('/search', { scroll: false });
  };

  const loadMore = () => {
    if (nextCursor && !productsLoading && !loadingMore) {
      void fetchProducts(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container className="space-y-8">
        <section className="bg-white border border-gray-200 px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">Поиск товаров</p>
              <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-[#1a1a1a] sm:text-5xl">
                {searchQuery ? 'Результаты поиска' : 'Введите поисковый запрос'}
              </h1>
              {searchQuery ? (
                <p className="mt-3 text-lg text-gray-500">По запросу “{searchQuery}”</p>
              ) : (
                <p className="mt-3 text-lg text-gray-500">Воспользуйтесь поиском в шапке сайта, чтобы быстро найти нужную технику.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex min-h-10 items-center border border-red-600 px-5 py-2 text-sm font-bold uppercase text-red-600 transition-colors hover:bg-red-50"
                >
                  Очистить поиск
                </button>
              )}
              <Link
                href="/catalog"
                className="inline-flex min-h-10 items-center bg-red-600 px-5 py-2 text-sm font-bold uppercase text-white transition-colors hover:bg-red-700"
              >
                В каталог
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="lg:w-1/4">
              <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="lg:w-3/4">
              {productsLoading && products.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600"
                    role="status"
                    aria-label="Загрузка результатов поиска"
                  >
                    <span className="sr-only">Загрузка...</span>
                  </div>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} />

                  {hasMore && (
                    <div className="mt-12 flex justify-center">
                      <button
                        onClick={loadMore}
                        disabled={productsLoading || loadingMore}
                        className="bg-red-600 px-8 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {loadingMore ? 'Загрузка...' : 'Показать ещё'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8" />}>
      <SearchContent />
    </Suspense>
  );
}
