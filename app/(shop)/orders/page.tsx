'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { OrderCard } from '@/components/order/OrderCard';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { OrderSummary } from '@/types/api';

type OrdersResponse = {
  success: boolean;
  data?: OrderSummary[];
  error?: string;
  code?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders');
        const json: OrdersResponse = await response.json();
        if (!mounted) return;

        if (!response.ok) {
          setError(json.error || 'Не удалось загрузить заказы');
          setErrorCode(json.code ?? null);
          return;
        }

        setOrders(json.data ?? []);
        setError(null);
        setErrorCode(null);
      } catch {
        if (mounted) {
          setError('Не удалось загрузить заказы');
          setErrorCode(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const pageHeader = (
    <div className="mb-8">
      <h1 className="text-4xl font-black">Мои заказы</h1>
      <p className="mt-2 text-muted-foreground">История заказов и статусы доставки</p>
    </div>
  );

  if (isLoading) {
    return (
      <Container className="py-10">
        {pageHeader}
        <div className="flex min-h-80 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </Container>
    );
  }

  if (errorCode === 'UNAUTHORIZED') {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Войдите, чтобы открыть заказы</h2>
              <p className="mt-2 text-muted-foreground">История заказов доступна только авторизованным пользователям</p>
            </div>
            <Link href="/login?callbackUrl=/orders">
              <Button>Войти</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Не удалось загрузить заказы</h2>
              <p className="mt-2 text-muted-foreground">Попробуйте обновить страницу или вернуться в каталог</p>
            </div>
            <Link href="/catalog">
              <Button>Перейти в каталог</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Заказов пока нет</h2>
              <p className="mt-2 text-muted-foreground">Оформите первый заказ из корзины</p>
            </div>
            <Link href="/catalog">
              <Button>Перейти в каталог</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      {pageHeader}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </Container>
  );
}
