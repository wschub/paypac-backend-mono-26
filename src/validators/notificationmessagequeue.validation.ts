import { z } from 'zod';

/**
 * Schema para encolar un email
 */
export const queueEmailSchema = z.object({
  body: z.object({
    user_id: z.number().int().positive('El user_id debe ser un número positivo'),
    email_delivery: z.string().email('Debe ser un email válido'),
    template_code: z.string().min(3, 'El código del template es requerido'),
    variables: z.record(z.union([z.string(), z.number()])), // Objeto con variables
    send_at: z.string().datetime().optional(), // ISO 8601 timestamp
  }),
});

/**
 * Schema para obtener mensaje por ID
 */
export const getMessageByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar mensajes
 */
export const getMessagesQuerySchema = z.object({
  query: z.object({
    status: z.enum(['0', '1', '2']).optional(), // 0: Pendiente, 1: Enviado, 2: Fallido
    user_id: z.string().regex(/^\d+$/).optional(),
    template_id: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});

/**
 * Schema para reintentar mensaje
 */
export const retryMessageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para limpiar mensajes antiguos
 */
export const cleanOldMessagesSchema = z.object({
  body: z.object({
    days_old: z.number().int().min(1).max(365).default(30),
  }),
});