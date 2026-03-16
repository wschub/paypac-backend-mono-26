import { Router } from 'express';
import {
  createDiscount,
  getDiscountsByEventId,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
  calculateDiscount,
  getApplicableDiscounts,
  toggleDiscount
} from '../controllers/eventdcto.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createDiscountSchema,
  updateDiscountSchema,
  getDiscountByIdSchema,
  getDiscountsByEventIdSchema,
  validateDiscountSchema,
  calculateDiscountSchema,
  getApplicableDiscountsSchema,
} from '../validators/eventdcto.validation';

const router = Router();

/**
 * POST /api/events/:eventId/discounts
 * Crear un nuevo descuento para un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post(
  '/events/:eventId/discounts',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(createDiscountSchema),
  createDiscount
);

/**
 * GET /api/events/:eventId/discounts
 * Obtener todos los descuentos de un evento
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/events/:eventId/discounts',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getDiscountsByEventIdSchema),
  getDiscountsByEventId
);

/**
 * GET /api/events/:eventId/discounts/applicable
 * Obtener descuentos aplicables para una cantidad de tickets
 * Acceso: Todos los roles autenticados
 * 
 * Query params:
 * - quantity: number (requerido)
 * - locality_id: number (opcional)
 */
router.get(
  '/events/:eventId/discounts/applicable',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getApplicableDiscountsSchema),
  getApplicableDiscounts
);

/**
 * POST /api/discounts/validate
 * Validar un código de descuento
 * Acceso: Todos los roles autenticados
 * 
 * Body:
 * - event_id: number
 * - discount_name: string
 * - quantity: number
 * - locality_id?: number
 */
router.post(
  '/discounts/validate',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(validateDiscountSchema),
  validateDiscount
);

/**
 * POST /api/discounts/calculate
 * Calcular monto de descuento
 * Acceso: Todos los roles autenticados
 * 
 * Body:
 * - total_amount: number
 * - discount_type: number (1: Porcentaje, 2: Monto fijo)
 * - discount_value: number
 */
router.post(
  '/discounts/calculate',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(calculateDiscountSchema),
  calculateDiscount
);

/**
 * GET /api/discounts/:id
 * Obtener un descuento específico por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/discounts/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getDiscountByIdSchema),
  getDiscountById
);

/**
 * PUT /api/discounts/:id
 * Actualizar un descuento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put(
  '/discounts/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(updateDiscountSchema),
  updateDiscount
);

//NEW
/**
 * PATCH /api/events/:eventId/discounts/:id/toggle
 * Activar/desactivar código de descuento
 * Acceso: ORGANIZER dueño o PAYPAC
 */
router.patch(
  '/:eventId/discounts/:id/toggle',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  toggleDiscount
);


/**
 * DELETE /api/discounts/:id
 * Eliminar un descuento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete(
  '/discounts/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getDiscountByIdSchema),
  deleteDiscount
);

export default router;