"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPhoneSchema = exports.verifyCode2FASchema = exports.sendCode2FASchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para enviar código 2FA por SMS
 */
exports.sendCode2FASchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string()
            .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
            .max(15, 'El número de teléfono no puede tener más de 15 dígitos')
            .regex(/^\+?[0-9]+$/, 'El teléfono debe contener solo números (puede iniciar con +)'),
    }),
});
/**
 * Schema para verificar código 2FA
 */
exports.verifyCode2FASchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string()
            .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
            .max(15, 'El número de teléfono no puede tener más de 15 dígitos')
            .regex(/^\+?[0-9]+$/, 'El teléfono debe contener solo números (puede iniciar con +)'),
        code: zod_1.z.string()
            .length(6, 'El código debe tener exactamente 6 dígitos')
            .regex(/^[0-9]{6}$/, 'El código debe contener solo números'),
    }),
});
exports.checkPhoneSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string()
            .min(10, { message: 'Número de teléfono inválido' })
            .max(15),
    }),
});
