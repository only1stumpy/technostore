'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const itemsCount = useCartStore((state) => state.itemsCount);
  const isLoading = useCartStore((state) => state.isLoading);
  const hasFetched = useCartStore((state) => state.hasFetched);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!hasFetched) {
      fetchCart();
    }
  }, [fetchCart, hasFetched]);

  const isAuthError = error === 'Не авторизован' || error === 'User not authenticated';
  const pageHeader = (
    <div className="mb-8">
      <h1 className="text-4xl font-black">Корзина</h1>
      <p className="mt-2 text-muted-foreground">Проверьте товары перед оформлением заказа</p>
    </div>
  );

  if (isLoading && items.length === 0) {
    return (
      <Container className="py-10">
        {pageHeader}
        <div className="flex min-h-80 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </Container>
    );
  }

  if (isAuthError) {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Войдите, чтобы открыть корзину</h2>
              <p className="mt-2 text-muted-foreground">Корзина доступна только авторизованным пользователям</p>
            </div>
            <Link href="/login">
              <Button>Войти</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Корзина пуста</h2>
              <p className="mt-2 text-muted-foreground">Добавьте товары из каталога, чтобы оформить заказ</p>
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
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              isLoading={isLoading}
              onUpdateQuantity={async (productId, quantity) => {
                await updateItem(productId, quantity);
              }}
              onRemoveItem={async (productId) => {
                await removeItem(productId);
              }}
            />
          ))}
        </div>

        <CartSummary
          total={totalAmount}
          itemsCount={itemsCount}
          isLoading={isLoading}
          onClear={clearCart}
        />
      </div>
    </Container>
  );
}
