import type { AdminReview, PaginatedResponse, ProductReview, ReviewStatus } from '@/types/api';
import { reviewRepository } from '@/lib/repositories/review.repository';
import type { AdminReviewFilters, IReviewRepository } from '@/lib/repositories/interfaces';
import type { IReviewService } from './interfaces';

export class ReviewService implements IReviewService {
  constructor(private reviewRepo: IReviewRepository = reviewRepository) {}

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return this.reviewRepo.findApprovedByProductId(productId);
  }

  async createReview(userId: string, productId: string, rating: number, text: string): Promise<ProductReview> {
    return this.reviewRepo.create(userId, productId, rating, text);
  }

  async getAdminReviews(filters: AdminReviewFilters): Promise<PaginatedResponse<AdminReview>> {
    return this.reviewRepo.findManyForAdmin(filters);
  }

  async updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<AdminReview> {
    return this.reviewRepo.updateStatus(reviewId, status);
  }
}

export const reviewService = new ReviewService();

export function createReviewService(reviewRepo: IReviewRepository = reviewRepository): IReviewService {
  return new ReviewService(reviewRepo);
}
