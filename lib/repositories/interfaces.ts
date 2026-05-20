import type { ProductCard, CursorPaginatedResponse, ProductFilters, ProductDetail, Brand, CategoryTree, Cart } from '@/types/api';

export interface IProductRepository {
  findMany(filters: ProductFilters): Promise<CursorPaginatedResponse<ProductCard>>;
  findById(id: string): Promise<ProductDetail | null>;
}

export interface IBrandRepository {
  findAll(): Promise<Brand[]>;
}

export interface ICategoryRepository {
  findAllAsTree(): Promise<CategoryTree[]>;
}

export interface ICartRepository {
  getCartByUserId(userId: string): Promise<Cart | null>;
  addProductToCart(userId: string, productId: string, quantity: number): Promise<Cart>;
  updateProductQuantity(userId: string, productId: string, quantity: number): Promise<Cart>;
  removeProductFromCart(userId: string, productId: string): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
}