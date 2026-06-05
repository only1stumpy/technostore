import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeCallbackUrl(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(value, 'http://localhost');
    if (url.origin !== 'http://localhost') {
      return fallback;
    }
    return value;
  } catch {
    return fallback;
  }
}

export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numPrice)} руб.`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('373')) {
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{3})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  }

  return phone;
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^373\d{8}$/.test(cleaned);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('373')) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith('0')) {
    return `+373${cleaned.slice(1)}`;
  }

  return `+373${cleaned}`;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => CYRILLIC_TO_LATIN[char] ?? '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
