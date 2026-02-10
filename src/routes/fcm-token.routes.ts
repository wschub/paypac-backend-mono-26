import { Router } from 'express';
import { updateFcmToken, deleteFcmToken } from '../controllers/fcm-token.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * PUT /api/users/fcm-token
 * Actualizar FCM token del usuario
 */
router.put('/fcm-token', authenticate, updateFcmToken);

/**
 * DELETE /api/users/fcm-token
 * Eliminar FCM token del usuario (logout)
 */
router.delete('/fcm-token', authenticate, deleteFcmToken);

export default router;