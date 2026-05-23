'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import type { AdminPromoCode, PaginatedResponse, PromoCodeType } from '@/types/api';
import { formatPrice } from '@/lib/utils';

type PromoCodesResponse = { success: boolean; data?: PaginatedResponse<AdminPromoCode>; error?: string };
type PromoCodeResponse = { success: boolean; data?: AdminPromoCode; error?: string };

type PromoCodeForm = {
  code: string;
  type: PromoCodeType;
  value: string;
  minOrderTotal: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm: PromoCodeForm = {
  code: '',
  type: 'PERCENT',
  value: '',
  minOrderTotal: '0',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toPayload(form: PromoCodeForm) {
  return {
    code: form.code,
    type: form.type,
    value: form.value,
    minOrderTotal: form.minOrderTotal,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    isActive: form.isActive,
  };
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
  const [form, setForm] = useState<PromoCodeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchPromoCodes = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/promo-codes?limit=100');
      const json: PromoCodesResponse = await response.json();

      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить промокоды');
        return;
      }

      setPromoCodes(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
    } catch {
      setError('Не удалось загрузить промокоды');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPromoCodes();
    });
  }, [fetchPromoCodes]);

  function startEdit(promoCode: AdminPromoCode) {
    setEditingId(promoCode.id);
    setForm({
      code: promoCode.code,
      type: promoCode.type,
      value: String(promoCode.value),
      minOrderTotal: String(promoCode.minOrderTotal),
      usageLimit: promoCode.usageLimit ? String(promoCode.usageLimit) : '',
      startsAt: toDateTimeLocal(promoCode.startsAt),
      expiresAt: toDateTimeLocal(promoCode.expiresAt),
      isActive: promoCode.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(editingId ? `/api/admin/promo-codes/${editingId}` : '/api/admin/promo-codes', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(form)),
      });
      const json: PromoCodeResponse = await response.json();

      if (!response.ok || !json.data) {
        setError(json.error || 'Не удалось сохранить промокод');
        return;
      }

      setPromoCodes((items) => editingId
        ? items.map((item) => item.id === editingId ? json.data as AdminPromoCode : item)
        : [json.data as AdminPromoCode, ...items]
      );
      if (!editingId) setTotal((value) => value + 1);
      resetForm();
    } catch {
      setError('Не удалось сохранить промокод');
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivatePromoCode(id: string) {
    setPendingId(id);
    setError('');

    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      const json: PromoCodeResponse = await response.json();

      if (!response.ok || !json.data) {
        setError(json.error || 'Не удалось отключить промокод');
        return;
      }

      setPromoCodes((items) => items.map((item) => item.id === id ? json.data as AdminPromoCode : item));
    } catch {
      setError('Не удалось отключить промокод');
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Промокоды</h1>
        <p className="mt-2 text-muted-foreground">Скидки для checkout и лимиты использования</p>
      </div>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={fetchPromoCodes}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Редактировать промокод' : 'Новый промокод'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
            <Input label="Код" value={form.code} onChange={(event) => setForm((value) => ({ ...value, code: event.target.value }))} placeholder="TECHNO10" required />
            <label className="block text-sm font-medium text-foreground">
              Тип
              <select className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4" value={form.type} onChange={(event) => setForm((value) => ({ ...value, type: event.target.value as PromoCodeType }))}>
                <option value="PERCENT">Процент</option>
                <option value="FIXED">Фиксированная сумма</option>
              </select>
            </label>
            <Input label="Скидка" type="number" min="0" step="0.01" value={form.value} onChange={(event) => setForm((value) => ({ ...value, value: event.target.value }))} required />
            <Input label="Минимальная сумма" type="number" min="0" step="0.01" value={form.minOrderTotal} onChange={(event) => setForm((value) => ({ ...value, minOrderTotal: event.target.value }))} required />
            <Input label="Лимит использований" type="number" min="1" value={form.usageLimit} onChange={(event) => setForm((value) => ({ ...value, usageLimit: event.target.value }))} placeholder="Без лимита" />
            <Input label="Начало действия" type="datetime-local" value={form.startsAt} onChange={(event) => setForm((value) => ({ ...value, startsAt: event.target.value }))} />
            <Input label="Окончание" type="datetime-local" value={form.expiresAt} onChange={(event) => setForm((value) => ({ ...value, expiresAt: event.target.value }))} />
            <label className="flex items-center gap-3 self-end rounded-lg border border-input px-4 py-3 text-sm font-medium text-foreground">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} />
              Активен
            </label>
            <div className="flex gap-3 md:col-span-2 xl:col-span-4">
              <Button type="submit" isLoading={isSaving} disabled={isSaving}>{editingId ? 'Сохранить' : 'Создать'}</Button>
              {editingId ? <Button type="button" variant="secondary" onClick={resetForm}>Отмена</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Список</h2>
        <p className="text-sm text-muted-foreground">Всего: {total}</p>
      </div>
      <DataTable headers={['Код', 'Тип', 'Скидка', 'Мин. сумма', 'Использовано', 'Период', 'Статус', 'Действия']} empty={promoCodes.length === 0} emptyText="Промокодов пока нет" minWidth="1120px">
        {promoCodes.map((promoCode) => (
          <tr key={promoCode.id}>
            <td className="px-6 py-4 font-bold">{promoCode.code}</td>
            <td className="px-6 py-4">{promoCode.type === 'PERCENT' ? 'Процент' : 'Сумма'}</td>
            <td className="px-6 py-4 font-bold">{promoCode.type === 'PERCENT' ? `${promoCode.value}%` : formatPrice(promoCode.value)}</td>
            <td className="px-6 py-4">{formatPrice(promoCode.minOrderTotal)}</td>
            <td className="px-6 py-4">{promoCode.usedCount}{promoCode.usageLimit ? ` / ${promoCode.usageLimit}` : ''}</td>
            <td className="px-6 py-4 text-sm text-muted-foreground">
              <div>{promoCode.startsAt ? new Date(promoCode.startsAt).toLocaleDateString('ru-RU') : 'Сразу'}</div>
              <div>{promoCode.expiresAt ? new Date(promoCode.expiresAt).toLocaleDateString('ru-RU') : 'Без срока'}</div>
            </td>
            <td className="px-6 py-4 font-semibold">{promoCode.isActive ? 'Активен' : 'Отключен'}</td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => startEdit(promoCode)}>Изменить</Button>
                <Button size="sm" variant="destructive" isLoading={pendingId === promoCode.id} disabled={!promoCode.isActive || pendingId === promoCode.id} onClick={() => deactivatePromoCode(promoCode.id)}>Отключить</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
