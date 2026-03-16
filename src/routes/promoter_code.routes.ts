import { Router } from 'express';
import {
  createMyCode,
  getMyCode,
  getMyStats,
  validateCode,
  getAllCodes,
  toggleActive,
  deleteCode,
} from '../controllers/promoter_code.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCodeSchema,
  codeParamSchema,
  idParamSchema,
} from '../validators/promoter_code.validation';

const router = Router();

/**
 * GET /api/promoter-codes/my-code
 * Obtener mi código de promotor — ANTES de /:id
 */
router.get(
  '/my-code',
  authenticate,
  authorizeRoles('PROMOTER'),
  getMyCode
);

/**
 * GET /api/promoter-codes/my-stats
 * Estadísticas de ventas del promotor autenticado
 */
router.get(
  '/my-stats',
  authenticate,
  authorizeRoles('PROMOTER'),
  getMyStats
);

/**
 * GET /api/promoter-codes/validate/:code
 * Validar código al momento de la compra — todos los roles autenticados
 * Usado por el checkout en la app del cliente
 */
router.get(
  '/validate/:code',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'PROMOTER', 'CUSTOMER', 'STAFF', 'STAFF_PROMOTER'),
  validateRequest(codeParamSchema),
  validateCode
);

/**
 * POST /api/promoter-codes
 * Crear mi código de promotor
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PROMOTER', 'PAYPAC'),
  validateRequest(createCodeSchema),
  createMyCode
);

/**
 * GET /api/promoter-codes
 * Listar todos los códigos — PAYPAC only
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  getAllCodes
);

/**
 * PATCH /api/promoter-codes/:id/toggle
 * Activar/desactivar código — PAYPAC only
 */
router.patch(
  '/:id/toggle',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(idParamSchema),
  toggleActive
);

/**
 * DELETE /api/promoter-codes/:id
 * Eliminar código — PAYPAC only
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(idParamSchema),
  deleteCode
);

export default router;