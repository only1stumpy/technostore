import { Prisma, PrismaClient } from '@prisma/client';
import type { Cart, CartItem, CreateOrderInput, OrderDetail, OrderItem, OrderSummary } from '@/types/api';
import type { IOrderRepository } from './interfaces';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@/lib/constants';
import { createHash } from 'crypto';

export class OrderRepository implements IOrderRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async createFromCart(userId: string, input: CreateOrderInput): Promise<OrderDetail> {
    if (input.idempotencyKey) {
      const existingOrder = await this.findByIdempotencyKey(userId, input.idempotencyKey);

      if (existingOrder) {
        const cart = await this.prismaClient.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!this.matchesFingerprint(input, cart, existingOrder)) {
          throw new AppError(
            'Идемпотентный ключ уже использован с другими данными заказа',
            409,
            'IDEMPOTENCY_KEY_CONFLICT'
          );
        }

        return this.formatOrderDetail(existingOrder);
      }
    }

    let orderId: string;
    try {
      orderId = await this.prismaClient.$transaction(async (tx) => {
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

      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      let promoCodeId: string | null = null;
      let promoCode: string | null = null;
      let promoUsageLimit: number | null = null;
      let discountAmount = 0;
      let total = subtotal;

      if (input.promoCode) {
        const promo = await tx.promoCode.findUnique({
          where: { code: input.promoCode },
        });

        if (!promo) {
          throw new ValidationError('Промокод не найден');
        }

        const now = new Date();
        const minOrderTotal = Number(promo.minOrderTotal);

        if (!promo.isActive) {
          throw new ValidationError('Промокод неактивен');
        }

        if (promo.startsAt && promo.startsAt > now) {
          throw new ValidationError('Промокод еще не действует');
        }

        if (promo.expiresAt && promo.expiresAt < now) {
          throw new ValidationError('Промокод истёк');
        }

        if (subtotal < minOrderTotal) {
          throw new ValidationError(`Минимальная сумма для промокода — ${minOrderTotal}`);
        }

        const value = Number(promo.value);
        discountAmount = promo.type === 'PERCENT'
          ? Math.min(subtotal, Math.round((subtotal * value / 100) * 100) / 100)
          : Math.min(subtotal, value);
        total = Math.max(0, subtotal - discountAmount);
        promoCodeId = promo.id;
        promoCode = promo.code;
        promoUsageLimit = promo.usageLimit;
      }

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

      const inputFingerprint = input.idempotencyKey ? this.computeFingerprint(input, cart.items) : null;

      const order = await tx.order.create({
          data: {
            userId,
            idempotencyKey: input.idempotencyKey || null,
            inputFingerprint,
            subtotal,
            discountAmount,
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
            promoCode: promoCodeId && promoCode ? {
              create: {
                promoCodeId,
                code: promoCode,
                discountAmount,
              },
            } : undefined,
          },
        });

        if (promoCodeId) {
          const updatedPromoCode = await tx.promoCode.updateMany({
            where: {
              id: promoCodeId,
              ...(promoUsageLimit === null ? {} : { usedCount: { lt: promoUsageLimit } }),
            },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });

          if (updatedPromoCode.count !== 1) {
            throw new ValidationError('Лимит использования промокода исчерпан');
          }
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order.id;
      });
    } catch (error: unknown) {
      if (this.isIdempotencyConflict(error)) {
        const winnerOrder = await this.prismaClient.order.findFirst({
          where: {
            userId,
            idempotencyKey: input.idempotencyKey,
          },
          include: {
            promoCode: true,
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

        if (winnerOrder) {
          if (!this.matchesFingerprint(input, null, winnerOrder)) {
            throw new AppError(
              'Идемпотентный ключ уже использован с другими данными заказа',
              409,
              'IDEMPOTENCY_KEY_CONFLICT'
            );
          }
          return this.formatOrderDetail(winnerOrder);
        }
      }
      throw error;
    }

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
        promoCode: true,
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
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      promoCode: order.promoCode?.code ?? null,
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

    return this.formatOrderDetail(order);
  }

  async cancelByUser(userId: string, orderId: string): Promise<OrderDetail> {
    return this.cancelOrder(orderId, { userId });
  }

  async cancelOrder(orderId: string, options: { userId?: string }): Promise<OrderDetail> {
    await this.prismaClient.$transaction(async (tx) => {
      await this.executeCancellation(orderId, options.userId, tx);
    });

    const order = options.userId
      ? await this.findByIdForUser(options.userId, orderId)
      : await this.findOrderByIdForAdmin(orderId).then(o => o ? this.formatOrderDetail(o) : null);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  private async executeCancellation(
    orderId: string,
    userId: string | undefined,
    tx: Parameters<Parameters<typeof this.prismaClient.$transaction>[0]>[0]
  ): Promise<void> {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        ...(userId ? { userId } : {}),
      },
      include: {
        promoCode: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new ValidationError('Заказ уже отменен');
    }

    if (userId) {
      if (order.status !== ORDER_STATUS.NEW) {
        throw new ValidationError('Отменить можно только новый заказ');
      }
    } else {
      if (!ORDER_STATUS_TRANSITIONS[order.status].includes(ORDER_STATUS.CANCELLED)) {
        throw new ValidationError('Недопустимый переход статуса заказа');
      }
    }

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        ...(userId ? { userId } : {}),
        status: order.status,
      },
      data: { status: ORDER_STATUS.CANCELLED },
    });

    if (updated.count !== 1) {
      throw new ValidationError('Статус заказа изменился, обновите страницу');
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    if (order.promoCode) {
      await tx.promoCode.updateMany({
        where: {
          id: order.promoCode.promoCodeId,
          usedCount: { gt: 0 },
        },
        data: {
          usedCount: {
            decrement: 1,
          },
        },
      });
    }
  }

  async updateStatusByAdmin(orderId: string, status: OrderStatus): Promise<{ order: OrderDetail; previousStatus: OrderStatus }> {
    if (status === ORDER_STATUS.CANCELLED) {
      const orderBefore = await this.findOrderByIdForAdmin(orderId);
      if (!orderBefore) {
        throw new NotFoundError('Order not found');
      }
      const previousStatus = orderBefore.status;
      const order = await this.cancelOrder(orderId, {});
      return { order, previousStatus };
    }

    const result = await this.prismaClient.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          promoCode: true,
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.status === status) {
        const currentOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            promoCode: true,
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
        if (!currentOrder) {
          throw new NotFoundError('Order not found');
        }
        return {
          order: currentOrder,
          previousStatus: order.status,
        };
      }

      if (!ORDER_STATUS_TRANSITIONS[order.status].includes(status)) {
        throw new ValidationError('Недопустимый переход статуса заказа');
      }

      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
        },
        data: { status },
      });

      if (updated.count !== 1) {
        throw new ValidationError('Статус заказа изменился, обновите страницу');
      }

      const updatedOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          promoCode: true,
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

      if (!updatedOrder) {
        throw new NotFoundError('Order not found');
      }

      return {
        order: updatedOrder,
        previousStatus: order.status,
      };
    });

    return {
      order: this.formatOrderDetail(result.order),
      previousStatus: result.previousStatus,
    };
  }

  async repeatForUser(userId: string, orderId: string): Promise<Cart> {
    const cartId = await this.prismaClient.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      const cart = await tx.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      for (const item of order.items) {
        if (item.product.deletedAt || item.product.stock < item.quantity) {
          throw new AppError(`Недостаточно товара "${item.product.name}" на складе`, 400, 'INSUFFICIENT_STOCK');
        }

        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }

      return cart.id;
    });

    const cart = await this.findCartById(cartId);
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    return cart;
  }

  private formatOrderDetail(order: Awaited<ReturnType<typeof this.findOrderById>> & {}) {
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
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      promoCode: order.promoCode?.code ?? null,
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

  private async findCartById(cartId: string): Promise<Cart | null> {
    const cart = await this.prismaClient.cart.findUnique({
      where: { id: cartId },
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

    const items: CartItem[] = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      imageUrl: item.product.images[0] || null,
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }

  private async findOrderById(userId: string, orderId: string) {
    return this.prismaClient.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        promoCode: true,
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

  private async findOrderByIdForAdmin(orderId: string) {
    return this.prismaClient.order.findUnique({
      where: { id: orderId },
      include: {
        promoCode: true,
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

  private isIdempotencyConflict(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }
    if (error.code !== 'P2002') {
      return false;
    }
    if (!error.meta || typeof error.meta !== 'object' || !('target' in error.meta)) {
      return false;
    }
    if (!Array.isArray(error.meta.target)) {
      return false;
    }
    return error.meta.target.some((field) =>
      typeof field === 'string' && field.includes('idempotencyKey')
    );
  }

  private computeFingerprint(
    input: CreateOrderInput,
    cartItems: Array<{ productId: string; quantity: number; product: { price: Prisma.Decimal } }>
  ): string {
    const cartSnapshot = cartItems
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId));

    const payload = JSON.stringify({
      recipientName: input.recipientName?.trim(),
      address: input.address?.trim(),
      phone: input.phone?.trim(),
      comment: input.comment?.trim() || null,
      promoCode: input.promoCode?.trim() || null,
      cart: cartSnapshot,
    });
    return createHash('sha256').update(payload).digest('hex');
  }

  private matchesFingerprint(
    input: CreateOrderInput,
    cart: { items: Array<{ productId: string; quantity: number; product: { price: Prisma.Decimal } }> } | null,
    existingOrder: {
      inputFingerprint: string | null;
      recipientName: string;
      address: string;
      phone: string;
      comment: string | null;
      promoCode: { code: string } | null;
      items: Array<{ productId: string; quantity: number; price: Prisma.Decimal }>;
    }
  ): boolean {
    if (cart) {
      const requestFingerprint = this.computeFingerprint(input, cart.items);
      return existingOrder.inputFingerprint === requestFingerprint;
    }

    const orderItemsSnapshot = existingOrder.items
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId));

    const requestPayload = JSON.stringify({
      recipientName: input.recipientName?.trim(),
      address: input.address?.trim(),
      phone: input.phone?.trim(),
      comment: input.comment?.trim() || null,
      promoCode: input.promoCode?.trim() || null,
      cart: orderItemsSnapshot,
    });
    const requestFingerprint = createHash('sha256').update(requestPayload).digest('hex');

    return existingOrder.inputFingerprint === requestFingerprint;
  }

  private async findByIdempotencyKey(userId: string, idempotencyKey: string) {
    return this.prismaClient.order.findFirst({
      where: { userId, idempotencyKey },
      include: {
        promoCode: true,
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
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
