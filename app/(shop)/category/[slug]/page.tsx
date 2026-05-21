import type { Metadata } from 'next';
import { Suspense } from 'react';
import { categoryRepository } from '@/lib/repositories/category.repository';
import type { CategoryTree } from '@/types/api';
import { CategoryPageClient } from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function findCategoryBySlug(categories: CategoryTree[], slug: string): CategoryTree | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    const child = findCategoryBySlug(category.children ?? [], slug);
    if (child) {
      return child;
    }
  }

  return null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await categoryRepository.findAllAsTree();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    return {
      title: 'Категория не найдена',
      description: 'Запрошенная категория не найдена в каталоге TechnoStore.',
    };
  }

  const description = `${category.name}: товары и электроника в каталоге TechnoStore.`;

  return {
    title: category.name,
    description,
    openGraph: {
      title: category.name,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={null}>
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}
