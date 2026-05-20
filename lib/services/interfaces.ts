import type { Cart } from '@/types/api';

export interface IAuthService {
  sendVerificationCode(phone: string): Promise<void>;
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