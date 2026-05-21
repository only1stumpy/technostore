'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { OrderStatus } from '@/components/order/OrderStatus';
import { formatPrice } from '@/lib/utils';
import type { AdminStats } from '@/types/api';

type StatsResponse = { success: boolean; data?: AdminStats; error?: string };

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        const json: StatsResponse = await response.json();
        if (response.ok) {
          setStats(json.data ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black">Дашборд</h1>
        <p className="mt-2 text-muted-foreground">Ключевые показатели магазина</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Товары" value={stats?.productsCount ?? 0} />
        <StatCard label="Заказы" value={stats?.ordersCount ?? 0} />
        <StatCard label="Пользователи" value={stats?.usersCount ?? 0} />
        <StatCard label="Выручка" value={formatPrice(stats?.revenue ?? 0)} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Последние заказы</h2>
            <Link className="font-semibold text-primary" href="/admin/orders">Все заказы</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders.length ? stats.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-secondary/40">
                <div>
                  <p className="font-bold">Заказ #{order.id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">{order.user.name || order.user.phone}</p>
                </div>
                <div className="text-right">
                  <OrderStatus status={order.status} />
                  <p className="mt-2 font-bold">{formatPrice(order.total)}</p>
                </div>
              </Link>
            )) : <p className="text-muted-foreground">Заказов пока нет</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-semibold uppercase text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}
