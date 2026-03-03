import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createSeat,
  createBulkSeats,
  getSeatsByRow,
  getSeatsByPlace,
  getSeatById,
  updateSeatStatus,
  deleteSeat,
} from '../controllers/event_place_seat.controller';
import {
  createSeatSchema,
  createBulkSeatsSchema,
  updateSeatStatusSchema,
  getSeatByIdSchema,
  getSeatsByRowSchema,
  getSeatsByPlaceSchema,
} from '../validators/venue.validation';

const router = Router();

const STAFF_UP  = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];
const PAYPAC_ORG = ['PAYPAC', 'ORGANIZER'];

/**
 * GET /api/venues/seats/by-row/:row_id
 * Sillas de una fila
 * Acceso: roles internos
 * ⚠️ Debe ir ANTES de /:id y de /bulk para evitar conflictos
 */
router.get(
  '/by-row/:row_id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getSeatsByRowSchema),
  getSeatsByRow
);

/**
 * GET /api/venues/seats/by-place/:place_id
 * Todas las sillas de un lugar (?status= opcional)
 * Acceso: PAYPAC y ORGANIZER
 */
router.get(
  '/by-place/:place_id',
  authenticate,
  authorizeRoles(...PAYPAC_ORG),
  validateRequest(getSeatsByPlaceSchema),
  getSeatsByPlace
);

/**
 * GET /api/venues/seats/:id
 * Silla por ID con jerarquía completa
 * Acceso: roles internos
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...STAFF_UP),
  validateRequest(getSeatByIdSchema),
  getSeatById
);

/**
 * POST /api/venues/seats
 * Crear silla individual
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createSeatSchema),
  createSeat
);

/**
 * POST /api/venues/seats/bulk
 * Crear múltiples sillas de una fila de golpe
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.post(
  '/bulk',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createBulkSeatsSchema),
  createBulkSeats
);

/**
 * PATCH /api/venues/seats/:id/status
 * Cambiar estado permanente: ACTIVE / BLOCKED_MAINTENANCE
 * Acceso: solo PAYPAC
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateSeatStatusSchema),
  updateSeatStatus
);

/**
 * DELETE /api/venues/seats/:id
 * Eliminar silla
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSeatByIdSchema),
  deleteSeat
);

export default router;