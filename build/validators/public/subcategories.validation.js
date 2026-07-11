"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSubcategoriesParamsSchema = void 0;
const zod_1 = require("zod");
exports.getPublicSubcategoriesParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        categoryId: zod_1.z.string().regex(/^\d+$/, 'El categoryId debe ser numérico'),
    }),
});
