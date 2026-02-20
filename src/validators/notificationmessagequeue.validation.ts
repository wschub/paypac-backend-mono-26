import { z } from 'zod';

/**
 * Schema para encolar un email
 */
export const queueEmailSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    email: z.string().email(),
    templateCode: z.string().min(3),
    variables: z.record(z.string(), z.union([z.string(), z.number()])),
    sendAt: z.string().datetime().optional(),
  }),
});

/**
 * Schema para obtener mensaje por ID
 */
export const getMessageByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

/**
 * Schema para filtrar mensajes
 */
export const getMessagesQuerySchema = z.object({
  query: z.object({
    status: z.enum(['0', '1', '2']).optional(),
    user_id: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});

/**
 * Schema para reintentar mensaje
 */
export const retryMessageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

/**
 * Schema para limpiar antiguos
 */
export const cleanOldMessagesSchema = z.object({
  body: z.object({
    days_old: z.number().int().min(1).max(365).default(30),
  }),
});