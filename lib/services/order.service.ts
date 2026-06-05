import type { Cart, CreateOrderInput, OrderDetail, OrderSummary } from '@/types/api';
import { orderRepository } from '@/lib/repositories/order.repository';
import type { IOrderRepository } from '@/lib/repositories/interfaces';
import type { IOrderService } from './interfaces';
import type { OrderStatus } from '@/lib/constants';

export class OrderService implements IOrderService {
  constructor(private orderRepo: IOrderRepository = orderRepository) {}

  async createOrder(userId: string, input: CreateOrderInput): Promise<OrderDetail> {
    return this.orderRepo.createFromCart(userId, input);
  }

  async getOrders(userId: string): Promise<OrderSummary[]> {
    return this.orderRepo.findManyByUserId(userId);
  }

  async getOrder(userId: string, orderId: string): Promise<OrderDetail | null> {
    return this.orderRepo.findByIdForUser(userId, orderId);
  }

  async cancelOrder(userId: string, orderId: string): Promise<OrderDetail> {
    return this.orderRepo.cancelByUser(userId, orderId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ order: OrderDetail; previousStatus: OrderStatus }> {
    return this.orderRepo.updateStatusByAdmin(orderId, status);
  }

  async repeatOrder(userId: string, orderId: string): Promise<Cart> {
    return this.orderRepo.repeatForUser(userId, orderId);
  }
}

export const orderService = new OrderService();

export function createOrderService(orderRepo: IOrderRepository = orderRepository): IOrderService {
  return new OrderService(orderRepo);
}
