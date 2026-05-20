import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { OrderSummary } from '@/types/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { OrderStatus } from './OrderStatus';

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  const itemsPreview = order.itemsPreview
    .map((item) => `${item.name} × ${item.quantity}`)
    .join(', ');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold">Заказ #{order.id.slice(-6).toUpperCase()}</h2>
              <OrderStatus status={order.status} />
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <span>{formatDate(order.createdAt)}</span>
              <span>{order.itemsCount} шт.</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            {itemsPreview ? (
              <p className="text-sm text-muted-foreground">{itemsPreview}</p>
            ) : null}
          </div>

          <Link href={`/orders/${order.id}`}>
            <Button variant="secondary">Подробнее</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
