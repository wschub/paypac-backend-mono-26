import { z } from 'zod';

export const transferPointsSchema = z.object({
  body: z.object({
    to_user_id: z.number().int().positive({ message: 'ID de usuario inválido' }),
    points: z.number().int().positive({ message: 'La cantidad de puntos debe ser positiva' }),
    description: z.string().max(500).optional(),
  }),
});

export const getHistorySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z
      .enum(['EARNED', 'REDEEMED', 'EXPIRED', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'ADJUSTMENT', 'BONUS', 'REFUND'])
      .optional(),
  }),
});
