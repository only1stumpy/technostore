import type { SmsProvider } from '@/types/sms';

export class MockSmsProvider implements SmsProvider {
  async sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('📱 [Mock SMS Provider]');
    console.log(`   To: ${phone}`);
    console.log(`   Message: ${message}`);
    console.log('   ✓ SMS sent successfully (mock)');

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }
}
