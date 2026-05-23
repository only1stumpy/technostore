'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CartIcon } from '@/components/cart/CartIcon';
import { useFavoriteStore } from '@/store/favoriteStore';
import type { CurrentUser } from '@/types/api';

type HeaderActionsProps = {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function HeaderActions({ variant = 'desktop', onNavigate }: HeaderActionsProps) {
  const pathname = usePathname();
  const count = useFavoriteStore((state) => state.count);
  const hasFetchedFavorites = useFavoriteStore((state) => state.hasFetched);
  const fetchFavorites = useFavoriteStore((state) => state.fetchFavorites);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (!mounted) return;

        if (response.status === 401) {
          setUser(null);
          return;
        }

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data: { user: CurrentUser } = await response.json();
        setUser(data.user);
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchUser();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (user && !hasFetchedFavorites) {
      void fetchFavorites({ silentAuth: true });
    }
  }, [fetchFavorites, hasFetchedFavorites, user]);

  const displayName = user?.name || user?.phone;
  const favoritesBadge = count > 99 ? '99+' : String(count);

  if (variant === 'mobile') {
    return (
      <div className="grid gap-2 border-t border-border pt-3">
        <Link
          href="/cart"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-tight text-foreground hover:bg-secondary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25h.008v.008H6v-.008zm12.75 0h.008v.008h-.008v-.008z" />
          </svg>
          <span className="font-bold">Корзина</span>
        </Link>

        <Link
          href="/compare"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-tight text-foreground hover:bg-secondary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-4.5-13L21 8m0 0-4.5 4.5M21 8H3" />
          </svg>
          <span className="font-bold">Сравнение</span>
        </Link>

        <Link
          href="/favorites"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-tight text-foreground hover:bg-secondary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="font-bold">Избранное</span>
          {count > 0 && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">
              {favoritesBadge}
            </span>
          )}
        </Link>

        {isLoading ? (
          <div className="h-10 rounded-lg bg-secondary" />
        ) : user ? (
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-tight text-foreground hover:bg-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
            <span className="truncate font-bold">{displayName}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-tight text-foreground hover:bg-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="font-bold">Войти</span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      <CartIcon />
      <Link
        href="/compare"
        className="text-foreground transition-colors hover:text-primary"
        aria-label="Сравнение"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-4.5-13L21 8m0 0-4.5 4.5M21 8H3" />
        </svg>
      </Link>
      <Link
        href="/favorites"
        className="relative text-foreground transition-colors hover:text-primary"
        aria-label={count > 0 ? `Избранное: ${count}` : 'Избранное'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black leading-none text-white">
            {favoritesBadge}
          </span>
        )}
      </Link>

      {isLoading ? (
        <div className="h-10 w-24 animate-pulse rounded-lg bg-secondary" />
      ) : user ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/profile"
            className="max-w-24 truncate text-sm font-bold uppercase tracking-tight text-foreground hover:text-primary transition-colors sm:max-w-44"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            {displayName}
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-tight text-white hover:bg-primary-hover transition-colors sm:px-6"        >
          Войти
        </Link>
      )}
    </div>
  );
}
