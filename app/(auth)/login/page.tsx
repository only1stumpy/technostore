'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { getSafeCallbackUrl } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка отправки кода');
      }

      if (data.code) {
        setDemoCode(data.code);
        toast.info(`Демонстрационный код: ${data.code}`);
      }

      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Неверный код');
      }

      const callbackUrl = getSafeCallbackUrl(new URLSearchParams(window.location.search).get('callbackUrl'));
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-lg border border-border p-8">
          <h1 className="text-3xl font-bold text-center mb-6 uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            Вход
          </h1>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Номер телефона
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+373 XXX XXXXX"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={loading}>
                Получить код
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {demoCode && (
                <div className="text-sm text-primary bg-primary/10 p-3 rounded-lg border border-primary/20">
                  <strong>Демонстрационный режим:</strong> реальное SMS не отправляется.
                  <br />
                  Используйте код: <strong className="text-lg tracking-wider">{demoCode}</strong>
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">
                  Код из SMS
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={loading}>
                Войти
              </Button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Изменить номер
              </button>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
