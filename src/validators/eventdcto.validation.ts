import { z } from 'zod';

/**
 * Schema para crear un descuento
 */
export const createDiscountSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    name_dcto:       z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description:     z.string().optional(),
    type_dcto:       z.number().int().min(1).max(2),
    value_dcto:      z.number().int().positive('El valor debe ser mayor a 0'),
    min_qty_tickets: z.number().int().positive().optional().nullable(),
    max_qty_tickets: z.number().int().positive().optional().nullable(),
    locality_id:     z.number().int().positive().optional().nullable(),
    code:            z.string().min(3).max(20)
                       .regex(/^[A-Z0-9\-_]+$/i)
                       .optional(),
    is_active:       z.boolean().optional(),
    max_uses:        z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => !(data.type_dcto === 1 && data.value_dcto > 100),
    { message: 'El porcentaje no puede ser mayor a 100%', path: ['value_dcto'] }
  )
  .refine(
    (data) => {
      if (data.min_qty_tickets && data.max_qty_tickets) {
        return data.min_qty_tickets <= data.max_qty_tickets;
      }
      return true;
    },
    { message: 'La cantidad mínima no puede ser mayor a la máxima', path: ['max_qty_tickets'] }
  ),
});

/**
 * Schema para actualizar un descuento
 */
export const updateDiscountSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    name_dcto: z.string().min(3).optional(),
    description: z.string().optional(),
    type_dcto: z.number().int().min(1).max(2).optional(),
    value_dcto: z.number().int().positive().optional(),
    min_qty_tickets: z.number().int().positive().optional().nullable(),
    max_qty_tickets: z.number().int().positive().optional().nullable(),
    locality_id: z.number().int().positive().optional().nullable(),
  }).refine(
    (data) => {
      if (data.type_dcto === 1 && data.value_dcto && data.value_dcto > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'El descuento por porcentaje no puede ser mayor a 100%',
      path: ['value_dcto'],
    }
  ),
});

/**
 * Schema para obtener descuento por ID
 */
export const getDiscountByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener descuentos por evento
 */
export const getDiscountsByEventIdSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para validar un código de descuento
 */
export const validateDiscountSchema = z.object({
  body: z.object({
    event_id: z.number().int().positive('El ID del evento es requerido'),
    discount_name: z.string().min(1, 'El nombre del descuento es requerido'),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
    locality_id: z.number().int().positive().optional(),
  }),
});

/**
 * Schema para calcular descuento
 */
export const calculateDiscountSchema = z.object({
  body: z.object({
    total_amount: z.number().int().positive('El monto total debe ser mayor a 0'),
    discount_type: z.number().int().min(1).max(2),
    discount_value: z.number().int().positive('El valor del descuento debe ser mayor a 0'),
  }),
});

/**
 * Schema para obtener descuentos aplicables
 */
export const getApplicableDiscountsSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  query: z.object({
    quantity: z.string().regex(/^\d+$/, 'La cantidad debe ser numérica'),
    locality_id: z.string().regex(/^\d+$/).optional(),
  }),
});