import { Badge } from '@/components/ui/Badge';
import type { OrderStatus as OrderStatusType } from '@/types/api';

const statusLabels: Record<OrderStatusType, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const statusVariants: Record<OrderStatusType, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  NEW: 'default',
  CONFIRMED: 'secondary',
  PROCESSING: 'warning',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
};

interface OrderStatusProps {
  status: OrderStatusType;
}

export function OrderStatus({ status }: OrderStatusProps) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}
