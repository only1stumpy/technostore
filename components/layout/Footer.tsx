import Link from 'next/link';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <Container>
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-6 uppercase tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
              TechnoStore
            </h3>
            <p className="text-base text-muted-foreground font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
              Интернет-магазин электроники с доставкой по Приднестровью
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 uppercase tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
              Каталог
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/catalog" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  Все товары
                </Link>
              </li>
              <li>
                <Link href="/category/laptops" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  Ноутбуки
                </Link>
              </li>
              <li>
                <Link href="/category/smartphones" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  Смартфоны
                </Link>
              </li>
              <li>
                <Link href="/category/accessories" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  Аксессуары
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 uppercase tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
              Информация
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-muted-foreground hover:text-primary transition-colors font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 uppercase tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
              Контакты
            </h4>
            <ul className="space-y-3 text-base text-muted-foreground font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
              <li>Тирасполь, ул. 25 Октября, 100</li>
              <li className="text-primary font-bold">+373 533 12345</li>
              <li>info@technostore.md</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-8 text-center">
          <p className="text-base text-muted-foreground font-light" style={{ fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
            &copy; {new Date().getFullYear()} TechnoStore. Все права защищены.
          </p>
        </div>
      </Container>
    </footer>
  );
}
