'use client';

import { useState } from 'react';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import type { OrderStatus } from '@/types/api';

interface OrderStatusSelectProps {
  orderId: string;
  status: OrderStatus;
  onChanged?: (status: OrderStatus) => void;
  onError?: (message: string) => void;
}

const statuses = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export function OrderStatusSelect({ orderId, status, onChanged, onError }: OrderStatusSelectProps) {
  const [value, setValue] = useState<OrderStatus>(status);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextStatus: OrderStatus) {
    const previousStatus = value;
    setValue(nextStatus);
    setIsSaving(true);
    onError?.('');

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json: { error?: string } = await response.json();

      if (!response.ok) {
        setValue(previousStatus);
        onError?.(json.error || 'Не удалось обновить статус заказа');
        return;
      }

      onChanged?.(nextStatus);
    } catch {
      setValue(previousStatus);
      onError?.('Не удалось обновить статус заказа');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <select
      className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold disabled:opacity-50"
      value={value}
      disabled={isSaving}
      onChange={(event) => handleChange(event.target.value as OrderStatus)}
    >
      {statuses.map((item) => (
        <option key={item} value={item}>{ORDER_STATUS_LABELS[item]}</option>
      ))}
    </select>
  );
}
