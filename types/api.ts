export interface JWTPayload {
  userId: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  [key: string]: unknown;
}

export type CurrentUser = {
  id: string;
  phone: string;
  name: string | null;
  address: string | null;
  role: 'USER' | 'ADMIN';
};

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

export type PriceRange = {
  min: number | null;
  max: number | null;
};

export type ProductFilterMetadata = {
  brands: Brand[];
  priceRange: PriceRange;
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
  sortBy: 'price' | 'createdAt' | 'name' | 'popular';
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

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
};

export type OrderItemPreview = {
  name: string;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  total: number;
  recipientName: string;
  address: string;
  phone: string;
  comment: string | null;
  itemsCount: number;
  itemsPreview: OrderItemPreview[];
  createdAt: string;
  updatedAt: string;
};

export type OrderDetail = OrderSummary & {
  items: OrderItem[];
};

export type CreateOrderInput = {
  recipientName: string;
  address: string;
  phone: string;
  comment?: string | null;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  specs: Record<string, unknown> | null;
  categoryId: string;
  brandId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
};

export type AdminOrder = OrderSummary & {
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
};

export type AdminOrderDetail = OrderDetail & {
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
};

export type AdminUser = {
  id: string;
  phone: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  ordersCount: number;
  createdAt: string;
};

export type AdminStats = {
  productsCount: number;
  ordersCount: number;
  usersCount: number;
  revenue: number;
  recentOrders: AdminOrder[];
};
