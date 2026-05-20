import Link from 'next/link';
import { HeaderActions } from './HeaderActions';
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

          <HeaderActions />
        </div>
      </Container>
    </header>
  );
}
