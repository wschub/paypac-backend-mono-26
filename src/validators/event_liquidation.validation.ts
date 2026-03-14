import { z } from 'zod';

export const createLiquidationSchema = z.object({
  body: z.object({
    company_id:          z.number().int().positive(),
    event_id:            z.number().int().positive(),
    gross_amount:        z.number().positive(),
    paypac_commission:   z.number().min(0),
    promoter_commission: z.number().min(0).optional(),
    refunds:             z.number().min(0).optional(),
    liquidation_date:    z.string().datetime(),
  }),
});

export const updateLiquidationStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'OVERDUE'], { error: 'Status inválido' }),
  }),
});

export const liquidationIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
  }),
});

export const liquidationQuerySchema = z.object({
  query: z.object({
    status:   z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
    event_id: z.string().regex(/^\d+$/).optional(),
    from:     z.string().datetime().optional(),
    to:       z.string().datetime().optional(),
  }).optional(),
});