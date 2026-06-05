import { describe, expect, test } from 'bun:test';
import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } from './constants';

describe('order status transitions', () => {
  test('allows valid forward transitions and cancellation', () => {
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.NEW]).toContain(ORDER_STATUS.CONFIRMED);
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.NEW]).toContain(ORDER_STATUS.CANCELLED);
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.PROCESSING]).toContain(ORDER_STATUS.SHIPPED);
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.SHIPPED]).toContain(ORDER_STATUS.DELIVERED);
  });

  test('prevents transitions from terminal statuses', () => {
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.DELIVERED]).toEqual([]);
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.CANCELLED]).toEqual([]);
  });

  test('prevents moving an order backwards', () => {
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.PROCESSING]).not.toContain(ORDER_STATUS.NEW);
    expect(ORDER_STATUS_TRANSITIONS[ORDER_STATUS.SHIPPED]).not.toContain(ORDER_STATUS.CONFIRMED);
  });
});
