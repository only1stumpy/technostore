import type { CreateOrderInput, OrderDetail, OrderSummary } from '@/types/api';
import { orderRepository } from '@/lib/repositories/order.repository';
import type { IOrderRepository } from '@/lib/repositories/interfaces';
import type { IOrderService } from './interfaces';

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
}

export const orderService = new OrderService();

export function createOrderService(orderRepo: IOrderRepository = orderRepository): IOrderService {
  return new OrderService(orderRepo);
}
