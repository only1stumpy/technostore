import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <Container className="py-16">
      <Card>
        <CardContent className="flex min-h-96 flex-col items-center justify-center gap-6 text-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">404</p>
            <h1 className="mt-3 text-4xl font-black">Страница не найдена</h1>
            <p className="mt-2 text-muted-foreground">Проверьте адрес или вернитесь в каталог TechnoStore</p>
          </div>
          <Link href="/catalog">
            <Button>Перейти в каталог</Button>
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
