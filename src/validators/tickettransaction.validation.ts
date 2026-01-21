import { z } from 'zod';

/**
 * Schema para obtener transacción por ID
 */
export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para aceptar transferencia
 */
export const acceptTransferSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para rechazar transferencia
 */
export const rejectTransferSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para cancelar transferencia
 */
export const cancelTransferSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener historial de un ticket
 */
export const getTicketHistorySchema = z.object({
  params: z.object({
    ticketId: z.string().regex(/^\d+$/, 'El ticketId debe ser numérico'),
  }),
});
