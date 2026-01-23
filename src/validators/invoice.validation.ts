import { z } from 'zod';

/**
 * Schema para crear factura
 */
export const createInvoiceSchema = z.object({
  body: z.object({
    event_id: z.number().int().positive('El ID del evento es requerido'),
    items: z
  .array(
    z.object({
      stage_id: z.number().int().positive('El ID del stage es requerido'),
      locality_id: z.number().int().positive('El ID de la localidad es requerido'),
      qty_tickets: z.number().int().positive('La cantidad debe ser mayor a 0'),
    })
  )
  .min(1, 'Debe agregar al menos un item'),

    discount_code: z.string().optional(),
  }),
});

/**
 * Schema para obtener factura por ID
 */
export const getInvoiceByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener facturas por evento
 */
export const getEventInvoicesSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para actualizar estado de factura
 */
export const updateInvoiceStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    status: z.enum([
      'ISSUED',
      'PRECESSING',
      'PAID',
      'PENDING',
      'REJECTED',
      'CANCELED',
    ]),
  }),
});