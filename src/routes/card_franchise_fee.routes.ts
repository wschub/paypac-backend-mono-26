import { Router } from 'express';
import {
  createFranchiseFee,
  getFranchiseFees,
  getFranchiseFeeById,
  updateFranchiseFee,
  deleteFranchiseFee,
} from '../controllers/card_franchise_fee.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createFranchiseFeeSchema,
  updateFranchiseFeeSchema,
  getFranchiseFeeByIdSchema,
  getFranchiseFeesQuerySchema,
} from '../validators/card_franchise_fee.validation';

const router = Router();

/**
 * Todas las rutas de este módulo son exclusivas de PAYPAC
 */

/**
 * GET /api/card-franchise-fees
 * Listar todas las comisiones por franquicia (?is_active= opcional)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getFranchiseFeesQuerySchema),
  getFranchiseFees
);

/**
 * GET /api/card-franchise-fees/:id
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getFranchiseFeeByIdSchema),
  getFranchiseFeeById
);

/**
 * POST /api/card-franchise-fees
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createFranchiseFeeSchema),
  createFranchiseFee
);

/**
 * PUT /api/card-franchise-fees/:id
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateFranchiseFeeSchema),
  updateFranchiseFee
);

/**
 * DELETE /api/card-franchise-fees/:id
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getFranchiseFeeByIdSchema),
  deleteFranchiseFee
);

export default router;
