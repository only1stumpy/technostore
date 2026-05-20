'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useCartStore } from '@/store/cartStore';
import type { CurrentUser } from '@/types/api';

export default function ProfilePage() {
  const router = useRouter();
  const resetCart = useCartStore((state) => state.resetCart);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const response = await fetch('/api/auth/me');
        if (!mounted) return;

        if (response.status === 401) {
          setUser(null);
          setLoadError(null);
          return;
        }

        if (!response.ok) {
          setLoadError('Не удалось загрузить профиль');
          return;
        }

        const data: { user: CurrentUser } = await response.json();
        setUser(data.user);
        setLoadError(null);
      } catch {
        if (mounted) {
          setLoadError('Не удалось загрузить профиль');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    setLogoutError(null);

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (!response.ok) {
        setLogoutError('Не удалось выйти из профиля');
        return;
      }

      setUser(null);
      resetCart();
      router.push('/');
      router.refresh();
    } catch {
      setLogoutError('Не удалось выйти из профиля');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const pageHeader = (
    <div className="mb-8">
      <h1 className="text-4xl font-black">Профиль</h1>
      <p className="mt-2 text-muted-foreground">Ваши данные и быстрые действия</p>
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

  if (loadError) {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Не удалось загрузить профиль</h2>
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

  if (!user) {
    return (
      <Container className="py-10">
        {pageHeader}
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Войдите, чтобы открыть профиль</h2>
              <p className="mt-2 text-muted-foreground">Профиль доступен только авторизованным пользователям</p>
            </div>
            <Link href="/login">
              <Button>Войти</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      {pageHeader}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-black text-primary-foreground">
              {(user.name || user.phone).slice(0, 1).toUpperCase()}
            </div>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Имя</dt>
                <dd className="mt-1 text-xl font-bold">{user.name || 'Не указано'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Телефон</dt>
                <dd className="mt-1 text-xl font-bold">{user.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Роль</dt>
                <dd className="mt-1 text-xl font-bold">{user.role === 'ADMIN' ? 'Администратор' : 'Покупатель'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <Link href="/catalog" className="block">
              <Button className="w-full">Перейти в каталог</Button>
            </Link>
            <Link href="/cart" className="block">
              <Button variant="secondary" className="w-full">Открыть корзину</Button>
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              isLoading={isLoggingOut}
              onClick={handleLogout}
            >
              Выйти
            </Button>
            {logoutError ? <p className="text-sm text-primary">{logoutError}</p> : null}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
