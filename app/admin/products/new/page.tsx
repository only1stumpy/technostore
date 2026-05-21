'use client';

import { useEffect, useState } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminBrand, AdminCategory } from '@/types/api';

export default function NewProductPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchOptions() {
    setIsLoading(true);
    setError('');
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
      ]);
      const [categoriesJson, brandsJson] = await Promise.all([
        categoriesResponse.json(),
        brandsResponse.json(),
      ]);
      if (!categoriesResponse.ok || !brandsResponse.ok) {
        setError(categoriesJson.error || brandsJson.error || 'Не удалось загрузить категории и бренды');
        return;
      }
      setCategories(categoriesJson.data ?? []);
      setBrands(brandsJson.data ?? []);
    } catch {
      setError('Не удалось загрузить категории и бренды');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchInitialOptions() {
      setIsLoading(true);
      setError('');
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
        ]);
        const [categoriesJson, brandsJson] = await Promise.all([
          categoriesResponse.json(),
          brandsResponse.json(),
        ]);
        if (!categoriesResponse.ok || !brandsResponse.ok) {
          setError(categoriesJson.error || brandsJson.error || 'Не удалось загрузить категории и бренды');
          return;
        }
        setCategories(categoriesJson.data ?? []);
        setBrands(brandsJson.data ?? []);
      } catch {
        setError('Не удалось загрузить категории и бренды');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchInitialOptions();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button variant="secondary" onClick={fetchOptions}>Повторить</Button>
        </CardContent>
      </Card>
    );
  }

  return <ProductForm categories={categories} brands={brands} />;
}
