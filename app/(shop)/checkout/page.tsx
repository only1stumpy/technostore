'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckoutForm } from '@/components/order/CheckoutForm';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useCartStore } from '@/store/cartStore';
import type { CurrentUser } from '@/types/api';

export default function CheckoutPage() {
  const userId = useCartStore((state) => state.userId);
  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const isLoading = useCartStore((state) => state.isLoading);
  const hasFetched = useCartStore((state) => state.hasFetched);
  const errorCode = useCartStore((state) => state.errorCode);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (!hasFetched) {
      fetchCart();
    }
  }, [fetchCart, hasFetched]);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        setProfileError(null);
        const response = await fetch('/api/auth/me');
        if (!response.ok || !mounted) return;

        const data: { user: CurrentUser } = await response.json();
        setPhone(data.user.phone);
        setName(data.user.name ?? '');
        setAddress(data.user.address ?? '');
      } catch {
        if (mounted) {
          setProfileError('Не удалось загрузить данные профиля');
        }
      } finally {
        if (mounted) {
          setIsProfileLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const isAuthError = errorCode === 'UNAUTHORIZED';
  const pageHeader = (
    <div className="mb-8">
      <h1 className="text-4xl font-black">Оформление заказа</h1>
      <p className="mt-2 text-muted-foreground">Укажите данные доставки и подтвердите заказ</p>
    </div>
  );

  if ((isLoading && items.length === 0) || isProfileLoading) {
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
              <h2 className="text-2xl font-bold">Войдите, чтобы оформить заказ</h2>
              <p className="mt-2 text-muted-foreground">Оформление заказа доступно только авторизованным пользователям</p>
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
              <p className="mt-2 text-muted-foreground">Добавьте товары из каталога перед оформлением заказа</p>
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
      {profileError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {profileError}
        </div>
      )}
      <CheckoutForm userId={userId} items={items} totalAmount={totalAmount} initialPhone={phone} initialName={name} initialAddress={address} />
    </Container>
  );
}
