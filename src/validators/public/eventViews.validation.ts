import { z } from 'zod';

export const createEventViewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    session_token: z.string().uuid(),
    user_id: z.number().optional().nullable(),
    session_channel: z.enum(['WEB', 'APP']),
    country_id: z.number().optional().nullable(),
    city_id: z.number().optional().nullable(),
  }),
});

export const updateEventViewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    sessionToken: z.string().uuid(),
  }),
  body: z.object({
    duration: z.number().int().positive(),
  }),
});
