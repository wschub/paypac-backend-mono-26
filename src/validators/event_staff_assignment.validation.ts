import { z } from 'zod';

/**
 * Schema para asignar STAFF a evento
 */
export const assignStaffSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    staff_user_id: z.number().int().positive('El ID del staff es requerido'),
    role_type: z.enum(['STAFF', 'STAFF_PROMOTER'], {
      message: 'El tipo de rol debe ser STAFF o STAFF_PROMOTER',
    }),
  }),
});

/**
 * Schema para obtener staff de un evento
 */
export const getEventStaffSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para remover staff de evento
 */
export const removeStaffSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    staffUserId: z.string().regex(/^\d+$/, 'El staffUserId debe ser numérico'),
  }),
});

/**
 * Schema para check-in de staff
 */
export const checkInStaffSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }).optional(),
});

/**
 * Schema para check-out de staff
 */
export const checkOutStaffSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para obtener stats de staff
 */
export const getStaffStatsSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});
