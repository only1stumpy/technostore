import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import type { CategoryTree } from '@/types/api';
import type { ICategoryRepository } from './interfaces';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findAllAsTree(): Promise<CategoryTree[]> {
    const allCategories = await this.prismaClient.category.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        productCount: cat._count.products,
        children: [],
      });
    });

    categoryMap.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent && parent.children) {
          parent.children.push(cat);
        }
      } else {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }
}

export const categoryRepository = new CategoryRepository();

export function createCategoryRepository(prismaClient: PrismaClient = prisma): ICategoryRepository {
  return new CategoryRepository(prismaClient);
}
