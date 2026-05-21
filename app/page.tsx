import type { Metadata } from 'next';
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Интернет-магазин электроники',
  description: 'Смартфоны, ноутбуки, планшеты и аксессуары с доставкой по Приднестровью.',
};

const popularCategories = [
  {
    title: 'Ноутбуки',
    href: '/category/laptops',
  },
  {
    title: 'Смартфоны',
    href: '/category/smartphones',
  },
  {
    title: 'Планшеты',
    href: '/category/tablets',
  },
  {
    title: 'Аксессуары',
    href: '/category/accessories',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-20 bg-secondary">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-6xl font-black text-foreground mb-6">
              Добро пожаловать в TechnoStore
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Интернет-магазин электроники с доставкой по Приднестровью
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Link href="/catalog" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Перейти в каталог
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  О нас
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <h2 className="text-4xl font-black text-center mb-12">Популярные категории</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <span className="text-2xl font-bold text-primary">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-muted">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Почему выбирают нас?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Качественные товары</h3>
                <p className="text-sm text-muted-foreground">Только оригинальная продукция от проверенных брендов</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Быстрая доставка</h3>
                <p className="text-sm text-muted-foreground">Доставка по Приднестровью в течение 1-2 дней</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Оплата при получении</h3>
                <p className="text-sm text-muted-foreground">Удобная оплата наличными курьеру</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
