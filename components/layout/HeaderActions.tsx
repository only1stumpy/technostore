'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CartIcon } from '@/components/cart/CartIcon';
import type { CurrentUser } from '@/types/api';

export function HeaderActions() {
  const pathname = usePathname();
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
          return;
        }

        const data: { user: CurrentUser } = await response.json();
        setUser(data.user);
      } catch {
        return;
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

  const displayName = user?.name || user?.phone;

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      <CartIcon />

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
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-tight text-white hover:bg-primary-hover transition-colors sm:px-6"
          style={{ fontFamily: 'var(--font-oswald)' }}
        >
          Войти
        </Link>
      )}
    </div>
  );
}
