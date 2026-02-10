import { Router } from 'express';
import { updateFcmToken, deleteFcmToken } from '../controllers/fcm-token.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

/**
 * PUT /api/users/fcm-token
 * Actualizar FCM token del usuario
 */
router.put('/', 
    authenticate, 
    authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
    updateFcmToken);

/**
 * DELETE /api/users/fcm-token
 * Eliminar FCM token del usuario (logout)
 */
router.delete('/',
     authenticate, 
     authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
     deleteFcmToken);

export default router;