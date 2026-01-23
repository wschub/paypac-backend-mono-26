import { Router } from 'express';
import {
  createCard,
  getMyCards,
  getCardStats,
  getCardById,
  deleteCard,
  cleanExpiredCards,
  validateCard,
} from '../controllers/paymentmethodcard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createPaymentMethodCardSchema,
  getPaymentMethodCardByIdSchema,
  deletePaymentMethodCardSchema,
  getMyCardsSchema,
} from '../validators/paymentmethodcard.validation';

const router = Router();

/**
 * POST /api/payment-cards
 * Guardar una nueva tarjeta tokenizada
 * Acceso: Todos los roles autenticados
 * 
 * FLUJO:
 * 1. Frontend tokeniza tarjeta en Wompi
 * 2. Frontend envía token a este endpoint
 * 3. Backend guarda tarjeta en BD
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(createPaymentMethodCardSchema),
  createCard
);

/**
 * GET /api/payment-cards
 * Listar todas las tarjetas del usuario autenticado
 * Acceso: Todos los roles autenticados
 * 
 * Query params opcionales:
 * - active_only: true | false (filtrar solo tarjetas no expiradas)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getMyCardsSchema),
  getMyCards
);

/**
 * GET /api/payment-cards/stats
 * Obtener estadísticas de tarjetas del usuario
 * Acceso: Todos los roles autenticados
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getCardStats
);

/**
 * DELETE /api/payment-cards/clean-expired
 * Limpiar tarjetas expiradas del usuario
 * Acceso: Todos los roles autenticados
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.delete(
  '/clean-expired',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  cleanExpiredCards
);

/**
 * GET /api/payment-cards/:id
 * Obtener una tarjeta específica por ID
 * Acceso: Todos los roles autenticados (solo el dueño)
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getPaymentMethodCardByIdSchema),
  getCardById
);

/**
 * POST /api/payment-cards/:id/validate
 * Validar si una tarjeta es válida para usar en pago
 * Acceso: Todos los roles autenticados (solo el dueño)
 */
router.post(
  '/:id/validate',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getPaymentMethodCardByIdSchema),
  validateCard
);

/**
 * DELETE /api/payment-cards/:id
 * Eliminar una tarjeta
 * Acceso: Todos los roles autenticados (solo el dueño)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(deletePaymentMethodCardSchema),
  deleteCard
);

export default router;