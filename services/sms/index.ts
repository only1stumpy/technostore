import { randomInt } from 'crypto';
import type { SmsProvider, SmsVerificationCode } from '@/types/sms';
import { MockSmsProvider } from './providers/mock';
import { MessaggioSmsProvider } from './providers/messaggio';
import { BudgetSmsSmsProvider } from './providers/budgetsms';

export class SmsService {
  private provider: SmsProvider;

  constructor(provider?: SmsProvider) {
    this.provider = provider || this.initializeProvider();
  }

  private initializeProvider(): SmsProvider {
    const providerType = process.env.SMS_PROVIDER;

    if (!providerType) {
      throw new Error(
        'SMS_PROVIDER environment variable is required. Set to "mock" for demo mode, or configure a real provider (messaggio, budgetsms).'
      );
    }

    const apiKey = process.env.SMS_API_KEY || '';
    const apiUrl = process.env.SMS_API_URL || '';

    switch (providerType) {
      case 'messaggio':
        if (!apiKey || !apiUrl) {
          throw new Error(
            'SMS_PROVIDER=messaggio requires SMS_API_KEY and SMS_API_URL environment variables'
          );
        }
        return new MessaggioSmsProvider(apiKey, apiUrl);

      case 'budgetsms':
        if (!apiKey || !apiUrl) {
          throw new Error(
            'SMS_PROVIDER=budgetsms requires SMS_API_KEY and SMS_API_URL environment variables'
          );
        }
        return new BudgetSmsSmsProvider(apiKey, apiUrl);

      case 'mock':
        return new MockSmsProvider();

      default:
        throw new Error(
          `Unknown SMS_PROVIDER="${providerType}". Supported: mock, messaggio, budgetsms`
        );
    }
  }

  isDemo(): boolean {
    return this.provider instanceof MockSmsProvider;
  }

  generateVerificationCode(): SmsVerificationCode {
    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    return { code, expiresAt };
  }

  async sendVerificationCode(phone: string, code: string): Promise<{ success: boolean; error?: string; code?: string }> {
    const message = `Ваш код подтверждения TechnoStore: ${code}. Действителен 10 минут.`;

    const result = await this.provider.sendSms(phone, message);

    if (!result.success) {
      console.error('Failed to send SMS:', result.error || 'Unknown error');
    }

    return {
      success: result.success,
      error: result.error,
      ...(this.isDemo() && { code }),
    };
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.provider.sendSms(phone, message);

    if (!result.success) {
      console.error('Failed to send SMS:', result.error || 'Unknown error');
    }

    return {
      success: result.success,
      error: result.error,
    };
  }
}

export const smsService = new SmsService();
