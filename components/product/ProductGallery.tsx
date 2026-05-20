'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const availableImages = images.filter((image) => !image.replace(/^\//, '').startsWith('products/'));
  const [selectedImage, setSelectedImage] = useState(0);

  if (availableImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-[#f5f5f5] flex items-center justify-center">
        <span className="text-[#666666]">Нет изображений</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative w-full aspect-square bg-white border-2 border-[#e5e5e5] overflow-hidden">
        <Image
          src={availableImages[selectedImage]}
          alt={`${productName} - изображение ${selectedImage + 1}`}
          fill
          className="object-contain p-4"
          priority={selectedImage === 0}
        />
      </div>

      {/* Thumbnails */}
      {availableImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {availableImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square border-2 transition-all ${
                selectedImage === index
                  ? 'border-[#ff0000]'
                  : 'border-[#e5e5e5] hover:border-[#666666]'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - превью ${index + 1}`}
                fill
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
