import { z } from 'zod';

/**
 * Schema para enviar código 2FA por SMS
 */
export const sendCode2FASchema = z.object({
  body: z.object({
    phone: z.string()
      .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
      .max(15, 'El número de teléfono no puede tener más de 15 dígitos')
      .regex(/^\+?[0-9]+$/, 'El teléfono debe contener solo números (puede iniciar con +)'),
  }),
});

/**
 * Schema para verificar código 2FA
 */
export const verifyCode2FASchema = z.object({
  body: z.object({
    phone: z.string()
      .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
      .max(15, 'El número de teléfono no puede tener más de 15 dígitos')
      .regex(/^\+?[0-9]+$/, 'El teléfono debe contener solo números (puede iniciar con +)'),
    code: z.string()
      .length(6, 'El código debe tener exactamente 6 dígitos')
      .regex(/^[0-9]{6}$/, 'El código debe contener solo números'),
  }),
});