import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createZone,
  getZonesByPlace,
  getZoneById,
  updateZone,
  deleteZone,
} from '../controllers/event_place_zone.controller';
import {
  createZoneSchema,
  updateZoneSchema,
  getZoneByIdSchema,
  getZonesByPlaceSchema,
} from '../validators/venue.validation';

const router = Router();

const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];

/**
 * GET /api/venues/zones/by-place/:place_id
 * Zonas de un lugar
 * Acceso: roles internos
 * ⚠️ Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get(
  '/by-place/:place_id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getZonesByPlaceSchema),
  getZonesByPlace
);

/**
 * GET /api/venues/zones/:id
 * Zona por ID con filas y conteos
 * Acceso: roles internos
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getZoneByIdSchema),
  getZoneById
);

/**
 * POST /api/venues/zones
 * Crear zona dentro de un lugar
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createZoneSchema),
  createZone
);

/**
 * PUT /api/venues/zones/:id
 * Actualizar zona
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateZoneSchema),
  updateZone
);

/**
 * DELETE /api/venues/zones/:id
 * Eliminar zona (solo si no tiene filas)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getZoneByIdSchema),
  deleteZone
);

export default router;