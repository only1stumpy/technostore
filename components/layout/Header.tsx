import Link from 'next/link';
import { Container } from './Container';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-12">
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

          <div className="flex items-center gap-6">
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-primary transition-colors"
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
            </Link>

            <Link
              href="/login"
              className="text-sm font-bold uppercase tracking-tight text-white bg-primary hover:bg-primary-hover rounded-lg px-6 py-2 transition-colors"
              style={{ fontFamily: 'var(--font-oswald)' }}
            >
              Войти
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
