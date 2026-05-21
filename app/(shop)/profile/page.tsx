'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useCartStore } from '@/store/cartStore';
import type { CurrentUser } from '@/types/api';

export default function ProfilePage() {
  const router = useRouter();
  const resetCart = useCartStore((state) => state.resetCart);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const response = await fetch('/api/auth/me');
        if (!mounted) return;

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          setLoadError('Не удалось загрузить профиль');
          return;
        }

        const data: { user: CurrentUser } = await response.json();
        setUser(data.user);
        setName(data.user.name ?? '');
        setAddress(data.user.address ?? '');
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
  }, [router]);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || null, address: address || null }),
      });
      const json: { success: boolean; data?: CurrentUser; error?: string } = await response.json();

      if (!response.ok || !json.data) {
        setSaveError(json.error || 'Не удалось сохранить профиль');
        return;
      }

      setUser(json.data);
      setName(json.data.name ?? '');
      setAddress(json.data.address ?? '');
      setSaveSuccess('Профиль сохранён');
    } catch {
      setSaveError('Не удалось сохранить профиль');
    } finally {
      setIsSaving(false);
    }
  };

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
          <CardContent className="flex min-h-80 items-center justify-center text-center">
            <p className="text-muted-foreground">Перенаправляем на вход...</p>
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
            <form className="space-y-5" onSubmit={handleSaveProfile}>
              {saveError ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{saveError}</p> : null}
              {saveSuccess ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{saveSuccess}</p> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Имя" value={name} onChange={(event) => setName(event.target.value)} placeholder="Иван Иванов" minLength={2} />
                <Input label="Телефон" value={user.phone} disabled />
              </div>
              <Input label="Адрес доставки" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Город, улица, дом, квартира" minLength={5} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">Роль: {user.role === 'ADMIN' ? 'Администратор' : 'Покупатель'}</p>
                <Button type="submit" isLoading={isSaving} disabled={isSaving}>Сохранить профиль</Button>
              </div>
            </form>
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
            <Link href="/profile/orders" className="block">
              <Button variant="secondary" className="w-full">Мои заказы</Button>
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
