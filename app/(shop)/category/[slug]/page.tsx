'use client';

import { useEffect, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { ProductFiltersSchema } from '@/lib/validation/catalog';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Container } from '@/components/layout/Container';
import { Spinner } from '@/components/ui/Spinner';
import { CategoryTree, ProductCard, ProductFilters as ProductFiltersType } from '@/types/api';

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<CategoryTree | null>(null);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersType>({
    limit: 24,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    async function fetchCategory() {
      setLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categories: CategoryTree[] = await response.json();
        const foundCategory = categories.find(c => c.slug === slug);
        if (!foundCategory) {
          notFound();
        }
        setCategory(foundCategory);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (!category) return;

    const parsedFilters = ProductFiltersSchema.safeParse({
      ...Object.fromEntries(searchParams.entries()),
      categoryId: category.id,
    });

    if (!parsedFilters.success) {
      console.error('Invalid filters from URL:', parsedFilters.error);
      // Optionally, reset to default filters or show an error to the user
      return;
    }

    setFilters(parsedFilters.data);

    async function fetchProducts() {
      setLoading(true);
      try {
        const queryString = new URLSearchParams({
          ...parsedFilters.data as Record<string, string>,
          limit: String(parsedFilters.data.limit),
          sortBy: parsedFilters.data.sortBy,
          sortOrder: parsedFilters.data.sortOrder,
          ...(parsedFilters.data.cursor && { cursor: parsedFilters.data.cursor }),
        }).toString();
        const response = await fetch(`/api/products?${queryString}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.data);
        setNextCursor(data.pagination.nextCursor);
        setHasMore(data.pagination.hasMore);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, searchParams]);

  const handleLoadMore = async () => {
    if (!nextCursor || !hasMore) return;

    const currentFilters = { ...filters, cursor: nextCursor };

    try {
      const queryString = new URLSearchParams({
        ...currentFilters as Record<string, string>,
        limit: String(currentFilters.limit),
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
        ...(currentFilters.cursor && { cursor: currentFilters.cursor }),
      }).toString();
      const response = await fetch(`/api/products?${queryString}`);
      const data = await response.json();

      setProducts((prev) => [...prev, ...data.data]);
      setNextCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
    } catch (err: any) {
      console.error('Failed to load more products:', err.message);
    }
  };

  if (loading && !category) {
    return (
      <Container className="py-12 text-center">
        <Spinner size="lg" />
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
          <ProductFilters currentFilters={filters} />
        </div>
        <div className="lg:w-3/4">
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={handleLoadMore} variant="secondary">
                    Загрузить еще
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
