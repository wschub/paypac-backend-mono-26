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
  .refine((arr) => arr.length > 0, {
    message: 'Debe agregar al menos un item',
  }),
    discount_code:  z.string().optional(),
    promoter_code:  z.string().optional(),
    user_num_doc:   z.string().optional(),
    user_type_doc:  z.enum(['CC','CE','PA','TI','NIT','SSN']).optional(),
    device_uuid:    z.string().min(1).optional(),
    sale_channel:   z.enum(['WEB', 'APP']).optional(),
    payment_method: z.union([
      // Códigos Wompi + POINTS (interno) + alias legacy (CREDIT_CARD, BNPL)
      z.enum([
        'CARD', 'NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER', 'BANCOLOMBIA_QR',
        'BANCOLOMBIA_COLLECT', 'DAVIPLATA', 'BANCOLOMBIA_BNPL', 'PCOL',
        'POINTS', 'CREDIT_CARD', 'BNPL',
      ]),
      z.object({
        type:         z.string(),
        card_token:   z.string().optional(),
        installments: z.number().int().optional(),
        brand:        z.string().optional(),
        last_four:    z.string().optional(),
      }),
    ]).optional(),
    points_to_use:  z.number().int().min(1).optional(),
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
      'REFUNDED',
    ]),
  }),
});