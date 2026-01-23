import { Router } from 'express';
import {
  createPaymentMethod,
  getPaymentMethods,
  getActivePaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  updatePaymentMethodStatus,
  deletePaymentMethod,
  getPaymentMethodsStats,
} from '../controllers/paymentmethodsui.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createPaymentMethodUISchema,
  updatePaymentMethodUISchema,
  getPaymentMethodUIByIdSchema,
  updatePaymentMethodUIStatusSchema,
} from '../validators/paymentmethodsui.validation';

const router = Router();

/**
 * POST /api/payment-methods
 * Crear un nuevo método de pago
 * Requiere: PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createPaymentMethodUISchema),
  createPaymentMethod
);

/**
 * GET /api/payment-methods
 * Listar todos los métodos de pago (con filtros opcionales)
 * Acceso: Todos los roles autenticados
 * 
 * Query params opcionales:
 * - method_status: 0 (inactivos) | 1 (activos)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getPaymentMethods
);

/**
 * GET /api/payment-methods/active
 * Listar solo métodos de pago activos
 * Acceso: Todos los roles autenticados
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/active',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getActivePaymentMethods
);

/**
 * GET /api/payment-methods/stats
 * Obtener estadísticas de métodos de pago
 * Requiere: PAYPAC
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  getPaymentMethodsStats
);

/**
 * GET /api/payment-methods/:id
 * Obtener un método de pago específico por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getPaymentMethodUIByIdSchema),
  getPaymentMethodById
);

/**
 * PUT /api/payment-methods/:id
 * Actualizar un método de pago completo
 * Requiere: PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updatePaymentMethodUISchema),
  updatePaymentMethod
);

/**
 * PATCH /api/payment-methods/:id/status
 * Actualizar solo el status del método de pago
 * Requiere: PAYPAC
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updatePaymentMethodUIStatusSchema),
  updatePaymentMethodStatus
);

/**
 * DELETE /api/payment-methods/:id
 * Eliminar un método de pago
 * Requiere: PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getPaymentMethodUIByIdSchema),
  deletePaymentMethod
);

export default router;