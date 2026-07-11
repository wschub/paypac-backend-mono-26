"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicLocalitiesParamsSchema = exports.getPublicEventByIdParamsSchema = exports.getPublicEventsQuerySchema = void 0;
const zod_1 = require("zod");
exports.getPublicEventsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        city: zod_1.z.string().optional(),
        category_id: zod_1.z.string().optional(),
        subcategory_id: zod_1.z.string().optional(),
        subgenre_id: zod_1.z.string().optional(),
        sort_by: zod_1.z.enum(['date_asc', 'popularity', 'price_asc', 'price_desc', 'name_asc']).optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }).optional(),
});
exports.getPublicEventByIdParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((val) => /^\d+$/.test(val) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), 'El id debe ser numérico o UUID'),
    }),
});
exports.getPublicLocalitiesParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
