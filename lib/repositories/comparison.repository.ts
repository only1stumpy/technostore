import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { ComparisonResponse } from '@/types/api';
import type { IComparisonRepository } from './interfaces';

const COMPARISON_LIMIT = 4;

export class ComparisonRepository implements IComparisonRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findManyByUserId(userId: string): Promise<ComparisonResponse> {
    const comparisons = await this.prismaClient.productComparison.findMany({
      where: {
        userId,
        product: {
          deletedAt: null,
          category: { deletedAt: null },
          brand: { deletedAt: null },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
            specs: true,
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const items = comparisons.map((comparison) => ({
      id: comparison.product.id,
      name: comparison.product.name,
      slug: comparison.product.slug,
      price: Number(comparison.product.price),
      imageUrl: comparison.product.images[0] || null,
      stock: comparison.product.stock,
      specs: comparison.product.specs as Record<string, unknown> | null,
      brand: comparison.product.brand,
      category: comparison.product.category,
      isCompared: true,
      addedAt: comparison.createdAt.toISOString(),
    }));

    return {
      items,
      count: items.length,
    };
  }

  async add(userId: string, productId: string): Promise<ComparisonResponse> {
    const product = await this.prismaClient.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        category: { deletedAt: null },
        brand: { deletedAt: null },
      },
      select: {
        id: true,
        categoryId: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    const current = await this.prismaClient.productComparison.findMany({
      where: {
        userId,
        product: {
          deletedAt: null,
          category: { deletedAt: null },
          brand: { deletedAt: null },
        },
      },
      select: {
        productId: true,
        product: {
          select: {
            categoryId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (current.some((item) => item.productId === productId)) {
      return this.findManyByUserId(userId);
    }

    if (current.length >= COMPARISON_LIMIT) {
      throw new ValidationError('В сравнении может быть не больше 4 товаров');
    }

    if (current.length > 0 && current[0].product.categoryId !== product.categoryId) {
      throw new ValidationError('Можно сравнивать только товары из одной категории');
    }

    await this.prismaClient.productComparison.create({
      data: {
        userId,
        productId,
      },
    });

    return this.findManyByUserId(userId);
  }

  async remove(userId: string, productId: string): Promise<ComparisonResponse> {
    await this.prismaClient.productComparison.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return this.findManyByUserId(userId);
  }

  async clear(userId: string): Promise<void> {
    await this.prismaClient.productComparison.deleteMany({
      where: { userId },
    });
  }
}

export const comparisonRepository = new ComparisonRepository();

export function createComparisonRepository(prismaClient: PrismaClient = prisma): IComparisonRepository {
  return new ComparisonRepository(prismaClient);
}
