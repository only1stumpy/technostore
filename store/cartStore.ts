'use client';

import { create } from 'zustand';
import type { Cart } from '@/types/api';

type CartState = Cart & {
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  itemsCount: number;
  fetchCart: (options?: { silentAuth?: boolean }) => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateItem: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  setCart: (cart: Cart) => void;
};

const initialCart: Cart = {
  id: '',
  userId: '',
  items: [],
  totalAmount: 0,
};

async function parseCartResponse(response: Response): Promise<Cart> {
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Ошибка корзины');
  }

  return json.data ?? initialCart;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function applyCart(cart: Cart) {
  return {
    ...cart,
    itemsCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    isLoading: false,
    hasFetched: true,
    error: null,
  };
}

export const useCartStore = create<CartState>((set) => ({
  ...initialCart,
  itemsCount: 0,
  isLoading: false,
  hasFetched: false,
  error: null,

  setCart: (cart) => set(applyCart(cart)),

  fetchCart: async (options) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/cart');
      const cart = await parseCartResponse(response);
      set(applyCart(cart));
    } catch (error) {
      const message = getErrorMessage(error, 'Ошибка загрузки корзины');
      const isUnauthorized = message === 'User not authenticated' || message === 'Не авторизован';
      set({
        ...initialCart,
        itemsCount: 0,
        isLoading: false,
        hasFetched: true,
        error: options?.silentAuth && isUnauthorized ? null : message,
      });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const cart = await parseCartResponse(response);
      set(applyCart(cart));
      return true;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Ошибка добавления товара') });
      return false;
    }
  },

  updateItem: async (productId, quantity) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const cart = await parseCartResponse(response);
      set(applyCart(cart));
      return true;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Ошибка изменения количества') });
      return false;
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'DELETE',
      });
      const cart = await parseCartResponse(response);
      set(applyCart(cart));
      return true;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Ошибка удаления товара') });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        await parseCartResponse(response);
      }

      set({ ...initialCart, itemsCount: 0, isLoading: false, hasFetched: true, error: null });
      return true;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Ошибка очистки корзины') });
      return false;
    }
  },
}));
