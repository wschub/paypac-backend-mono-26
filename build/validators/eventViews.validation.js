"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markConversionSchema = void 0;
const zod_1 = require("zod");
exports.markConversionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        session_token: zod_1.z.string().uuid(),
    }),
});
