'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateSlug } from '@/lib/utils';
import type { AdminCategory } from '@/types/api';

interface CategoryFormProps {
  category?: AdminCategory;
  categories: AdminCategory[];
  onSaved: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, categories, onSaved, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [isSlugTouched, setIsSlugTouched] = useState(Boolean(category));
  const [parentId, setParentId] = useState(category?.parentId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(category ? `/api/admin/categories/${category.id}` : '/api/admin/categories', {
        method: category ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, parentId: parentId || null }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Не удалось сохранить категорию');
        return;
      }

      setName('');
      setSlug('');
      setIsSlugTouched(false);
      setParentId('');
      onSaved();
    } catch {
      setError('Не удалось сохранить категорию');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <Input label="Название" value={name} onChange={(event) => { setName(event.target.value); if (!isSlugTouched) setSlug(generateSlug(event.target.value)); }} required />
        <Input label="Slug" value={slug} onChange={(event) => { setSlug(event.target.value); setIsSlugTouched(true); }} required />
        <label className="block text-sm font-medium text-foreground">
          Родитель
          <select className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4" value={parentId} onChange={(event) => setParentId(event.target.value)}>
            <option value="">Нет</option>
            {categories.filter((item) => item.id !== category?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>{category ? 'Сохранить' : 'Добавить'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Отмена</Button>}
      </div>
    </form>
  );
}
