import { z } from 'zod';

const TICKET_STATUSES = [
  'PENDING', 'PAID', 'ACTIVE', 'USED',
  'FROZEN', 'TRANSFERRED', 'CANCELED', 'EXPIRED', 'ON_SALE',
] as const;

export const getAdminTicketsSchema = z.object({
  query: z.object({
    event_id: z.string().regex(/^\d+$/).optional(),
    status:   z.enum(TICKET_STATUSES).optional(),
    search:   z.string().min(1).max(100).optional(),
    from:     z.string().datetime().optional(),
    to:       z.string().datetime().optional(),
    page:     z.string().regex(/^\d+$/).optional(),
    limit:    z.string().regex(/^\d+$/).optional(),
  }).optional(),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
  }),
  body: z.object({
    status: z.enum(TICKET_STATUSES, { error: 'Status inválido' }),
  }),
});

export const adminTransferTicketSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
  }),
  body: z.object({
    to_user_id: z.number().int().positive({ message: 'to_user_id requerido' }),
  }),
});