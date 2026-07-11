"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminTransferTicketSchema = exports.updateTicketStatusSchema = exports.getAdminTicketsSchema = void 0;
const zod_1 = require("zod");
const TICKET_STATUSES = [
    'PENDING', 'PAID', 'ACTIVE', 'USED',
    'FROZEN', 'TRANSFERRED', 'CANCELED', 'EXPIRED', 'ON_SALE',
];
exports.getAdminTicketsSchema = zod_1.z.object({
    query: zod_1.z.object({
        event_id: zod_1.z.string().regex(/^\d+$/).optional(),
        status: zod_1.z.enum(TICKET_STATUSES).optional(),
        search: zod_1.z.string().min(1).max(100).optional(),
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
        page: zod_1.z.string().regex(/^\d+$/).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).optional(),
    }).optional(),
});
exports.updateTicketStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(TICKET_STATUSES, { error: 'Status inválido' }),
    }),
});
exports.adminTransferTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
    }),
    body: zod_1.z.object({
        to_user_id: zod_1.z.number().int().positive({ message: 'to_user_id requerido' }),
    }),
});
