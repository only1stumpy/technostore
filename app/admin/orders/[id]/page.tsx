'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { OrderItems } from '@/components/order/OrderItems';
import { OrderStatus } from '@/components/order/OrderStatus';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import { formatPrice } from '@/lib/utils';
import type { AdminOrderDetail, OrderStatus as OrderStatusType } from '@/types/api';

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

type OrderResponse = { success: boolean; data?: AdminOrderDetail; error?: string };

export default function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/admin/orders/${id}`);
        const json: OrderResponse = await response.json();
        if (response.ok) {
          setOrder(json.data ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void fetchOrder();
  }, [id]);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  if (!order) {
    return <p className="text-muted-foreground">Заказ не найден</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black">Заказ #{order.id.slice(-6)}</h1>
          <p className="mt-2 text-muted-foreground">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatus status={order.status} />
          <OrderStatusSelect orderId={order.id} status={order.status} onChanged={(status: OrderStatusType) => setOrder((current) => current ? { ...current, status } : current)} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="pt-6">
            <OrderItems items={order.items} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm font-semibold uppercase text-muted-foreground">Клиент</p>
              <p className="mt-1 font-bold">{order.user.name || 'Без имени'}</p>
              <p className="text-muted-foreground">{order.user.phone}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-muted-foreground">Доставка</p>
              <p className="mt-1 font-semibold">{order.recipientName || 'Получатель не указан'}</p>
              <p className="mt-1">{order.address}</p>
              <p className="text-muted-foreground">{order.phone}</p>
            </div>
            {order.comment && <div><p className="text-sm font-semibold uppercase text-muted-foreground">Комментарий</p><p className="mt-1">{order.comment}</p></div>}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Итого</p>
              <p className="mt-1 text-2xl font-black">{formatPrice(order.total)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
