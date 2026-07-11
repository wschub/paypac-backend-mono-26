"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSubgenresQuerySchema = void 0;
const zod_1 = require("zod");
exports.getPublicSubgenresQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        subcategory_id: zod_1.z.string().regex(/^\d+$/).optional(),
        category_id: zod_1.z.string().regex(/^\d+$/).optional(),
    }).optional(),
});
