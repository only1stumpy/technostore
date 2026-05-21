import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        category: { deletedAt: null },
        brand: { deletedAt: null },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      select: {
        slug: true,
      },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/catalog',
    '/about',
    '/contacts',
    '/delivery',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
