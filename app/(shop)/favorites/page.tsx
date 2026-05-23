import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getCurrentUser } from '@/lib/auth';
import { favoriteService } from '@/lib/services/favorite.service';

export const metadata = {
  title: 'Избранное | TechnoStore',
  description: 'Сохраненные товары TechnoStore',
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnTo=/favorites');
  }

  const favorites = await favoriteService.getFavorites(user.userId);

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Избранное</h1>
          <p className="mt-2 text-muted-foreground">Сохраненные товары, к которым удобно вернуться позже</p>
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          {favorites.count} товаров
        </div>
      </div>

      {favorites.items.length > 0 ? (
        <ProductGrid products={favorites.items} />
      ) : (
        <div className="rounded-lg border border-border bg-background p-10 text-center">
          <h2 className="text-2xl font-black">В избранном пока пусто</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Добавляйте товары из каталога, чтобы быстро находить их перед покупкой.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 font-bold uppercase tracking-tight text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Перейти в каталог
          </Link>
        </div>
      )}
    </Container>
  );
}
