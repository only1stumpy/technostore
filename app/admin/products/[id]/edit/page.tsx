'use client';

import { use, useEffect, useState } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminBrand, AdminCategory, AdminProduct } from '@/types/api';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchData() {
    setIsLoading(true);
    setError('');
    try {
      const [productResponse, categoriesResponse, brandsResponse] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
      ]);
      const [productJson, categoriesJson, brandsJson] = await Promise.all([
        productResponse.json(),
        categoriesResponse.json(),
        brandsResponse.json(),
      ]);
      if (!productResponse.ok || !categoriesResponse.ok || !brandsResponse.ok) {
        setError(productJson.error || categoriesJson.error || brandsJson.error || 'Не удалось загрузить товар');
        return;
      }
      setProduct(productJson.data ?? null);
      setCategories(categoriesJson.data ?? []);
      setBrands(brandsJson.data ?? []);
    } catch {
      setError('Не удалось загрузить товар');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      setError('');
      try {
        const [productResponse, categoriesResponse, brandsResponse] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
        ]);
        const [productJson, categoriesJson, brandsJson] = await Promise.all([
          productResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json(),
        ]);
        if (!productResponse.ok || !categoriesResponse.ok || !brandsResponse.ok) {
          setError(productJson.error || categoriesJson.error || brandsJson.error || 'Не удалось загрузить товар');
          return;
        }
        setProduct(productJson.data ?? null);
        setCategories(categoriesJson.data ?? []);
        setBrands(brandsJson.data ?? []);
      } catch {
        setError('Не удалось загрузить товар');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchInitialData();
  }, [id]);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button variant="secondary" onClick={fetchData}>Повторить</Button>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return <p className="text-muted-foreground">Товар не найден</p>;
  }

  return <ProductForm product={product} categories={categories} brands={brands} />;
}
