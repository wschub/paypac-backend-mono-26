import { z } from 'zod';

/**
 * Schema para obtener ticket por ID
 */
export const getTicketByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para transferir ticket
 */
export const transferTicketSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    to_user_id: z.number().int().positive('El ID del receptor es requerido'),
    to_user_uid: z.string().min(1, 'El UID del receptor es requerido'),
    to_user_id_phone: z.string().min(1, 'El ID del teléfono del receptor es requerido'),
    from_user_id_phone: z.string().min(1, 'El ID del teléfono del remitente es requerido'),
    transaction_type: z.enum(['transfer', 'sale', 'gift'], {
  message: 'El tipo de transacción debe ser: transfer, sale o gift',
}),

    description: z.string().optional(),
  }),
});

/**
 * 🆕 Schema para validar ticket en entrada del evento
 * ACTUALIZADO: Ahora requiere event_id
 */
export const validateTicketSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    qr_token: z.string().min(32, 'El token del QR es inválido'),
    event_id: z.number().int().positive('El ID del evento es requerido'), // 🆕 Agregado
  }),
});

/**
 * Schema para obtener tickets próximos
 */
export const getUpcomingTicketsSchema = z.object({
  query: z.object({
    days: z.string().regex(/^\d+$/, 'Los días deben ser numéricos').optional(),
  }).optional(),
});

/**
 * Schema para cancelar ticket
 */
export const cancelTicketSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener stats de evento
 */
export const getEventStatsSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});