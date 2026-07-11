"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyIdParamSchema = void 0;
const zod_1 = require("zod");
exports.companyIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        companyId: zod_1.z.string().regex(/^\d+$/, { error: 'companyId debe ser un número entero positivo' }),
    }),
});
