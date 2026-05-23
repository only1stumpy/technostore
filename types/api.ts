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

export type ProductReviewSummary = {
  ratingAverage: number | null;
  reviewsCount: number;
};

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  ratingAverage?: number | null;
  reviewsCount?: number;
  isFavorite?: boolean;
  isCompared?: boolean;
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
  ratingAverage: number | null;
  reviewsCount: number;
  relatedProducts?: ProductCard[];
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

export type SpecFacet = {
  key: string;
  label: string;
  values: Array<{ value: string; count: number }>;
};

export type ProductFilterMetadata = {
  brands: Brand[];
  priceRange: PriceRange;
  specs: SpecFacet[];
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
  specs?: Record<string, string[]>;
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
  discountAmount?: number;
  finalAmount?: number;
  promoCode?: string | null;
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
  subtotal?: number;
  discountAmount?: number;
  total: number;
  promoCode?: string | null;
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
  promoCode?: string | null;
};

export type FavoriteItem = ProductCard & {
  addedAt: string;
};

export type FavoritesResponse = {
  items: FavoriteItem[];
  count: number;
};

export type ComparisonItem = ProductCard & {
  specs: Record<string, unknown> | null;
  addedAt: string;
};

export type ComparisonResponse = {
  items: ComparisonItem[];
  count: number;
};

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ProductReview = {
  id: string;
  rating: number;
  text: string;
  status?: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
  };
};

export type CreateReviewInput = {
  productId: string;
  rating: number;
  text: string;
};

export type PromoCodeType = 'PERCENT' | 'FIXED';

export type ApplyPromoCodeInput = {
  code: string;
};

export type AppliedPromoCode = {
  code: string;
  type: PromoCodeType;
  value: number;
  discountAmount: number;
  subtotal: number;
  total: number;
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

export type AdminReview = ProductReview & {
  product: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
};

export type AdminPromoCode = {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  minOrderTotal: number;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminStockProduct = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  imageUrl: string | null;
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
  updatedAt: string;
};

export type AdminActionLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: {
    id: string;
    name: string | null;
    phone: string;
  };
};

export type AdminStats = {
  productsCount: number;
  ordersCount: number;
  usersCount: number;
  revenue: number;
  recentOrders: AdminOrder[];
};
