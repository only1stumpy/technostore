'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { RatingSummary } from '@/components/product/RatingSummary';
import type { ProductReview } from '@/types/api';

type ProductReviewsProps = {
  productId: string;
  ratingAverage?: number | null;
  reviewsCount?: number;
};

type ReviewsResponse = {
  success: boolean;
  data?: ProductReview[];
  error?: string;
  code?: string;
};

export function ProductReviews({ productId, ratingAverage, reviewsCount = 0 }: ProductReviewsProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      setMessage(null);

      try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        const json: ReviewsResponse = await response.json();

        if (!response.ok) {
          setMessage({ type: 'error', text: json.error || 'Не удалось загрузить отзывы' });
          return;
        }

        setReviews(json.data ?? []);
      } catch {
        setMessage({ type: 'error', text: 'Не удалось загрузить отзывы' });
      } finally {
        setIsLoading(false);
      }
    }

    void fetchReviews();
  }, [productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text }),
      });
      const json: ReviewsResponse = await response.json();

      if (response.status === 401 || json.code === 'UNAUTHORIZED') {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!response.ok) {
        setMessage({ type: 'error', text: json.error || 'Не удалось отправить отзыв' });
        return;
      }

      setText('');
      setRating(5);
      setMessage({ type: 'success', text: 'Отзыв отправлен на модерацию' });
    } catch {
      setMessage({ type: 'error', text: 'Не удалось отправить отзыв' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Отзывы</h2>
          <RatingSummary ratingAverage={ratingAverage} reviewsCount={reviewsCount} size="md" className="mt-2" />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2 sm:max-w-xs">
              <label className="text-sm font-bold uppercase tracking-tight" htmlFor="review-rating">Оценка</label>
              <select id="review-rating" className="h-11 rounded-lg border border-input bg-background px-4" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} из 5</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-bold uppercase tracking-tight" htmlFor="review-text">Ваш отзыв</label>
              <textarea id="review-text" className="min-h-32 rounded-lg border border-input bg-background px-4 py-3" value={text} onChange={(event) => setText(event.target.value)} placeholder="Расскажите о товаре" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" isLoading={isSubmitting}>Отправить отзыв</Button>
              <p className="text-sm text-muted-foreground">Отзывы появляются после проверки администратором.</p>
            </div>
          </form>
        </CardContent>
      </Card>

      {message && (
        <p className={message.type === 'success' ? 'font-semibold text-[#10b981]' : 'font-semibold text-destructive'}>{message.text}</p>
      )}

      {isLoading ? (
        <div className="flex min-h-32 items-center justify-center"><Spinner className="h-8 w-8" /></div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Одобренных отзывов пока нет.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-bold">{review.user.name || 'Покупатель'}</div>
                    <div className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</div>
                  </div>
                  <RatingSummary ratingAverage={review.rating} reviewsCount={1} />
                </div>
                <p className="text-foreground">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
