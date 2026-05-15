import type { SmsProvider, SmsVerificationCode } from '@/types/sms';
import { MockSmsProvider } from './providers/mock';
import { MessaggioSmsProvider } from './providers/messaggio';
import { BudgetSmsSmsProvider } from './providers/budgetsms';

class SmsService {
  private provider: SmsProvider;

  constructor() {
    this.provider = this.initializeProvider();
  }

  private initializeProvider(): SmsProvider {
    const providerType = process.env.SMS_PROVIDER || 'mock';
    const apiKey = process.env.SMS_API_KEY || '';
    const apiUrl = process.env.SMS_API_URL || '';

    switch (providerType) {
      case 'messaggio':
        if (!apiKey || !apiUrl) {
          console.warn('⚠️  Messaggio credentials missing, falling back to mock');
          return new MockSmsProvider();
        }
        return new MessaggioSmsProvider(apiKey, apiUrl);

      case 'budgetsms':
        if (!apiKey || !apiUrl) {
          console.warn('⚠️  BudgetSMS credentials missing, falling back to mock');
          return new MockSmsProvider();
        }
        return new BudgetSmsSmsProvider(apiKey, apiUrl);

      case 'mock':
      default:
        return new MockSmsProvider();
    }
  }

  generateVerificationCode(): SmsVerificationCode {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return { code, expiresAt };
  }

  async sendVerificationCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    const message = `Ваш код подтверждения TechnoStore: ${code}. Действителен 10 минут.`;

    const result = await this.provider.sendSms(phone, message);

    if (!result.success) {
      console.error('❌ Failed to send SMS:', result.error);
    }

    return {
      success: result.success,
      error: result.error,
    };
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.provider.sendSms(phone, message);

    if (!result.success) {
      console.error('❌ Failed to send SMS:', result.error);
    }

    return {
      success: result.success,
      error: result.error,
    };
  }
}

export const smsService = new SmsService();
