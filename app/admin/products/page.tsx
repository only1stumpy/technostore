'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import { formatPrice } from '@/lib/utils';
import type { AdminProduct, PaginatedResponse } from '@/types/api';

type ProductsResponse = { success: boolean; data?: PaginatedResponse<AdminProduct>; error?: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProducts() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/products');
      const json: ProductsResponse = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить товары');
        return;
      }
      setProducts(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
    } catch {
      setError('Не удалось загрузить товары');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Удалить товар?')) return;
    setDeletingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const json: { error?: string } = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось удалить товар');
        return;
      }
      setProducts((items) => items.filter((item) => item.id !== id));
      setTotal((value) => Math.max(0, value - 1));
    } catch {
      setError('Не удалось удалить товар');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    async function fetchInitialProducts() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/products');
        const json: ProductsResponse = await response.json();
        if (!response.ok) {
          setError(json.error || 'Не удалось загрузить товары');
          return;
        }
        setProducts(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      } catch {
        setError('Не удалось загрузить товары');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchInitialProducts();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Товары</h1>
          <p className="mt-2 text-muted-foreground">Управление каталогом товаров · всего {total}</p>
        </div>
        <Link href="/admin/products/new"><Button>Добавить</Button></Link>
      </div>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={loadProducts}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <DataTable headers={['Название', 'Категория', 'Бренд', 'Цена', 'Остаток', 'Действия']} empty={products.length === 0} emptyText="Товаров пока нет">
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-6 py-4 font-bold">{product.name}</td>
            <td className="px-6 py-4">{product.category.name}</td>
            <td className="px-6 py-4">{product.brand.name}</td>
            <td className="px-6 py-4">{formatPrice(product.price)}</td>
            <td className="px-6 py-4"><Badge variant={product.stock > 0 ? 'success' : 'destructive'}>{product.stock}</Badge></td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <Link href={`/admin/products/${product.id}/edit`}><Button size="sm" variant="secondary">Изменить</Button></Link>
                <Button size="sm" variant="destructive" disabled={deletingId === product.id} onClick={() => deleteProduct(product.id)}>{deletingId === product.id ? 'Удаление...' : 'Удалить'}</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
