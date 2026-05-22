import type { ProductCard, CursorPaginatedResponse, ProductFilters, ProductDetail, PriceRange, Brand, CategoryTree, Cart, CreateOrderInput, OrderDetail, OrderSummary } from '@/types/api';

export interface IProductRepository {
  findMany(filters: ProductFilters): Promise<CursorPaginatedResponse<ProductCard>>;
  findById(id: string): Promise<ProductDetail | null>;
  getPriceRange(categoryIds?: string[]): Promise<PriceRange>;
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

export interface IOrderRepository {
  createFromCart(userId: string, input: CreateOrderInput): Promise<OrderDetail>;
  findManyByUserId(userId: string): Promise<OrderSummary[]>;
  findByIdForUser(userId: string, orderId: string): Promise<OrderDetail | null>;
}