import { Router } from 'express';
import {
  createRewardRule,
  getRewardRulesByEventId,
  getRewardRuleById,
  updateRewardRule,
  deleteRewardRule,
  calculateReward,
} from '../controllers/eventrewardrules.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createRewardRuleSchema,
  updateRewardRuleSchema,
  getRewardRuleByIdSchema,
  getRewardRulesByEventIdSchema,
  calculateRewardSchema,
} from '../validators/eventrewardrules.validation';

const router = Router();

/**
 * POST /api/events/:eventId/reward-rules
 * Crear una nueva regla de recompensa para un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post(
  '/events/:eventId/reward-rules',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(createRewardRuleSchema),
  createRewardRule
);

/**
 * GET /api/events/:eventId/reward-rules
 * Obtener todas las reglas de recompensa de un evento
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/events/:eventId/reward-rules',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getRewardRulesByEventIdSchema),
  getRewardRulesByEventId
);

/**
 * POST /api/reward-rules/calculate
 * Calcular recompensa para una venta
 * Acceso: Todos los roles autenticados (útil para testing)
 * 
 * Body:
 * - event_id: number
 * - quantity: number
 * - total_amount: number
 * - locality_id?: number
 */
router.post(
  '/reward-rules/calculate',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'),
  validateRequest(calculateRewardSchema),
  calculateReward
);

/**
 * GET /api/reward-rules/:id
 * Obtener una regla específica por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/reward-rules/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getRewardRuleByIdSchema),
  getRewardRuleById
);

/**
 * PUT /api/reward-rules/:id
 * Actualizar una regla de recompensa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put(
  '/reward-rules/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(updateRewardRuleSchema),
  updateRewardRule
);

/**
 * DELETE /api/reward-rules/:id
 * Eliminar una regla de recompensa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete(
  '/reward-rules/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getRewardRuleByIdSchema),
  deleteRewardRule
);

export default router;