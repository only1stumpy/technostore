import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Доставка и оплата',
  description: 'Условия доставки заказов TechnoStore по Приднестровью и оплата наличными при получении.',
};

const steps = [
  {
    title: 'Оформите заказ',
    description: 'Добавьте товары в корзину и проверьте состав заказа перед оформлением.',
  },
  {
    title: 'Мы согласуем доставку',
    description: 'Свяжемся с вами, подтвердим наличие и удобное время получения.',
  },
  {
    title: 'Оплатите при получении',
    description: 'Передайте оплату наличными курьеру после проверки товара.',
  },
];

export default function DeliveryPage() {
  return (
    <Container className="py-10">
      <section className="mb-10 rounded-lg bg-muted p-8 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Доставка и оплата</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">Доставка по Приднестровью</h1>
        <p className="mt-6 max-w-3xl text-muted-foreground">
          Доставляем заказы в течение 1-2 дней. Оплата принимается наличными при получении, чтобы вы могли проверить товар перед покупкой.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">
                {index + 1}
              </div>
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="mt-3 text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Готовы выбрать технику?</h2>
            <p className="mt-2 text-muted-foreground">Откройте каталог и добавьте нужные товары в корзину.</p>
          </div>
          <Link href="/catalog">
            <Button>Перейти в каталог</Button>
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
