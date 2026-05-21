'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateSlug } from '@/lib/utils';
import type { AdminBrand } from '@/types/api';

interface BrandFormProps {
  brand?: AdminBrand;
  onSaved: () => void;
  onCancel?: () => void;
}

export function BrandForm({ brand, onSaved, onCancel }: BrandFormProps) {
  const [name, setName] = useState(brand?.name ?? '');
  const [slug, setSlug] = useState(brand?.slug ?? '');
  const [isSlugTouched, setIsSlugTouched] = useState(Boolean(brand));
  const [logo, setLogo] = useState(brand?.logo ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(brand ? `/api/admin/brands/${brand.id}` : '/api/admin/brands', {
        method: brand ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, logo: logo || null }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Не удалось сохранить бренд');
        return;
      }

      setName('');
      setSlug('');
      setIsSlugTouched(false);
      setLogo('');
      onSaved();
    } catch {
      setError('Не удалось сохранить бренд');
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
        <Input label="Логотип URL" value={logo} onChange={(event) => setLogo(event.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>{brand ? 'Сохранить' : 'Добавить'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Отмена</Button>}
      </div>
    </form>
  );
}
