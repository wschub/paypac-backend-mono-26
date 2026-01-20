import { z } from 'zod';

/**
 * Enum de tipos de recompensa
 */
const rewardTypeEnum = z.enum([
  'NONE',
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'GUEST_LIST',
  'TICKET_REWARD',
  'CASH_REWARD',
  'CONSUMPTION_REWARD',
]);

/**
 * Schema para crear una regla de recompensa
 */
export const createRewardRuleSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    reward_type: rewardTypeEnum,
    reward_percentage: z.number().int().min(1).max(100).optional().nullable(),
    reward_amount: z.number().int().positive().optional().nullable(),
    min_qty_tickets: z.number().int().positive().optional().nullable(),
    min_amount_tickets: z.number().int().positive().optional().nullable(),
    locality_id: z.number().int().positive().optional().nullable(),
  }).refine(
    (data) => {
      // Si es PERCENTAGE, debe tener reward_percentage
      if (data.reward_type === 'PERCENTAGE' && !data.reward_percentage) {
        return false;
      }
      return true;
    },
    {
      message: 'El tipo PERCENTAGE requiere reward_percentage',
      path: ['reward_percentage'],
    }
  ).refine(
    (data) => {
      // Si es FIXED_AMOUNT o CASH_REWARD, debe tener reward_amount
      if (['FIXED_AMOUNT', 'CASH_REWARD', 'TICKET_REWARD'].includes(data.reward_type) && !data.reward_amount) {
        return false;
      }
      return true;
    },
    {
      message: 'Este tipo de recompensa requiere reward_amount',
      path: ['reward_amount'],
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
    reward_type: rewardTypeEnum.optional(),
    reward_percentage: z.number().int().min(1).max(100).optional().nullable(),
    reward_amount: z.number().int().positive().optional().nullable(),
    min_qty_tickets: z.number().int().positive().optional().nullable(),
    min_amount_tickets: z.number().int().positive().optional().nullable(),
    locality_id: z.number().int().positive().optional().nullable(),
  }),
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
    event_id: z.number().int().positive('El ID del evento es requerido'),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
    total_amount: z.number().int().positive('El monto total debe ser mayor a 0'),
    locality_id: z.number().int().positive().optional(),
  }),
});