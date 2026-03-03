import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createRow,
  getRowsByZone,
  getRowById,
  updateRow,
  deleteRow,
} from '../controllers/event_place_row.controller';
import {
  createRowSchema,
  updateRowSchema,
  getRowByIdSchema,
  getRowsByZoneSchema,
} from '../validators/venue.validation';

const router = Router();

const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];

/**
 * GET /api/venues/rows/by-zone/:zone_id
 * Filas de una zona con conteo de sillas
 * Acceso: roles internos
 * ⚠️ Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get(
  '/by-zone/:zone_id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getRowsByZoneSchema),
  getRowsByZone
);

/**
 * GET /api/venues/rows/:id
 * Fila por ID con sillas incluidas
 * Acceso: roles internos
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getRowByIdSchema),
  getRowById
);

/**
 * POST /api/venues/rows
 * Crear fila dentro de una zona
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createRowSchema),
  createRow
);

/**
 * PUT /api/venues/rows/:id
 * Actualizar fila
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateRowSchema),
  updateRow
);

/**
 * DELETE /api/venues/rows/:id
 * Eliminar fila (solo si no tiene sillas)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getRowByIdSchema),
  deleteRow
);

export default router;