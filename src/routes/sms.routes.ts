import { Router } from 'express';
import { registerCode2FA, verificationCode2FA, verificationFake } from '../controllers/sms.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { sendCode2FASchema, verifyCode2FASchema } from '../validators/sms.validation';

const router = Router();

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
router.post(
  '/getcode2FA',
  validateRequest(sendCode2FASchema),
  registerCode2FA
);

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
router.post(
  '/verifycode2FA',
  validateRequest(verifyCode2FASchema),
  verificationCode2FA
);



router.post(
  '/verificationfake',
  //validateRequest(verifyCode2FASchema),
  verificationFake
);


export default router;