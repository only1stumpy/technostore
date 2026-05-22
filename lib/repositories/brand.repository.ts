import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import type { Brand } from '@/types/api';
import type { IBrandRepository } from './interfaces';

export class BrandRepository implements IBrandRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findAll(): Promise<Brand[]> {
    return this.findByCategoryIds();
  }

  async findByCategoryIds(categoryIds?: string[]): Promise<Brand[]> {
    const productWhere = {
      deletedAt: null,
      category: { deletedAt: null },
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    };

    const result = await this.prismaClient.brand.findMany({
      where: {
        deletedAt: null,
        products: { some: productWhere },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: productWhere,
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return result.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand._count.products,
    }));
  }
}

export const brandRepository = new BrandRepository();

export function createBrandRepository(prismaClient: PrismaClient = prisma): IBrandRepository {
  return new BrandRepository(prismaClient);
}
