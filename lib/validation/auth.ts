import { z } from 'zod';

export const smsCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Код должен содержать ровно 6 цифр')
    .length(6, 'Код должен содержать 6 цифр'),
});
