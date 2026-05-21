'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { Container } from './Container';
import { HeaderActions } from './HeaderActions';
import { formatPrice } from '@/lib/utils';
import type { CursorPaginatedResponse, ProductCard } from '@/types/api';

function HeaderSearch() {
  const router = useRouter();
  const listboxId = useId();
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedQuery = query.trim();
  const showDropdown = isOpen && trimmedQuery.length >= 2;

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      queueMicrotask(() => {
        setSuggestions([]);
        setIsSearching(false);
        setActiveIndex(-1);
      });
      return;
    }

    const abortController = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          search: trimmedQuery,
          limit: '5',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        const response = await fetch(`/api/products?${params}`, { signal: abortController.signal });

        if (!response.ok) {
          throw new Error('Не удалось загрузить подсказки');
        }

        const data: CursorPaginatedResponse<ProductCard> = await response.json();
        setSuggestions(data.data ?? []);
        setActiveIndex(-1);
        setIsOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSuggestions([]);
          setActiveIndex(-1);
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      abortController.abort();
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToCatalog = () => {
    if (!trimmedQuery) return;

    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/catalog?search=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToCatalog();
  };

  const handleSuggestionClick = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const activeProduct = suggestions[activeIndex];
      setIsOpen(false);
      setActiveIndex(-1);
      setQuery('');
      router.push(`/product/${activeProduct.id}`);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full lg:max-w-md xl:max-w-xl">
      <form onSubmit={handleSubmit} className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => trimmedQuery.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Найти смартфон, ноутбук, аксессуар"
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
          aria-label="Поиск товаров"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${suggestions[activeIndex].id}` : undefined}
          role="combobox"
        />
        <button
          type="submit"
          className="bg-primary px-4 text-sm font-bold uppercase tracking-tight text-white hover:bg-primary-hover transition-colors"
          style={{ fontFamily: 'var(--font-oswald)' }}
        >
          Найти
        </button>
      </form>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-xl"
        >
          {isSearching ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">Ищем товары...</div>
          ) : suggestions.length > 0 ? (
            <div className="divide-y divide-border">
              {suggestions.map((product, index) => {
                const imageUrl = product.imageUrl?.replace(/^\//, '').startsWith('products/') ? null : product.imageUrl;

                return (
                  <Link
                    key={product.id}
                    id={`${listboxId}-${product.id}`}
                    href={`/product/${product.id}`}
                    onClick={handleSuggestionClick}
                    role="option"
                    aria-selected={activeIndex === index}
                    className={`flex gap-3 px-4 py-3 transition-colors ${activeIndex === index ? 'bg-secondary' : 'hover:bg-secondary'}`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {imageUrl && (
                        <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="56px" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-foreground">{product.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{product.brand.name}</div>
                      <div className="mt-1 text-sm font-bold text-primary">{formatPrice(product.price)}</div>
                    </div>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={navigateToCatalog}
                className="w-full px-4 py-3 text-left text-sm font-bold uppercase tracking-tight text-primary hover:bg-secondary"
                style={{ fontFamily: 'var(--font-oswald)' }}
              >
                Смотреть все результаты
              </button>
            </div>
          ) : (
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm text-muted-foreground">Ничего не найдено</p>
              <button
                type="button"
                onClick={navigateToCatalog}
                className="text-sm font-bold uppercase tracking-tight text-primary hover:text-primary-hover"
                style={{ fontFamily: 'var(--font-oswald)' }}
              >
                Искать в каталоге
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <Container>
        <div className="flex min-h-16 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-6 lg:justify-start lg:gap-12">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-primary uppercase tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
                TechnoStore
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/catalog"
                className="text-base font-bold uppercase tracking-tight text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-oswald)' }}
              >
                Каталог
              </Link>
              <Link
                href="/about"
                className="text-base font-bold uppercase tracking-tight text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-oswald)' }}
              >
                О нас
              </Link>
              <Link
                href="/contacts"
                className="text-base font-bold uppercase tracking-tight text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-oswald)' }}
              >
                Контакты
              </Link>
            </nav>
          </div>

          <HeaderSearch />

          <HeaderActions />
        </div>
      </Container>
    </header>
  );
}
