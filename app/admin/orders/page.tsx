'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import { OrderStatus } from '@/components/order/OrderStatus';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { AdminOrder, OrderStatus as OrderStatusType, PaginatedResponse } from '@/types/api';

type OrdersResponse = { success: boolean; data?: PaginatedResponse<AdminOrder>; error?: string };
const statuses = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(params.size ? `/api/admin/orders?${params}` : '/api/admin/orders');
      const json: OrdersResponse = await response.json();

      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить заказы');
        return;
      }

      setOrders(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
    } catch {
      setError('Не удалось загрузить заказы');
    } finally {
      setIsLoading(false);
    }
  }, [status, dateFrom, dateTo]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchOrders();
    });
  }, [fetchOrders]);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Заказы</h1>
        <p className="mt-2 text-muted-foreground">Просмотр заказов и смена статусов</p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-foreground">
              Статус
              <select className="mt-2 h-11 rounded-lg border border-input bg-background px-4" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Все</option>
                {statuses.map((item) => <option key={item} value={item}>{ORDER_STATUS_LABELS[item]}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Дата от
              <input className="mt-2 h-11 rounded-lg border border-input bg-background px-4" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Дата до
              <input className="mt-2 h-11 rounded-lg border border-input bg-background px-4" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Найдено: {total}</p>
            {(status || dateFrom || dateTo) && <Button variant="secondary" onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); }}>Сбросить</Button>}
          </div>
        </CardContent>
      </Card>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={fetchOrders}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <DataTable headers={['Заказ', 'Клиент', 'Статус', 'Сумма', 'Дата', 'Действия']} empty={orders.length === 0} emptyText="Заказов пока нет">
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="px-6 py-4 font-bold">#{order.id.slice(-6)}</td>
            <td className="px-6 py-4">{order.user.name || order.user.phone}</td>
            <td className="px-6 py-4"><OrderStatus status={order.status} /></td>
            <td className="px-6 py-4">{formatPrice(order.total)}</td>
            <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <OrderStatusSelect orderId={order.id} status={order.status} onChanged={(nextStatus: OrderStatusType) => setOrders((items) => items.map((item) => item.id === order.id ? { ...item, status: nextStatus } : item))} onError={setError} />
                <Link href={`/admin/orders/${order.id}`}><Button size="sm" variant="secondary">Открыть</Button></Link>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
