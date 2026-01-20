import { z } from 'zod';

/**
 * Schema para obtener balances por evento
 */
export const getBalancesByEventIdSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para obtener balance de promotor
 */
export const getPromoterBalanceSchema = z.object({
  params: z.object({
    promoterId: z.string().regex(/^\d+$/, 'El promoterId debe ser numérico'),
  }),
});

/**
 * Schema para marcar como pagado
 */
export const markAsPaidSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    payment_method: z.string().optional(),
    payment_reference: z.string().optional(),
  }).optional(),
});

/**
 * Schema para pago en lote
 */
export const bulkMarkAsPaidSchema = z.object({
  body: z.object({
    balance_ids: z.array(z.number().int().positive(), {
      required_error: 'Se requiere un array de IDs de balances',
    }).min(1, 'Debe proporcionar al menos un ID de balance'),
    payment_date: z.string().datetime().optional(),
    payment_method: z.string().optional(),
    payment_reference: z.string().optional(),
  }),
});

/**
 * Schema para crear balance de reembolso
 */
export const createRefundBalanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id del balance original debe ser numérico'),
  }),
});

/**
 * Schema para asignar fecha de corte
 */
export const assignCutoffDateSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    days_after_event: z.number().int().positive().optional().default(15),
  }).optional(),
});