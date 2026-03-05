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

//enviar invitacion 
export const inviteStaffSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  query: z.object({
    invite: z.literal('true'),
  }),
  body: z.object({
    role_type: z.enum(['STAFF', 'STAFF_PROMOTER'], {
      error: 'role_type debe ser STAFF o STAFF_PROMOTER',
    }),
    door_identifier: z.string().optional(),
    email_or_phone: z
      .string()
      .min(5, 'Email o teléfono requerido')
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\+?[\d\s\-]{7,15}$/.test(val),
        { message: 'Debe ser un email o teléfono válido' }
      ),
  }),
});