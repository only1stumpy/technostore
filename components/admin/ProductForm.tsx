'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { generateSlug } from '@/lib/utils';
import type { AdminBrand, AdminCategory, AdminProduct } from '@/types/api';

interface ProductFormProps {
  product?: AdminProduct;
  categories: AdminCategory[];
  brands: AdminBrand[];
}

type SpecRow = {
  key: string;
  value: string;
};

function formatInitialSpecValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function getInitialSpecRows(specs: Record<string, unknown> | null | undefined): SpecRow[] {
  if (!specs) return [];

  return Object.entries(specs).map(([key, value]) => ({
    key,
    value: formatInitialSpecValue(value),
  }));
}

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [isSlugTouched, setIsSlugTouched] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
  const [stock, setStock] = useState(product?.stock.toString() ?? '0');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '');
  const [brandId, setBrandId] = useState(product?.brandId ?? brands[0]?.id ?? '');
  const [images, setImages] = useState(product?.images.join('\n') ?? '');
  const [specRows, setSpecRows] = useState<SpecRow[]>(getInitialSpecRows(product?.specs));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => product ? 'Редактировать товар' : 'Добавить товар', [product]);
  const hasRequiredOptions = categories.length > 0 && brands.length > 0;

  function updateSpecRow(index: number, field: keyof SpecRow, value: string) {
    setSpecRows((currentRows) => currentRows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  }

  function removeSpecRow(index: number) {
    setSpecRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index));
  }

  function buildSpecs(): Record<string, string> | null {
    const result: Record<string, string> = {};
    const seenKeys = new Set<string>();

    for (const row of specRows) {
      const key = row.key.trim();
      const value = row.value.trim();

      if (!key && !value) continue;

      if (!key) {
        throw new Error('Укажите название характеристики');
      }

      if (seenKeys.has(key.toLocaleLowerCase('ru'))) {
        throw new Error('Названия характеристик не должны повторяться');
      }

      seenKeys.add(key.toLocaleLowerCase('ru'));
      result[key] = value;
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let parsedSpecs: Record<string, string> | null = null;
    try {
      parsedSpecs = buildSpecs();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Проверьте характеристики');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: product ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          price: Number(price),
          stock: Number(stock),
          categoryId,
          brandId,
          images: images.split('\n').map((image) => image.trim()).filter(Boolean),
          specs: parsedSpecs,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось сохранить товар');
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Не удалось сохранить товар');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h1 className="text-3xl font-black">{title}</h1>
            <p className="mt-1 text-muted-foreground">Заполните основные данные товара</p>
          </div>
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {!hasRequiredOptions && (
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Для товара нужны хотя бы одна категория и один бренд. Создайте их в разделах <Link className="font-semibold text-foreground underline" href="/admin/categories">категорий</Link> и <Link className="font-semibold text-foreground underline" href="/admin/brands">брендов</Link>.
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Название" value={name} onChange={(event) => { setName(event.target.value); if (!isSlugTouched) setSlug(generateSlug(event.target.value)); }} required />
            <Input label="Slug" value={slug} onChange={(event) => { setSlug(event.target.value); setIsSlugTouched(true); }} required />
            <Input label="Цена" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
            <Input label="Количество" type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              Категория
              <select className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Бренд
              <select className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4" value={brandId} onChange={(event) => setBrandId(event.target.value)} required>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-foreground">
            Описание
            <textarea className="mt-2 min-h-28 w-full rounded-lg border border-input bg-background px-4 py-3" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Изображения, по одному URL на строку
            <textarea className="mt-2 min-h-28 w-full rounded-lg border border-input bg-background px-4 py-3" value={images} onChange={(event) => setImages(event.target.value)} />
          </label>
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Характеристики</h2>
              <p className="mt-1 text-sm text-muted-foreground">Добавьте параметры товара в формате название — значение.</p>
            </div>
            <div className="space-y-3">
              {specRows.map((row, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <Input aria-label="Название характеристики" placeholder="ОЗУ" value={row.key} onChange={(event) => updateSpecRow(index, 'key', event.target.value)} />
                  <Input aria-label="Значение характеристики" placeholder="16 ГБ" value={row.value} onChange={(event) => updateSpecRow(index, 'value', event.target.value)} />
                  <Button type="button" variant="secondary" onClick={() => removeSpecRow(index)}>Удалить</Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" onClick={() => setSpecRows((currentRows) => [...currentRows, { key: '', value: '' }])}>Добавить характеристику</Button>
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} disabled={!hasRequiredOptions}>Сохранить</Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/admin/products')}>Отмена</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
