import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import type { FavoritesResponse } from '@/types/api';
import type { IFavoriteRepository } from './interfaces';

export class FavoriteRepository implements IFavoriteRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findManyByUserId(userId: string): Promise<FavoritesResponse> {
    const favorites = await this.prismaClient.favorite.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const items = favorites.map((favorite) => ({
      id: favorite.product.id,
      name: favorite.product.name,
      slug: favorite.product.slug,
      price: Number(favorite.product.price),
      imageUrl: favorite.product.images[0] || null,
      stock: favorite.product.stock,
      brand: favorite.product.brand,
      category: favorite.product.category,
      isFavorite: true,
      addedAt: favorite.createdAt.toISOString(),
    }));

    return {
      items,
      count: items.length,
    };
  }

  async add(userId: string, productId: string): Promise<FavoritesResponse> {
    const product = await this.prismaClient.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        category: { deletedAt: null },
        brand: { deletedAt: null },
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    await this.prismaClient.favorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
    });

    return this.findManyByUserId(userId);
  }

  async remove(userId: string, productId: string): Promise<FavoritesResponse> {
    await this.prismaClient.favorite.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return this.findManyByUserId(userId);
  }
}

export const favoriteRepository = new FavoriteRepository();

export function createFavoriteRepository(prismaClient: PrismaClient = prisma): IFavoriteRepository {
  return new FavoriteRepository(prismaClient);
}
