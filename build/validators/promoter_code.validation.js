"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.codeParamSchema = exports.createCodeSchema = void 0;
const zod_1 = require("zod");
exports.createCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        custom_code: zod_1.z.string()
            .min(4, { message: 'El código debe tener al menos 4 caracteres' })
            .max(20, { message: 'El código no puede tener más de 20 caracteres' })
            .regex(/^[A-Z0-9\-_]+$/i, { message: 'Solo letras, números, guiones y guiones bajos' })
            .optional(),
    }),
});
exports.codeParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        code: zod_1.z.string().min(1, { message: 'Código requerido' }),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
    }),
});
