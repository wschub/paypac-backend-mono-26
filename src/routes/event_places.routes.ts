import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createPlace,
  getPlaces,
  getPlaceById,
  getPlaceWithFullLayout,
  updatePlace,
  updatePlaceMap,
  deletePlace,
} from '../controllers/event_places.controller';
import {
  createPlaceSchema,
  updatePlaceSchema,
  updatePlaceMapSchema,
  getPlaceByIdSchema,
  getPlacesQuerySchema,
} from '../validators/venue.validation';

const router = Router();

const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];
const PAYPAC_ORG = ['PAYPAC', 'ORGANIZER'];

/**
 * GET /api/venues
 * Listar lugares con filtros opcionales (?search=&type_place=&place_type=)
 * Acceso: roles internos
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getPlacesQuerySchema),
  getPlaces
);

/**
 * GET /api/venues/:id
 * Detalle del lugar con zonas y conteos
 * Acceso: roles internos
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getPlaceByIdSchema),
  getPlaceById
);

/**
 * GET /api/venues/:id/layout
 * Layout completo: zones → rows → seats
 * Acceso: PAYPAC y ORGANIZER
 */
router.get(
  '/:id/layout',
  authenticate,
  authorizeRoles(...PAYPAC_ORG),
  validateRequest(getPlaceByIdSchema),
  getPlaceWithFullLayout
);

/**
 * POST /api/venues
 * Crear un lugar nuevo
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createPlaceSchema),
  createPlace
);

/**
 * PUT /api/venues/:id
 * Actualizar lugar
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updatePlaceSchema),
  updatePlace
);

/**
 * PATCH /api/venues/:id/map
 * Actualizar solo el JSON del mapa interactivo
 * Acceso: solo PAYPAC
 */
router.patch(
  '/:id/map',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updatePlaceMapSchema),
  updatePlaceMap
);

/**
 * DELETE /api/venues/:id
 * Eliminar lugar (solo si no tiene zonas ni eventos asociados)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getPlaceByIdSchema),
  deletePlace
);

export default router;