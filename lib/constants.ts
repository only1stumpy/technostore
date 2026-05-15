export const ORDER_STATUS = {
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтвержден',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменен',
};

export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const ITEMS_PER_PAGE = 20;

export const CACHE_TTL = {
  PRODUCTS: 300, // 5 minutes
  CATEGORIES: 1800, // 30 minutes
  BRANDS: 1800, // 30 minutes
  SMS_CODE: 600, // 10 minutes
} as const;

export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
