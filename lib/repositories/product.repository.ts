import { prisma } from '@/lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client';
import type { ProductCard, CursorPaginatedResponse, ProductFilters, ProductDetail } from '@/types/api';
import { decodeCursor, encodeCursor } from '@/lib/pagination';
import type { IProductRepository } from './interfaces';

export class ProductRepository implements IProductRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findMany(filters: ProductFilters): Promise<CursorPaginatedResponse<ProductCard>> {
    const where = this.buildWhereClause(filters);

    const products = await this.prismaClient.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        stock: true,
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
      orderBy: [
        { [filters.sortBy]: filters.sortOrder },
        { id: 'asc' },
      ],
      take: filters.limit + 1,
    });

    const hasMore = products.length > filters.limit;
    const data = hasMore ? products.slice(0, filters.limit) : products;

    const nextCursor = hasMore ? this.createNextCursor(data, filters.sortBy) : null;

    return {
      data: data.map((p) => ({
        ...p,
        price: Number(p.price),
        imageUrl: p.images[0] || null,
      })),
      pagination: {
        nextCursor,
        hasMore,
        limit: filters.limit,
      },
    };
  }

  async findById(id: string): Promise<ProductDetail | null> {
    const result = await this.prismaClient.product.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { id },
          { slug: id },
        ],
        category: { deletedAt: null },
        brand: { deletedAt: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        specs: true,
        createdAt: true,
        updatedAt: true,
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
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!result) return null;

    return {
      ...result,
      price: Number(result.price),
      specs: result.specs as Record<string, unknown> | null,
    };
  }

  private buildWhereClause(filters: ProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      category: { deletedAt: null },
      brand: { deletedAt: null },
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.inStock) {
      where.stock = { gt: 0 };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.cursor) {
      const cursorWhere = this.buildCursorWhere(filters.cursor, filters.sortBy, filters.sortOrder);
      if (cursorWhere) {
        where.AND = [cursorWhere];
      }
    }

    return where;
  }

  private buildCursorWhere(
    cursor: string,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Prisma.ProductWhereInput | null {
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      return null;
    }

    const operator = sortOrder === 'asc' ? 'gt' : 'lt';

    return {
      OR: [
        {
          [sortBy]: {
            [operator]: decoded.sortField,
          },
        },
        {
          [sortBy]: decoded.sortField,
          id: { gt: decoded.id },
        },
      ],
    } as Prisma.ProductWhereInput;
  }

  private createNextCursor(
    data: Array<{ id: string; [key: string]: unknown }>,
    sortBy: string
  ): string {
    const lastItem = data[data.length - 1];
    const sortValue = lastItem[sortBy];
    const sortFieldStr = typeof sortValue === 'object' && sortValue !== null && 'toString' in sortValue
      ? sortValue.toString()
      : String(sortValue);
    return encodeCursor(sortFieldStr, lastItem.id);
  }
}

export const productRepository = new ProductRepository();

export function createProductRepository(prismaClient: PrismaClient = prisma): IProductRepository {
  return new ProductRepository(prismaClient);
}
