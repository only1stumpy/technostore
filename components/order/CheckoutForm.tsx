'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { CartItem, OrderDetail } from '@/types/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

interface CheckoutFormProps {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  initialPhone?: string;
  initialName?: string;
  initialAddress?: string;
}

type OrderResponse = {
  success: boolean;
  data?: OrderDetail;
  error?: string;
};

export function CheckoutForm({ userId, items, totalAmount, initialPhone = '', initialName = '', initialAddress = '' }: CheckoutFormProps) {
  const router = useRouter();
  const setCart = useCartStore((state) => state.setCart);
  const [recipientName, setRecipientName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName, address, phone, comment: comment || null }),
      });
      const json: OrderResponse = await response.json();

      if (!response.ok || !json.data) {
        setError(json.error || 'Не удалось оформить заказ');
        return;
      }

      setCart({ id: '', userId, items: [], totalAmount: 0 });
      router.push(`/orders/${json.data.id}`);
      router.refresh();
    } catch {
      setError('Не удалось оформить заказ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Данные доставки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Input
            label="ФИО получателя"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            placeholder="Иван Иванов"
            required
            minLength={2}
          />
          <Input
            label="Адрес доставки"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Город, улица, дом, квартира"
            required
            minLength={5}
          />
          <Input
            label="Телефон"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+373..."
            required
            minLength={5}
          />
          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-foreground">Комментарий</label>
            <textarea
              className="flex min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Подъезд, этаж, удобное время доставки"
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Ваш заказ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Товары</span>
              <span>{itemsCount} шт.</span>
            </div>
            <div className="flex items-center justify-between text-xl font-bold">
              <span>К оплате</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
            Подтвердить заказ
          </Button>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Менеджер свяжется для подтверждения заказа.</p>
            <p>Оплата наличными при получении.</p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
