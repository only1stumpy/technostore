export interface JWTPayload {
  userId: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  specs: Record<string, unknown> | null;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    parent: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryTree = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  children?: CategoryTree[];
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type CursorPaginatedResponse<T> = {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};

export type ApiError = {
  error: string;
  details?: Record<string, string[]>;
};

export type ProductFilters = {
  cursor?: string;
  limit: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy: 'price' | 'createdAt' | 'name';
  sortOrder: 'asc' | 'desc';
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
};
