import { PrismaClient } from '@prisma/client';
import type { CreateOrderInput, OrderDetail, OrderItem, OrderSummary } from '@/types/api';
import type { IOrderRepository } from './interfaces';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError } from '@/lib/errors';

export class OrderRepository implements IOrderRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async createFromCart(userId: string, input: CreateOrderInput): Promise<OrderDetail> {
    const orderId = await this.prismaClient.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError('Корзина пуста', 400, 'EMPTY_CART');
      }

      for (const item of cart.items) {
        if (item.product.deletedAt || item.product.stock < item.quantity) {
          throw new AppError(`Недостаточно товара "${item.product.name}" на складе`, 400, 'INSUFFICIENT_STOCK');
        }
      }

      const total = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            deletedAt: null,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new AppError(`Недостаточно товара "${item.product.name}" на складе`, 400, 'INSUFFICIENT_STOCK');
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          total,
          recipientName: input.recipientName,
          address: input.address,
          phone: input.phone,
          comment: input.comment || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order.id;
    });

    const order = await this.findByIdForUser(userId, orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async findManyByUserId(userId: string): Promise<OrderSummary[]> {
    const orders = await this.prismaClient.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: Number(order.total),
      recipientName: order.recipientName,
      address: order.address,
      phone: order.phone,
      comment: order.comment,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      itemsPreview: order.items.slice(0, 3).map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  }

  async findByIdForUser(userId: string, orderId: string): Promise<OrderDetail | null> {
    const order = await this.findOrderById(userId, orderId);

    if (!order) return null;

    const items: OrderItem[] = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      imageUrl: item.product.images[0] || null,
      price: Number(item.price),
      quantity: item.quantity,
    }));

    return {
      id: order.id,
      status: order.status,
      total: Number(order.total),
      recipientName: order.recipientName,
      address: order.address,
      phone: order.phone,
      comment: order.comment,
      itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      itemsPreview: items.slice(0, 3).map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items,
    };
  }

  private async findOrderById(userId: string, orderId: string) {
    return this.prismaClient.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }
}

export const orderRepository = new OrderRepository();

export function createOrderRepository(prismaClient: PrismaClient = prisma): IOrderRepository {
  return new OrderRepository(prismaClient);
}
