import { Router } from 'express';
import {
  createLiquidation,
  getLiquidations,
  getLiquidationById,
  updateLiquidationStatus,
  getMyBalance,
  deleteLiquidation,
} from '../controllers/event_liquidation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createLiquidationSchema,
  updateLiquidationStatusSchema,
  liquidationIdParamSchema,
  liquidationQuerySchema,
} from '../validators/event_liquidation.validation';

const router = Router();

/**
 * GET /api/liquidations/my-balance
 * Balance del ORGANIZER autenticado — ANTES de /:id
 */
router.get(
  '/my-balance',
  authenticate,
  authorizeRoles('ORGANIZER'),
  getMyBalance
);

/**
 * GET /api/liquidations
 * PAYPAC: todas | ORGANIZER: solo las suyas
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(liquidationQuerySchema),
  getLiquidations
);

/**
 * POST /api/liquidations
 * Crear liquidación — PAYPAC only
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createLiquidationSchema),
  createLiquidation
);

/**
 * GET /api/liquidations/:id
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(liquidationIdParamSchema),
  getLiquidationById
);

/**
 * PATCH /api/liquidations/:id/status
 * Actualizar estado — PAYPAC only
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateLiquidationStatusSchema),
  updateLiquidationStatus
);

/**
 * DELETE /api/liquidations/:id
 * PAYPAC only
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(liquidationIdParamSchema),
  deleteLiquidation
);

export default router;