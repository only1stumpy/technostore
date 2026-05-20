import { PrismaClient } from '@prisma/client';
import type { Cart, CartItem } from '@/types/api';
import type { ICartRepository } from './interfaces';
import { prisma } from '@/lib/prisma';
import { NotFoundError, AppError } from '@/lib/errors';

export class CartRepository implements ICartRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async getCartByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.prismaClient.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) return null;

    const formattedItems: CartItem[] = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      imageUrl: item.product.images[0] || null,
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    const totalAmount = formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items: formattedItems,
      totalAmount,
    };
  }

  async addProductToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    let cart = await this.prismaClient.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prismaClient.cart.create({
        data: {
          userId,
        },
        include: { items: true },
      });
    }

    const product = await this.prismaClient.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: { id: true, stock: true },
    });

    if (!product || product.stock < quantity) {
      throw new AppError('Product not found or out of stock', 400, 'PRODUCT_UNAVAILABLE');
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      if (product.stock < existingItem.quantity + quantity) {
        throw new AppError('Not enough stock for this quantity', 400, 'INSUFFICIENT_STOCK');
      }
      await this.prismaClient.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prismaClient.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCartByUserId(userId) as Promise<Cart>;
  }

  async updateProductQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.prismaClient.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const product = await this.prismaClient.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: { id: true, stock: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < quantity) {
      throw new AppError('Not enough stock for this quantity', 400, 'INSUFFICIENT_STOCK');
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (!existingItem) {
      throw new NotFoundError('Product not in cart');
    }

    if (quantity === 0) {
      await this.prismaClient.cartItem.delete({
        where: { id: existingItem.id },
      });
    } else {
      await this.prismaClient.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });
    }

    return this.getCartByUserId(userId) as Promise<Cart>;
  }

  async removeProductFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.prismaClient.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (!existingItem) {
      throw new NotFoundError('Product not in cart');
    }

    await this.prismaClient.cartItem.delete({
      where: { id: existingItem.id },
    });

    return this.getCartByUserId(userId) as Promise<Cart>;
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.prismaClient.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    await this.prismaClient.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}

export const cartRepository = new CartRepository();

export function createCartRepository(prismaClient: PrismaClient = prisma): ICartRepository {
  return new CartRepository(prismaClient);
}
