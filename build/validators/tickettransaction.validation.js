"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptByContactSchema = exports.sendTransferSchema = exports.getTicketHistorySchema = exports.cancelTransferSchema = exports.rejectTransferSchema = exports.acceptTransferSchema = exports.getTransactionByIdSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para obtener transacción por ID
 */
exports.getTransactionByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para aceptar transferencia
 */
exports.acceptTransferSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para rechazar transferencia
 */
exports.rejectTransferSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para cancelar transferencia
 */
exports.cancelTransferSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener historial de un ticket
 */
exports.getTicketHistorySchema = zod_1.z.object({
    params: zod_1.z.object({
        ticketId: zod_1.z.string().regex(/^\d+$/, 'El ticketId debe ser numérico'),
    }),
});
// ═══════════════════════════════════════════════════════════════════════════
// 4. tickettransaction.validation.ts — agregar 2 schemas nuevos
// ═══════════════════════════════════════════════════════════════════════════
exports.sendTransferSchema = zod_1.z.object({
    body: zod_1.z.object({
        ticket_id: zod_1.z.number().int().positive({ message: 'ticket_id requerido' }),
        contact: zod_1.z.string().min(5, { message: 'Email o celular del destinatario requerido' }),
        type_transaction: zod_1.z.enum(['transfer', 'sale', 'gift'], { error: 'Tipo inválido' }),
        transaction_description: zod_1.z.string().max(300).optional(),
    }),
});
exports.acceptByContactSchema = zod_1.z.object({
    body: zod_1.z.object({
        contact: zod_1.z.string().min(5, { message: 'Email o celular requerido' }),
    }),
});
