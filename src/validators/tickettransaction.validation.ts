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


// ═══════════════════════════════════════════════════════════════════════════
// 4. tickettransaction.validation.ts — agregar 2 schemas nuevos
// ═══════════════════════════════════════════════════════════════════════════
 
export const sendTransferSchema = z.object({
  body: z.object({
    ticket_id: z.number().int().positive({ message: 'ticket_id requerido' }),
    contact:   z.string().min(5, { message: 'Email o celular del destinatario requerido' }),
    type_transaction: z.enum(['transfer', 'sale', 'gift'], { error: 'Tipo inválido' }),
    transaction_description: z.string().max(300).optional(),
  }),
});
 
export const acceptByContactSchema = z.object({
  body: z.object({
    contact: z.string().min(5, { message: 'Email o celular requerido' }),
  }),
});