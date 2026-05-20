'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  total: number;
  itemsCount: number;
  isLoading?: boolean;
  onClear: () => void;
}

export function CartSummary({ total, itemsCount, isLoading, onClear }: CartSummaryProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Итого</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Товары</span>
            <span>{itemsCount} шт.</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-xl font-bold">
            <span>К оплате</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {itemsCount > 0 && !isLoading ? (
            <Link href="/checkout" className="block">
              <Button className="w-full">Оформить заказ</Button>
            </Link>
          ) : (
            <Button className="w-full" disabled>
              Оформить заказ
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={itemsCount === 0 || isLoading}
            onClick={onClear}
          >
            Очистить корзину
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
