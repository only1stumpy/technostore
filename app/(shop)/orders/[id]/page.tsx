'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderItems } from '@/components/order/OrderItems';
import { OrderStatus } from '@/components/order/OrderStatus';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Cart, OrderDetail } from '@/types/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

type OrderResponse = {
  success: boolean;
  data?: OrderDetail;
  error?: string;
  code?: string;
};

type RepeatOrderResponse = {
  success: boolean;
  data?: Cart;
  error?: string;
};

const statusDescriptions = {
  NEW: 'Ожидает подтверждения менеджером',
  CONFIRMED: 'Заказ подтверждён и скоро перейдёт в обработку',
  PROCESSING: 'Заказ собирается на складе',
  SHIPPED: 'Заказ передан в доставку',
  DELIVERED: 'Заказ доставлен',
  CANCELLED: 'Заказ отменён',
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const setCart = useCartStore((state) => state.setCart);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const json: OrderResponse = await response.json();
        if (!mounted) return;

        if (!response.ok) {
          setError(json.error || 'Не удалось загрузить заказ');
          setErrorCode(json.code ?? null);
          return;
        }

        setOrder(json.data ?? null);
        setError(null);
        setErrorCode(null);
      } catch {
        if (mounted) {
          setError('Не удалось загрузить заказ');
          setErrorCode(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrder();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  async function cancelOrder() {
    if (!order) return;

    setIsCancelling(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' });
      const json: OrderResponse = await response.json();

      if (!response.ok || !json.data) {
        setActionError(json.error || 'Не удалось отменить заказ');
        return;
      }

      setOrder(json.data);
    } catch {
      setActionError('Не удалось отменить заказ');
    } finally {
      setIsCancelling(false);
    }
  }

  async function repeatOrder() {
    if (!order) return;

    setIsRepeating(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/repeat`, { method: 'POST' });
      const json: RepeatOrderResponse = await response.json();

      if (!response.ok || !json.data) {
        setActionError(json.error || 'Не удалось повторить заказ');
        return;
      }

      setCart(json.data);
      router.push('/cart');
      router.refresh();
    } catch {
      setActionError('Не удалось повторить заказ');
    } finally {
      setIsRepeating(false);
    }
  }

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="flex min-h-80 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </Container>
    );
  }

  if (!order || error) {
    const isUnauthorized = errorCode === 'UNAUTHORIZED';
    const title = isUnauthorized ? 'Войдите, чтобы открыть заказ' : 'Заказ не найден';
    const description = isUnauthorized
      ? 'Детали заказа доступны только авторизованным пользователям'
      : 'Проверьте ссылку или вернитесь к истории заказов';
    const href = isUnauthorized ? '/login' : '/orders';
    const buttonText = isUnauthorized ? 'Войти' : 'К заказам';

    return (
      <Container className="py-10">
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
            <Link href={href}>
              <Button>{buttonText}</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-black">Заказ #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="mt-2 text-muted-foreground">Создан {formatDate(order.createdAt)}</p>
        </div>
        <div className="space-y-3 md:text-right">
          <div className="space-y-2">
            <OrderStatus status={order.status} />
            <p className="text-sm text-muted-foreground">{statusDescriptions[order.status]}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {order.status === 'NEW' ? (
              <Button variant="secondary" size="sm" isLoading={isCancelling} disabled={isCancelling || isRepeating} onClick={cancelOrder}>
                Отменить заказ
              </Button>
            ) : null}
            <Button size="sm" isLoading={isRepeating} disabled={isRepeating || isCancelling} onClick={repeatOrder}>
              Повторить заказ
            </Button>
          </div>
          {actionError ? <p className="text-sm font-semibold text-destructive">{actionError}</p> : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Товары</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderItems items={order.items} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Доставка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Получатель</p>
                <p className="mt-1 font-medium">{order.recipientName || 'Не указан'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Адрес</p>
                <p className="mt-1 font-medium">{order.address}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Телефон</p>
                <p className="mt-1 font-medium">{order.phone}</p>
              </div>
              {order.comment ? (
                <div>
                  <p className="text-muted-foreground">Комментарий</p>
                  <p className="mt-1 font-medium">{order.comment}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Товары</span>
                <span>{order.itemsCount} шт.</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Сумма товаров</span>
                <span>{formatPrice(order.subtotal ?? order.total)}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex items-center justify-between text-sm text-accent">
                  <span>Скидка{order.promoCode ? ` · ${order.promoCode}` : ''}</span>
                  <span>−{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-border pt-4 text-xl font-bold">
                <span>К оплате</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Оплата наличными при получении</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
