export interface SmsProvider {
  sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface SmsVerificationCode {
  code: string;
  expiresAt: Date;
}
