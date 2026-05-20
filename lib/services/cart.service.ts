import { Cart, CartItem } from '@/types/api';
import { ICartRepository } from '@/lib/repositories/interfaces';
import { createCartRepository, cartRepository } from '@/lib/repositories/cart.repository';
import { ICartService } from './interfaces';

export class CartService implements ICartService {
  constructor(private cartRepo: ICartRepository = cartRepository) {}

  async getCart(userId: string): Promise<Cart | null> {
    return this.cartRepo.getCartByUserId(userId);
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    return this.cartRepo.addProductToCart(userId, productId, quantity);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    return this.cartRepo.updateProductQuantity(userId, productId, quantity);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    return this.cartRepo.removeProductFromCart(userId, productId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.clearCart(userId);
  }
}

export const cartService = new CartService();

export function createCartService(cartRepo: ICartRepository = cartRepository): ICartService {
  return new CartService(cartRepo);
}
