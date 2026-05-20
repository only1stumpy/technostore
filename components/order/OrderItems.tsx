import Image from 'next/image';
import Link from 'next/link';
import type { OrderItem } from '@/types/api';
import { formatPrice } from '@/lib/utils';

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-lg border border-border p-4">
          <Link href={`/product/${item.productId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Нет фото</div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={`/product/${item.productId}`} className="font-semibold hover:text-primary">
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{item.quantity} × {formatPrice(item.price)}</p>
          </div>

          <div className="text-right font-bold">
            {formatPrice(item.price * item.quantity)}
          </div>
        </div>
      ))}
    </div>
  );
}
