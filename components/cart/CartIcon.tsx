'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export function CartIcon() {
  const itemsCount = useCartStore((state) => state.itemsCount);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    fetchCart({ silentAuth: true });
  }, [fetchCart]);

  return (
    <Link
      href="/cart"
      className="relative p-2 text-foreground hover:text-primary transition-colors"
      aria-label={`Корзина, товаров: ${itemsCount}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {itemsCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
          {itemsCount}
        </span>
      )}
    </Link>
  );
}
