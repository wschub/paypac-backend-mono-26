import { z } from 'zod';

const rewardTypeEnum = z.enum([
  'NONE',
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'GUEST_LIST',
  'TICKET_REWARD',
  'CASH_REWARD',
  'CONSUMPTION_REWARD',
]);

const commissionBaseEnum = z.enum(['ON_ORIGINAL', 'ON_DISCOUNTED']);

// ── Campos de descuento al cliente (compartidos entre create y update) ──
const customerDiscountFields = {
  apply_customer_discount: z.boolean().optional().default(false),
  customer_discount_type:  z.number().int().min(1).max(2).optional().nullable(),
  customer_discount_value: z.number().int().positive().optional().nullable(),
  commission_base:         commissionBaseEnum.optional().default('ON_DISCOUNTED'),
};

/**
 * Schema para crear una regla de recompensa
 */
export const createRewardRuleSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    reward_type:        rewardTypeEnum,
    reward_percentage:  z.number().int().min(1).max(100).optional().nullable(),
    reward_amount:      z.number().int().positive().optional().nullable(),
    min_qty_tickets:    z.number().int().positive().optional().nullable(),
    min_amount_tickets: z.number().int().positive().optional().nullable(),
    locality_id:        z.number().int().positive().optional().nullable(),
    ...customerDiscountFields,
  })
  .refine(
    (data) => !(data.reward_type === 'PERCENTAGE' && !data.reward_percentage),
    {
      message: 'El tipo PERCENTAGE requiere reward_percentage',
      path: ['reward_percentage'],
    }
  )
  .refine(
    (data) => !(['FIXED_AMOUNT', 'CASH_REWARD', 'TICKET_REWARD'].includes(data.reward_type) && !data.reward_amount),
    {
      message: 'Este tipo de recompensa requiere reward_amount',
      path: ['reward_amount'],
    }
  )
  .refine(
    (data) => {
      // Si aplica dcto al cliente, debe tener type y value
      if (data.apply_customer_discount) {
        return !!data.customer_discount_type && !!data.customer_discount_value;
      }
      return true;
    },
    {
      message: 'Si apply_customer_discount es true, se requieren customer_discount_type y customer_discount_value',
      path: ['customer_discount_value'],
    }
  ),
});

/**
 * Schema para actualizar una regla de recompensa
 */
export const updateRewardRuleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    reward_type:        rewardTypeEnum.optional(),
    reward_percentage:  z.number().int().min(1).max(100).optional().nullable(),
    reward_amount:      z.number().int().positive().optional().nullable(),
    min_qty_tickets:    z.number().int().positive().optional().nullable(),
    min_amount_tickets: z.number().int().positive().optional().nullable(),
    locality_id:        z.number().int().positive().optional().nullable(),
    ...customerDiscountFields,
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Debes enviar al menos un campo para actualizar' }
  )
  .refine(
    (data) => {
      if (data.apply_customer_discount) {
        return !!data.customer_discount_type && !!data.customer_discount_value;
      }
      return true;
    },
    {
      message: 'Si apply_customer_discount es true, se requieren customer_discount_type y customer_discount_value',
      path: ['customer_discount_value'],
    }
  ),
});

/**
 * Schema para obtener regla por ID
 */
export const getRewardRuleByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener reglas por evento
 */
export const getRewardRulesByEventIdSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para calcular recompensa
 */
export const calculateRewardSchema = z.object({
  body: z.object({
    event_id:     z.number().int().positive('El ID del evento es requerido'),
    quantity:     z.number().int().positive('La cantidad debe ser mayor a 0'),
    total_amount: z.number().int().positive('El monto total debe ser mayor a 0'),
    locality_id:  z.number().int().positive().optional(),
  }),
});

/**
 * Schema para validar código en checkout
 * GET /api/discounts/validate/:code?event_id=123
 */
export const validateCodeSchema = z.object({
  params: z.object({
    code: z.string().min(1, 'El código es requerido'),
  }),
  query: z.object({
    event_id: z.string().regex(/^\d+$/, 'event_id debe ser numérico'),
  }),
});