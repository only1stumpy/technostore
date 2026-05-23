'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { DataTable } from '@/components/admin/DataTable';
import type { AdminReview, PaginatedResponse, ReviewStatus } from '@/types/api';

type ReviewsResponse = { success: boolean; data?: PaginatedResponse<AdminReview>; error?: string };
type ReviewResponse = { success: boolean; data?: AdminReview; error?: string };

const statuses: ReviewStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
const statusLabels: Record<ReviewStatus, string> = {
  PENDING: 'На проверке',
  APPROVED: 'Одобрен',
  REJECTED: 'Отклонен',
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (rating) params.set('rating', rating);

      const response = await fetch(params.size ? `/api/admin/reviews?${params}` : '/api/admin/reviews');
      const json: ReviewsResponse = await response.json();

      if (!response.ok) {
        setError(json.error || 'Не удалось загрузить отзывы');
        return;
      }

      setReviews(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
    } catch {
      setError('Не удалось загрузить отзывы');
    } finally {
      setIsLoading(false);
    }
  }, [status, rating]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchReviews();
    });
  }, [fetchReviews]);

  async function updateStatus(reviewId: string, nextStatus: ReviewStatus) {
    setPendingId(reviewId);
    setError('');

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json: ReviewResponse = await response.json();

      if (!response.ok || !json.data) {
        setError(json.error || 'Не удалось обновить отзыв');
        return;
      }

      setReviews((items) => items.map((item) => item.id === reviewId ? json.data as AdminReview : item));
    } catch {
      setError('Не удалось обновить отзыв');
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) {
    return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Отзывы</h1>
        <p className="mt-2 text-muted-foreground">Модерация отзывов покупателей</p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              Статус
              <select className="mt-2 h-11 rounded-lg border border-input bg-background px-4" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Все</option>
                {statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Оценка
              <select className="mt-2 h-11 rounded-lg border border-input bg-background px-4" value={rating} onChange={(event) => setRating(event.target.value)}>
                <option value="">Все</option>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Найдено: {total}</p>
            {(status || rating) && <Button variant="secondary" onClick={() => { setStatus(''); setRating(''); }}>Сбросить</Button>}
          </div>
        </CardContent>
      </Card>
      {error && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="secondary" onClick={fetchReviews}>Повторить</Button>
          </CardContent>
        </Card>
      )}
      <DataTable headers={['Товар', 'Покупатель', 'Оценка', 'Отзыв', 'Статус', 'Дата', 'Действия']} empty={reviews.length === 0} emptyText="Отзывов пока нет" minWidth="1080px">
        {reviews.map((review) => (
          <tr key={review.id}>
            <td className="px-6 py-4 font-bold"><Link className="hover:text-primary" href={`/product/${review.product.id}`}>{review.product.name}</Link></td>
            <td className="px-6 py-4">{review.user.name || review.user.phone}</td>
            <td className="px-6 py-4 font-bold">{review.rating}/5</td>
            <td className="max-w-md px-6 py-4 text-sm text-muted-foreground">{review.text}</td>
            <td className="px-6 py-4 font-semibold">{statusLabels[review.status ?? 'PENDING']}</td>
            <td className="px-6 py-4">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" isLoading={pendingId === review.id} disabled={review.status === 'APPROVED'} onClick={() => updateStatus(review.id, 'APPROVED')}>Одобрить</Button>
                <Button size="sm" variant="destructive" isLoading={pendingId === review.id} disabled={review.status === 'REJECTED'} onClick={() => updateStatus(review.id, 'REJECTED')}>Отклонить</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
