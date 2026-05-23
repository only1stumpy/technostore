import { cn } from '@/lib/utils';

type RatingSummaryProps = {
  ratingAverage?: number | null;
  reviewsCount?: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function RatingSummary({ ratingAverage, reviewsCount = 0, size = 'sm', className }: RatingSummaryProps) {
  const rating = ratingAverage ?? 0;
  const roundedRating = Math.round(rating);

  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', size === 'md' ? 'text-base' : 'text-sm', className)}>
      <div className="flex text-primary" aria-label={reviewsCount > 0 ? `Рейтинг ${rating.toFixed(1)} из 5` : 'Нет отзывов'}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= roundedRating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className={size === 'md' ? 'h-5 w-5' : 'h-4 w-4'}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        ))}
      </div>
      <span className="font-semibold">
        {reviewsCount > 0 ? `${rating.toFixed(1)} · ${reviewsCount}` : 'Нет отзывов'}
      </span>
    </div>
  );
}
