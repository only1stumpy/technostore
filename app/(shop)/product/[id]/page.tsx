import type { Metadata } from 'next';
import { productRepository } from '@/lib/repositories/product.repository';
import { ProductPageClient } from './ProductPageClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await productRepository.findById(id);

  if (!product) {
    return {
      title: 'Товар не найден',
      description: 'Запрошенный товар не найден в каталоге TechnoStore.',
    };
  }

  const description = product.description || `${product.name} в каталоге TechnoStore.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return <ProductPageClient id={id} />;
}
