import { redirect } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { ComparisonPageClient } from '@/components/product/ComparisonPageClient';
import { getCurrentUser } from '@/lib/auth';
import { comparisonService } from '@/lib/services/comparison.service';

export const metadata = {
  title: 'Сравнение товаров | TechnoStore',
  description: 'Сравнение характеристик товаров TechnoStore',
};

export default async function ComparePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/compare');
  }

  const comparison = await comparisonService.getComparison(user.userId);

  return (
    <Container className="py-10">
      <ComparisonPageClient initialComparison={comparison} />
    </Container>
  );
}
