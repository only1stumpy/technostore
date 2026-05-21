'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import { BrandForm } from '@/components/admin/BrandForm';
import type { AdminBrand } from '@/types/api';

type BrandsResponse = { success: boolean; data?: AdminBrand[]; error?: string };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchBrands() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/brands');
      const json: BrandsResponse = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить бренды');
        return;
      }
      setBrands(json.data ?? []);
    } catch {
      setError('Не удалось загрузить бренды');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteBrand(id: string) {
    if (!confirm('Удалить бренд?')) return;
    setDeletingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
      const json: { error?: string } = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось удалить бренд');
        return;
      }
      setBrands((items) => items.filter((item) => item.id !== id));
    } catch {
      setError('Не удалось удалить бренд');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    async function fetchInitialBrands() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/brands');
        const json: BrandsResponse = await response.json();
        if (!response.ok) {
          setError(json.error || 'Не удалось загрузить бренды');
          return;
        }
        setBrands(json.data ?? []);
      } catch {
        setError('Не удалось загрузить бренды');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchInitialBrands();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Бренды</h1>
        <p className="mt-2 text-muted-foreground">Создание и редактирование брендов</p>
      </div>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={fetchBrands}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6">
          <BrandForm key={editing?.id ?? 'new'} brand={editing ?? undefined} onSaved={() => { setEditing(null); void fetchBrands(); }} onCancel={editing ? () => setEditing(null) : undefined} />
        </CardContent>
      </Card>
      <DataTable headers={['Название', 'Slug', 'Товаров', 'Действия']} empty={brands.length === 0} emptyText="Брендов пока нет">
        {brands.map((brand) => (
          <tr key={brand.id}>
            <td className="px-6 py-4 font-bold">{brand.name}</td>
            <td className="px-6 py-4">{brand.slug}</td>
            <td className="px-6 py-4">{brand.productCount}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditing(brand)}>Изменить</Button>
                <Button size="sm" variant="destructive" disabled={deletingId === brand.id} onClick={() => deleteBrand(brand.id)}>{deletingId === brand.id ? 'Удаление...' : 'Удалить'}</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
