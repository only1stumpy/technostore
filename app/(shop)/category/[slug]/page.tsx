'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { notFound, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProductFiltersSchema } from '@/lib/validation/catalog';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters, type FilterState } from '@/components/product/ProductFilters';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CategoryTree, ProductCard } from '@/types/api';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function findCategoryBySlug(categories: CategoryTree[], slug: string): CategoryTree | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    const child = findCategoryBySlug(category.children ?? [], slug);
    if (child) {
      return child;
    }
  }

  return null;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<CategoryTree | null>(null);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Не удалось загрузить категории');
      }
      const categories: CategoryTree[] = await response.json();
      const foundCategory = findCategoryBySlug(categories, slug);
      if (!foundCategory) {
        notFound();
      }
      setCategory(foundCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCategory();
    });
  }, [fetchCategory]);

  const fetchProducts = useCallback(async () => {
    if (!category) return;

    const categoryId = category.id;
    const parsedFilters = ProductFiltersSchema.safeParse({
      ...Object.fromEntries(searchParams.entries()),
      categoryId,
    });

    if (!parsedFilters.success) {
      console.error('Invalid filters from URL:', parsedFilters.error);
      return;
    }

    const parsedData = parsedFilters.data;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('categoryId', parsedData.categoryId ?? categoryId);
      params.set('limit', String(parsedData.limit));
      params.set('sortBy', parsedData.sortBy);
      params.set('sortOrder', parsedData.sortOrder);
      if (parsedData.cursor) params.set('cursor', parsedData.cursor);
      if (parsedData.brandId) params.set('brandId', parsedData.brandId);
      if (parsedData.minPrice !== undefined) params.set('minPrice', String(parsedData.minPrice));
      if (parsedData.maxPrice !== undefined) params.set('maxPrice', String(parsedData.maxPrice));
      if (parsedData.inStock !== undefined) params.set('inStock', String(parsedData.inStock));
      if (parsedData.search) params.set('search', parsedData.search);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить товары');
      }
      const data = await response.json();
      setFilters(parsedData);
      setProducts(data.data);
      setNextCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }, [category, searchParams]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchProducts();
    });
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('cursor');

    const entries: Array<[keyof FilterState, string | undefined]> = [
      ['brandId', newFilters.brandId],
      ['minPrice', newFilters.minPrice !== undefined ? String(newFilters.minPrice) : undefined],
      ['maxPrice', newFilters.maxPrice !== undefined ? String(newFilters.maxPrice) : undefined],
      ['inStock', newFilters.inStock !== undefined ? String(newFilters.inStock) : undefined],
      ['sortBy', newFilters.sortBy],
      ['sortOrder', newFilters.sortOrder],
    ];

    entries.forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || !hasMore || !category) return;

    const categoryId = category.id;

    try {
      const params = new URLSearchParams();
      params.set('cursor', nextCursor);
      params.set('categoryId', categoryId);
      params.set('limit', '24');
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);
      if (filters.brandId) params.set('brandId', filters.brandId);
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters.inStock !== undefined) params.set('inStock', String(filters.inStock));

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      setProducts((prev) => [...prev, ...data.data]);
      setNextCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error('Не удалось загрузить дополнительные товары:', err instanceof Error ? err.message : err);
    }
  };

  if (loading && !category) {
    return (
      <Container className="py-12 text-center">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="mt-4 text-[#666666]">Загрузка категории...</p>
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

  if (!category) {
    notFound();
  }

  return (
    <Container className="py-8">
      <h1 className="text-4xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-8">
        {category.name}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            activeCategorySlug={slug}
          />
        </div>
        <div className="lg:w-3/4">
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Spinner className="h-8 w-8 mx-auto" />
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={handleLoadMore} variant="secondary">
                    Показать ещё
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
