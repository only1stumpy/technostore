'use client';

import { create } from 'zustand';
import type { Cart } from '@/types/api';

type CartRequestError = Error & {
  code?: string;
};

type CartState = Cart & {
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  errorCode: string | null;
  itemsCount: number;
  fetchCart: (options?: { silentAuth?: boolean }) => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateItem: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  setCart: (cart: Cart) => void;
  resetCart: () => void;
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
    const error = new Error(json.error || 'Ошибка корзины') as CartRequestError;
    error.code = json.code;
    throw error;
  }

  return json.data ?? initialCart;
}

function getCartError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as CartRequestError).code ?? null,
    };
  }

  return {
    message: fallback,
    code: null,
  };
}

function applyCart(cart: Cart) {
  return {
    ...cart,
    itemsCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    isLoading: false,
    hasFetched: true,
    error: null,
    errorCode: null,
  };
}

export const useCartStore = create<CartState>((set) => ({
  ...initialCart,
  itemsCount: 0,
  isLoading: false,
  hasFetched: false,
  error: null,
  errorCode: null,

  setCart: (cart) => set(applyCart(cart)),
  resetCart: () => set({ ...initialCart, itemsCount: 0, isLoading: false, hasFetched: false, error: null, errorCode: null }),

  fetchCart: async (options) => {
    set({ isLoading: true, error: null, errorCode: null });

    try {
      const response = await fetch('/api/cart');
      const cart = await parseCartResponse(response);
      set(applyCart(cart));
    } catch (error) {
      const cartError = getCartError(error, 'Ошибка загрузки корзины');
      const isUnauthorized = cartError.code === 'UNAUTHORIZED';
      set({
        ...initialCart,
        itemsCount: 0,
        isLoading: false,
        hasFetched: true,
        error: options?.silentAuth && isUnauthorized ? null : cartError.message,
        errorCode: options?.silentAuth && isUnauthorized ? null : cartError.code,
      });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null, errorCode: null });

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
      const cartError = getCartError(error, 'Ошибка добавления товара');
      set({ isLoading: false, error: cartError.message, errorCode: cartError.code });
      return false;
    }
  },

  updateItem: async (productId, quantity) => {
    set({ isLoading: true, error: null, errorCode: null });

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
      const cartError = getCartError(error, 'Ошибка изменения количества');
      set({ isLoading: false, error: cartError.message, errorCode: cartError.code });
      return false;
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true, error: null, errorCode: null });

    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'DELETE',
      });
      const cart = await parseCartResponse(response);
      set(applyCart(cart));
      return true;
    } catch (error) {
      const cartError = getCartError(error, 'Ошибка удаления товара');
      set({ isLoading: false, error: cartError.message, errorCode: cartError.code });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null, errorCode: null });

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        await parseCartResponse(response);
      }

      set({ ...initialCart, itemsCount: 0, isLoading: false, hasFetched: true, error: null, errorCode: null });
      return true;
    } catch (error) {
      const cartError = getCartError(error, 'Ошибка очистки корзины');
      set({ isLoading: false, error: cartError.message, errorCode: cartError.code });
      return false;
    }
  },
}));
