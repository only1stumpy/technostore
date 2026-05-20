import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const values = [
  'Подбираем актуальную электронику для повседневных задач',
  'Работаем с проверенными брендами и понятными условиями покупки',
  'Доставляем заказы по Приднестровью и принимаем оплату при получении',
];

export default function AboutPage() {
  return (
    <Container className="py-10">
      <section className="mb-10 rounded-lg bg-[#1a1a1a] px-6 py-12 text-white sm:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">О нас</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">TechnoStore — магазин электроники</h1>
        <p className="mt-6 max-w-3xl text-lg text-gray-300">
          Мы помогаем выбрать смартфоны, ноутбуки и аксессуары для дома, работы и учёбы. В каталоге собраны понятные разделы, актуальные товары и удобные условия покупки.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold">Что важно для нас</h2>
            <div className="mt-6 grid gap-4">
              {values.map((value) => (
                <div key={value} className="rounded-lg border border-border p-4">
                  <p className="text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Нужна техника?</h2>
            <p className="text-muted-foreground">Переходите в каталог или свяжитесь с нами, если нужна помощь с выбором.</p>
            <Link href="/catalog" className="block">
              <Button className="w-full">Открыть каталог</Button>
            </Link>
            <Link href="/contacts" className="block">
              <Button variant="secondary" className="w-full">Контакты</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
