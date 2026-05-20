'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { CartItem as CartItemType } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
  isLoading: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemoveItem,
  isLoading,
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    await onUpdateQuantity(item.productId, newQuantity);
    setQuantity(newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await onRemoveItem(item.productId);
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center border-b border-[#e5e5e5] py-4 last:border-b-0">
      <Link href={`/product/${item.slug}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 bg-white border border-[#e5e5e5] overflow-hidden">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-contain p-2"
            />
          )}
        </div>
      </Link>

      <div className="ml-4 flex-1">
        <h3 className="text-lg font-medium text-[#1a1a1a]">
          <Link href={`/product/${item.slug}`}>{item.name}</Link>
        </h3>
        <p className="text-sm text-[#666666]">
          Цена: {item.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
        </p>
        <p className="text-sm text-[#666666]">
          Всего: {(item.price * item.quantity).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isLoading || isUpdating || quantity <= 1}
        >
          -
        </Button>
        <span className="w-8 text-center text-[#1a1a1a]">{quantity}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isLoading || isUpdating}
        >
          +
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={isLoading || isUpdating}
        >
          {isUpdating ? <Spinner size="sm" /> : 'Удалить'}
        </Button>
      </div>
    </div>
  );
}
