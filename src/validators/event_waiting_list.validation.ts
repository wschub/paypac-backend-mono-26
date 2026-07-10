import { z } from 'zod';

export const registerWaitingListSchema = z.object({
  body: z.object({
    event_id:     z.number().int().positive({ message: 'event_id es requerido' }),
    locality_id:  z.number().int().positive().nullable().optional(),
    name:         z.string().min(1).max(100),
    last_name:    z.string().min(1).max(100),
    email:        z.string().email({ message: 'email inválido' }),
    phone_number: z.string().min(7).max(20),
    qty_requested: z.number().int().min(1).max(10).optional(),
  }),
});

export const eventIdParamSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const localityIdParamSchema = z.object({
  params: z.object({
    localityId: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const waitingListIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
});
