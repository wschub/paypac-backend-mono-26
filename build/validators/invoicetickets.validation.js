"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesSummaryByEventSchema = exports.getTicketsSoldByLocalitySchema = exports.getTicketsSoldByStageSchema = exports.getItemByIdSchema = exports.getInvoiceItemsSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para obtener items por factura
 */
exports.getInvoiceItemsSchema = zod_1.z.object({
    params: zod_1.z.object({
        invoiceId: zod_1.z.string().regex(/^\d+$/, 'El invoiceId debe ser numérico'),
    }),
});
/**
 * Schema para obtener item por ID
 */
exports.getItemByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener tickets vendidos por stage
 */
exports.getTicketsSoldByStageSchema = zod_1.z.object({
    params: zod_1.z.object({
        stageId: zod_1.z.string().regex(/^\d+$/, 'El stageId debe ser numérico'),
    }),
});
/**
 * Schema para obtener tickets vendidos por localidad
 */
exports.getTicketsSoldByLocalitySchema = zod_1.z.object({
    params: zod_1.z.object({
        localityId: zod_1.z.string().regex(/^\d+$/, 'El localityId debe ser numérico'),
    }),
});
/**
 * Schema para obtener resumen de ventas por evento
 */
exports.getSalesSummaryByEventSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
