import type { SmsProvider } from '@/types/sms';

export class MessaggioSmsProvider implements SmsProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: phone,
          message,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Messaggio API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId || data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
