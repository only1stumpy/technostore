import type { ProductCard, CursorPaginatedResponse, ProductFilters, ProductDetail, PriceRange, Brand, CategoryTree, Cart, CreateOrderInput, OrderDetail, OrderSummary, FavoritesResponse, ComparisonResponse, ProductReview, AdminReview, ReviewStatus, PaginatedResponse, AppliedPromoCode, AdminPromoCode, PromoCodeType, SpecFacet } from '@/types/api';
import type { OrderStatus } from '@/lib/constants';

export interface IProductRepository {
  findMany(filters: ProductFilters): Promise<CursorPaginatedResponse<ProductCard>>;
  findById(id: string): Promise<ProductDetail | null>;
  getPriceRange(categoryIds?: string[]): Promise<PriceRange>;
  getSpecFacets(categoryIds?: string[]): Promise<SpecFacet[]>;
}

export interface IBrandRepository {
  findAll(): Promise<Brand[]>;
  findByCategoryIds(categoryIds?: string[]): Promise<Brand[]>;
}

export interface ICategoryRepository {
  findAllAsTree(): Promise<CategoryTree[]>;
  findSelfAndDescendantIds(categoryId: string): Promise<string[]>;
}

export interface ICartRepository {
  getCartByUserId(userId: string): Promise<Cart | null>;
  addProductToCart(userId: string, productId: string, quantity: number): Promise<Cart>;
  updateProductQuantity(userId: string, productId: string, quantity: number): Promise<Cart>;
  removeProductFromCart(userId: string, productId: string): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
}

export interface IFavoriteRepository {
  findManyByUserId(userId: string): Promise<FavoritesResponse>;
  add(userId: string, productId: string): Promise<FavoritesResponse>;
  remove(userId: string, productId: string): Promise<FavoritesResponse>;
}

export interface IComparisonRepository {
  findManyByUserId(userId: string): Promise<ComparisonResponse>;
  add(userId: string, productId: string): Promise<ComparisonResponse>;
  remove(userId: string, productId: string): Promise<ComparisonResponse>;
  clear(userId: string): Promise<void>;
}

export type AdminReviewFilters = {
  page: number;
  limit: number;
  status?: ReviewStatus;
  productId?: string;
  rating?: number;
};

export interface IReviewRepository {
  findApprovedByProductId(productId: string): Promise<ProductReview[]>;
  create(userId: string, productId: string, rating: number, text: string): Promise<ProductReview>;
  findManyForAdmin(filters: AdminReviewFilters): Promise<PaginatedResponse<AdminReview>>;
  updateStatus(reviewId: string, status: ReviewStatus): Promise<AdminReview>;
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

export interface IPromoCodeRepository {
  applyForUserCart(userId: string, code: string): Promise<AppliedPromoCode>;
  calculate(code: string, subtotal: number): Promise<AppliedPromoCode & { promoCodeId: string }>;
  findManyForAdmin(filters: AdminPromoCodeFilters): Promise<PaginatedResponse<AdminPromoCode>>;
  create(input: PromoCodeInput): Promise<AdminPromoCode>;
  update(id: string, input: PromoCodeInput): Promise<AdminPromoCode>;
  deactivate(id: string): Promise<AdminPromoCode>;
}

export interface IOrderRepository {
  createFromCart(userId: string, input: CreateOrderInput): Promise<OrderDetail>;
  findManyByUserId(userId: string): Promise<OrderSummary[]>;
  findByIdForUser(userId: string, orderId: string): Promise<OrderDetail | null>;
  cancelByUser(userId: string, orderId: string): Promise<OrderDetail>;
  cancelOrder(orderId: string, options: { userId?: string }): Promise<OrderDetail>;
  updateStatusByAdmin(orderId: string, status: OrderStatus): Promise<{ order: OrderDetail; previousStatus: OrderStatus }>;
  repeatForUser(userId: string, orderId: string): Promise<Cart>;
}