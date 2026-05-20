import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const contacts = [
  { label: 'Адрес', value: 'Тирасполь, ул. 25 Октября, 100' },
  { label: 'Телефон', value: '+373 533 12345' },
  { label: 'Email', value: 'info@technostore.md' },
  { label: 'График', value: 'Пн-Сб: 09:00-19:00' },
];

export default function ContactsPage() {
  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black">Контакты</h1>
        <p className="mt-2 text-muted-foreground">Свяжитесь с нами удобным способом или приходите в магазин.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            {contacts.map((contact) => (
              <div key={contact.label} className="rounded-lg border border-border p-5">
                <p className="text-sm text-muted-foreground">{contact.label}</p>
                <p className="mt-2 text-xl font-bold">{contact.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Помощь с заказом</h2>
            <p className="text-muted-foreground">Подскажем по наличию, характеристикам, доставке и оплате.</p>
            <Link href="/catalog" className="block">
              <Button className="w-full">Выбрать товары</Button>
            </Link>
            <Link href="/delivery" className="block">
              <Button variant="secondary" className="w-full">Доставка и оплата</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
