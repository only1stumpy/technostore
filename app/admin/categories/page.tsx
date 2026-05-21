'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import { CategoryForm } from '@/components/admin/CategoryForm';
import type { AdminCategory } from '@/types/api';

type CategoriesResponse = { success: boolean; data?: AdminCategory[]; error?: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCategories() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/categories');
      const json: CategoriesResponse = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить категории');
        return;
      }
      setCategories(json.data ?? []);
    } catch {
      setError('Не удалось загрузить категории');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Удалить категорию?')) return;
    setDeletingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const json: { error?: string } = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось удалить категорию');
        return;
      }
      setCategories((items) => items.filter((item) => item.id !== id));
    } catch {
      setError('Не удалось удалить категорию');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    async function fetchInitialCategories() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/categories');
        const json: CategoriesResponse = await response.json();
        if (!response.ok) {
          setError(json.error || 'Не удалось загрузить категории');
          return;
        }
        setCategories(json.data ?? []);
      } catch {
        setError('Не удалось загрузить категории');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchInitialCategories();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Категории</h1>
        <p className="mt-2 text-muted-foreground">Создание и редактирование категорий каталога</p>
      </div>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={fetchCategories}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6">
          <CategoryForm key={editing?.id ?? 'new'} category={editing ?? undefined} categories={categories} onSaved={() => { setEditing(null); void fetchCategories(); }} onCancel={editing ? () => setEditing(null) : undefined} />
        </CardContent>
      </Card>
      <DataTable headers={['Название', 'Slug', 'Товаров', 'Действия']} empty={categories.length === 0} emptyText="Категорий пока нет">
        {categories.map((category) => (
          <tr key={category.id}>
            <td className="px-6 py-4 font-bold">{category.name}</td>
            <td className="px-6 py-4">{category.slug}</td>
            <td className="px-6 py-4">{category.productCount}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditing(category)}>Изменить</Button>
                <Button size="sm" variant="destructive" disabled={deletingId === category.id} onClick={() => deleteCategory(category.id)}>{deletingId === category.id ? 'Удаление...' : 'Удалить'}</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
