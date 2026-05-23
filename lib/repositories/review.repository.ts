import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { AdminReview, PaginatedResponse, ProductReview, ReviewStatus } from '@/types/api';
import type { AdminReviewFilters, IReviewRepository } from './interfaces';

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: { user: { select: { id: true; name: true } } };
}>;

type AdminReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    product: { select: { id: true; name: true; slug: true } };
    user: { select: { id: true; name: true; phone: true } };
  };
}>;

function formatProductReview(review: ReviewWithUser): ProductReview {
  return {
    id: review.id,
    rating: review.rating,
    text: review.text,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    user: review.user,
  };
}

function formatAdminReview(review: AdminReviewWithRelations): AdminReview {
  return {
    id: review.id,
    rating: review.rating,
    text: review.text,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    product: review.product,
    user: review.user,
  };
}

export class ReviewRepository implements IReviewRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findApprovedByProductId(productId: string): Promise<ProductReview[]> {
    const reviews = await this.prismaClient.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
        product: {
          deletedAt: null,
          category: { deletedAt: null },
          brand: { deletedAt: null },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(formatProductReview);
  }

  async create(userId: string, productId: string, rating: number, text: string): Promise<ProductReview> {
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

    try {
      const review = await this.prismaClient.review.create({
        data: {
          userId,
          productId,
          rating,
          text,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return formatProductReview(review);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ValidationError('Вы уже оставили отзыв на этот товар');
      }

      throw error;
    }
  }

  async findManyForAdmin(filters: AdminReviewFilters): Promise<PaginatedResponse<AdminReview>> {
    const where: Prisma.ReviewWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.productId) where.productId = filters.productId;
    if (filters.rating) where.rating = filters.rating;

    const [reviews, total] = await Promise.all([
      this.prismaClient.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prismaClient.review.count({ where }),
    ]);

    return {
      items: reviews.map(formatAdminReview),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async updateStatus(reviewId: string, status: ReviewStatus): Promise<AdminReview> {
    try {
      const review = await this.prismaClient.review.update({
        where: { id: reviewId },
        data: { status },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      return formatAdminReview(review);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Отзыв не найден');
      }

      throw error;
    }
  }
}

export const reviewRepository = new ReviewRepository();

export function createReviewRepository(prismaClient: PrismaClient = prisma): IReviewRepository {
  return new ReviewRepository(prismaClient);
}
