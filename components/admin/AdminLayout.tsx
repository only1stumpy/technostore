'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/categories', label: 'Категории' },
  { href: '/admin/brands', label: 'Бренды' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/reviews', label: 'Отзывы' },
  { href: '/admin/promo-codes', label: 'Промокоды' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/action-logs', label: 'Журнал' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <Container className="py-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border border-border bg-background p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Админ-панель</h2>
          <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/admin'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block whitespace-nowrap rounded-lg px-4 py-3 font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                    isActive && 'bg-secondary text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </Container>
  );
}
