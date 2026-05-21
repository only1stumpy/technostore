'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import type { AdminUser, PaginatedResponse } from '@/types/api';

type UsersResponse = { success: boolean; data?: PaginatedResponse<AdminUser>; error?: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchUsers() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users');
      const json: UsersResponse = await response.json();
      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить пользователей');
        return;
      }
      setUsers(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
    } catch {
      setError('Не удалось загрузить пользователей');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchInitialUsers() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/users');
        const json: UsersResponse = await response.json();
        if (!response.ok) {
          setError(json.error || 'Не удалось загрузить пользователей');
          return;
        }
        setUsers(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      } catch {
        setError('Не удалось загрузить пользователей');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchInitialUsers();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Пользователи</h1>
        <p className="mt-2 text-muted-foreground">Список зарегистрированных пользователей · всего {total}</p>
      </div>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={fetchUsers}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <DataTable headers={['Имя', 'Телефон', 'Роль', 'Заказов', 'Дата регистрации']} empty={users.length === 0} emptyText="Пользователей пока нет">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-6 py-4 font-bold">{user.name || 'Без имени'}</td>
            <td className="px-6 py-4">{user.phone}</td>
            <td className="px-6 py-4"><Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge></td>
            <td className="px-6 py-4">{user.ordersCount}</td>
            <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
