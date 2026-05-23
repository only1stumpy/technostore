import type { Cart, CreateOrderInput, OrderDetail, OrderSummary, FavoritesResponse, ComparisonResponse, ProductReview, AdminReview, ReviewStatus, PaginatedResponse, AppliedPromoCode, AdminPromoCode, PromoCodeType } from '@/types/api';

export interface IAuthService {
  sendVerificationCode(phone: string): Promise<{ code?: string }>;
  verifyCodeAndLogin(phone: string, code: string, name?: string): Promise<{
    user: {
      id: string;
      phone: string;
      name: string | null;
      role: string;
    };
  }>;
}

export interface ICartService {
  getCart(userId: string): Promise<Cart | null>;
  addItem(userId: string, productId: string, quantity: number): Promise<Cart>;
  updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart>;
  removeItem(userId: string, productId: string): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
}

export interface IFavoriteService {
  getFavorites(userId: string): Promise<FavoritesResponse>;
  addFavorite(userId: string, productId: string): Promise<FavoritesResponse>;
  removeFavorite(userId: string, productId: string): Promise<FavoritesResponse>;
}

export interface IComparisonService {
  getComparison(userId: string): Promise<ComparisonResponse>;
  addComparisonItem(userId: string, productId: string): Promise<ComparisonResponse>;
  removeComparisonItem(userId: string, productId: string): Promise<ComparisonResponse>;
  clearComparison(userId: string): Promise<void>;
}

export type AdminReviewFilters = {
  page: number;
  limit: number;
  status?: ReviewStatus;
  productId?: string;
  rating?: number;
};

export interface IReviewService {
  getProductReviews(productId: string): Promise<ProductReview[]>;
  createReview(userId: string, productId: string, rating: number, text: string): Promise<ProductReview>;
  getAdminReviews(filters: AdminReviewFilters): Promise<PaginatedResponse<AdminReview>>;
  updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<AdminReview>;
}

export type AdminPromoCodeFilters = {
  page: number;
  limit: number;
};

export type PromoCodeInput = {
  code: string;
  type: PromoCodeType;
  value: number;
  minOrderTotal: number;
  usageLimit?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive: boolean;
};

export interface IPromoCodeService {
  applyForUserCart(userId: string, code: string): Promise<AppliedPromoCode>;
  calculate(code: string, subtotal: number): Promise<AppliedPromoCode & { promoCodeId: string }>;
  getAdminPromoCodes(filters: AdminPromoCodeFilters): Promise<PaginatedResponse<AdminPromoCode>>;
  createPromoCode(input: PromoCodeInput): Promise<AdminPromoCode>;
  updatePromoCode(id: string, input: PromoCodeInput): Promise<AdminPromoCode>;
  deactivatePromoCode(id: string): Promise<AdminPromoCode>;
}

export interface IOrderService {
  createOrder(userId: string, input: CreateOrderInput): Promise<OrderDetail>;
  getOrders(userId: string): Promise<OrderSummary[]>;
  getOrder(userId: string, orderId: string): Promise<OrderDetail | null>;
  cancelOrder(userId: string, orderId: string): Promise<OrderDetail>;
  repeatOrder(userId: string, orderId: string): Promise<Cart>;
}