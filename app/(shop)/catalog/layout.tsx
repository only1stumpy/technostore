import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Каталог техники',
  description: 'Каталог смартфонов, ноутбуков, аксессуаров и техники для дома в TechnoStore.',
  openGraph: {
    title: 'Каталог техники TechnoStore',
    description: 'Смартфоны, ноутбуки, аксессуары и техника для дома в каталоге TechnoStore.',
  },
};

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return children;
}
