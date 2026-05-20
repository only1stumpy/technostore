'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters, type FilterState } from '@/components/product/ProductFilters';
import type { ProductCard, CursorPaginatedResponse } from '@/types/api';

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (cursor?: string, reset = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
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
        throw new Error('Failed to fetch products');
      }
      const data: CursorPaginatedResponse<ProductCard> = await response.json();

      if (data.data) {
        setProducts(prev => reset ? data.data : [...prev, ...data.data]);
        setNextCursor(data.pagination?.nextCursor || null);
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Failed to fetch products:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchProducts(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <ProductFilters onFilterChange={handleFilterChange} />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Catalog</h1>

            {loading && products.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"
                  role="status"
                  aria-label="Loading products"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-8 py-3 bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
