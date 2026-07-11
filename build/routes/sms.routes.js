"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sms_controller_1 = require("../controllers/sms.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const sms_validation_1 = require("../validators/sms.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/sms/getcode2FA
 * Enviar código de verificación 2FA por SMS
 * Acceso: Público (no requiere autenticación)
 *
 * Body:
 * - phone: string (10-15 dígitos, puede iniciar con +)
 *
 * Respuestas:
 * - 200: Código enviado exitosamente
 * - 409: Número de teléfono ya registrado
 * - 400: Error de validación
 * - 500: Error del servidor
 */
router.post('/getcode2FA', (0, validate_middleware_1.validateRequest)(sms_validation_1.sendCode2FASchema), sms_controller_1.registerCode2FA);
/**
 * POST /api/sms/verifycode2FA
 * Verificar código de verificación 2FA
 * Acceso: Público (no requiere autenticación)
 *
 * Body:
 * - phone: string (10-15 dígitos, puede iniciar con +)
 * - code: string (exactamente 6 dígitos)
 *
 * Respuestas:
 * - 200: Código verificado exitosamente
 * - 400: Código inválido o expirado
 * - 500: Error del servidor
 */
router.post('/verifycode2FA', (0, validate_middleware_1.validateRequest)(sms_validation_1.verifyCode2FASchema), sms_controller_1.verificationCode2FA);
/**
 * POST /api/sms/check-phone
 * Verificar si un número ya está registrado
 * Acceso: Público
 * Body: { phone: string }
 * Respuesta: { exists: boolean, redirect: 'login' | 'register' }
 */
router.post('/check-phone', (0, validate_middleware_1.validateRequest)(sms_validation_1.checkPhoneSchema), sms_controller_1.checkPhoneExists);
router.post('/verificationfake', 
//validateRequest(verifyCode2FASchema),
sms_controller_1.verificationFake);
exports.default = router;
