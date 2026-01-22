import { Router } from 'express';
import { wompiWebhook } from '../controllers/wompi.controller';

const router = Router();

/**
 * POST /api/webhooks/wompi
 * Webhook de Wompi para notificaciones de transacciones
 *
 * ⚠️ IMPORTANTE: Este endpoint NO debe tener autenticación
 * Wompi lo llamará directamente con su propia firma de seguridad
 *
 * La verificación de seguridad se hace dentro del controller
 * mediante la validación de la firma SHA256
 */
router.post('/wompi', wompiWebhook);

export default router;
