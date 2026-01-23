import { z } from 'zod';

/**
 * Schema para guardar una tarjeta tokenizada
 * Este endpoint se llama DESPUÉS de tokenizar en Wompi
 */
export const createPaymentMethodCardSchema = z.object({
  body: z.object({
    id_token: z.string().min(10, 'El token de la tarjeta es requerido'),
    created_at: z.string(), // ISO 8601 timestamp de Wompi
    brand: z.string().min(2, 'La marca de la tarjeta es requerida'), // VISA, MASTERCARD, AMEX
    name: z.string().min(3, 'El nombre descriptivo es requerido'), // Ej: "VISA-4242"
    last_four: z.string().length(4, 'Deben ser los últimos 4 dígitos'),
    bin: z.string().length(6, 'El BIN debe tener 6 dígitos'),
    exp_year: z.string().length(2, 'El año debe tener 2 dígitos'), // "28"
    exp_month: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Mes inválido (01-12)'), // "08"
    card_holder: z.string().min(3, 'El nombre del titular es requerido'),
    created_with_cvc: z.boolean().default(true),
    expires_at: z.string(), // ISO 8601 timestamp
    validity_ends_at: z.string(), // ISO 8601 timestamp
  }),
});

/**
 * Schema para obtener tarjeta por ID
 */
export const getPaymentMethodCardByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para eliminar tarjeta
 */
export const deletePaymentMethodCardSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para listar tarjetas del usuario
 * No requiere validación adicional, usa el user_id del token
 */
export const getMyCardsSchema = z.object({
  query: z.object({
    active_only: z.enum(['true', 'false']).optional(), // Filtrar solo tarjetas no expiradas
  }).optional(),
});