'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { ProductCard as ProductCardComponent } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters, type FilterState } from '@/components/product/ProductFilters';
import type { CategoryTree, ProductCard, CursorPaginatedResponse } from '@/types/api';

function flattenCategories(categories: CategoryTree[]): CategoryTree[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])]);
}

function ProductSection({ title, subtitle, products }: { title: string; subtitle: string; products: ProductCard[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1a1a1a] uppercase tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <Link href="#all-products" className="text-sm font-bold uppercase text-red-600 hover:text-red-700">
          Все товары
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCardComponent key={`${title}-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim() || undefined;
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const categoryTiles = useMemo(() => flattenCategories(categories).slice(0, 8), [categories]);
  const newProducts = featuredProducts.slice(0, 4);
  const popularProducts = featuredProducts.filter((product) => product.stock > 0).slice(0, 4);
  const recommendedProducts = featuredProducts.slice(4, 8);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Не удалось загрузить категории');
      }
      const data: CategoryTree[] = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Не удалось загрузить категории:', error);
      setCategories([]);
      setCategoriesError('Категории временно недоступны.');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    setFeaturedLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '12');
      params.set('sortBy', 'createdAt');
      params.set('sortOrder', 'desc');

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить витрину каталога');
      }
      const data: CursorPaginatedResponse<ProductCard> = await response.json();
      setFeaturedProducts(data.data ?? []);
    } catch (error) {
      console.error('Не удалось загрузить витрину каталога:', error);
      setFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

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

    try {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      if (filters.brandId) params.set('brandId', filters.brandId);
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters.inStock) params.set('inStock', 'true');
      if (searchQuery) params.set('search', searchQuery);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);
      params.set('limit', '24');

      const response = await fetch(`/api/products?${params}`, {
        signal: abortController.signal,
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить товары');
      }
      const data: CursorPaginatedResponse<ProductCard> = await response.json();

      if (abortControllerRef.current !== abortController) return;

      setProducts(prev => reset ? data.data : [...prev, ...data.data]);
      setNextCursor(data.pagination?.nextCursor || null);
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Не удалось загрузить товары:', error);
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
      void fetchCategories();
      void fetchFeaturedProducts();
    });
  }, [fetchCategories, fetchFeaturedProducts]);

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
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.replace(params.toString() ? `/catalog?${params}` : '/catalog', { scroll: false });
  };

  const loadMore = () => {
    if (nextCursor && !productsLoading && !loadingMore) {
      void fetchProducts(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container className="space-y-12">
        <section className="bg-[#1a1a1a] text-white px-6 py-10 sm:px-10 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">TechnoStore</p>
            <h1 className="mt-4 text-4xl sm:text-6xl font-bold uppercase tracking-tight">
              Каталог техники
            </h1>
            <p className="mt-5 text-lg text-gray-300">
              Смартфоны, ноутбуки, аксессуары и техника для дома в разделах, которые удобно просматривать как в крупных магазинах электроники.
            </p>
            <a
              href="#all-products"
              className="mt-8 inline-flex bg-red-600 px-8 py-3 text-sm font-bold uppercase text-white hover:bg-red-700 transition-colors"
            >
              Смотреть товары
            </a>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#1a1a1a] uppercase tracking-tight">Разделы каталога</h2>
              <p className="mt-1 text-sm text-gray-500">Выберите направление и переходите к товарам нужной категории.</p>
            </div>
            <Link href="#all-products" className="hidden sm:inline text-sm font-bold uppercase text-red-600 hover:text-red-700">
              Все товары
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse bg-white border border-gray-200" />
              ))}
            </div>
          ) : categoryTiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryTiles.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group bg-white border border-gray-200 p-5 hover:border-red-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {category.productCount} товаров
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-red-600">→</span>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.children.slice(0, 3).map((child) => (
                        <span key={child.id} className="bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {child.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-6 text-sm text-gray-500">
              {categoriesError ?? 'Категории пока не добавлены.'}
            </div>
          )}
        </section>

        {!featuredLoading && (
          <div className="space-y-12">
            <ProductSection
              title="Новинки"
              subtitle="Свежие позиции каталога и последние добавленные товары."
              products={newProducts}
            />
            <ProductSection
              title="Популярное в наличии"
              subtitle="Товары, доступные для быстрого заказа."
              products={popularProducts}
            />
            <ProductSection
              title="Рекомендуем"
              subtitle="Подборка техники для работы, дома и ежедневных задач."
              products={recommendedProducts}
            />
          </div>
        )}

        <section id="all-products" className="scroll-mt-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#1a1a1a] uppercase tracking-tight">
                {searchQuery ? 'Результаты поиска' : 'Все товары'}
              </h2>
              {searchQuery && (
                <p className="mt-1 text-sm text-gray-500">По запросу “{searchQuery}”</p>
              )}
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="self-start text-sm font-bold uppercase text-red-600 hover:text-red-700 sm:self-auto"
              >
                Очистить поиск
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="lg:w-3/4">
              {productsLoading && products.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"
                    role="status"
                    aria-label="Загрузка товаров"
                  >
                    <span className="sr-only">Загрузка...</span>
                  </div>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} />

                  {hasMore && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={loadMore}
                        disabled={productsLoading || loadingMore}
                        className="px-8 py-3 bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8" />}>
      <CatalogContent />
    </Suspense>
  );
}
