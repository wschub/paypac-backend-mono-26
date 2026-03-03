import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  initializeSeatMap,
  getSeatMap,
  getSeatCountsByStatus,
  holdSeat,
  releaseSeat,
  blockSeat,
  releaseExpiredHolds,
} from '../controllers/event_seat_status.controller';
import {
  initializeSeatMapSchema,
  holdSeatSchema,
  releaseSeatSchema,
  blockSeatSchema,
  eventIdParamSchema,
} from '../validators/venue.validation';

const router = Router();

const ALL_ROLES  = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
const PAYPAC_ORG = ['PAYPAC', 'ORGANIZER'];

/**
 * POST /api/venues/seat-status/initialize
 * Inicializar todos los estados de sillas al aprobar un evento numerado
 * Acceso: PAYPAC y ORGANIZER
 * ⚠️ Rutas estáticas ANTES de /:event_id/*
 */
router.post(
  '/initialize',
  authenticate,
  authorizeRoles(...PAYPAC_ORG),
  validateRequest(initializeSeatMapSchema),
  initializeSeatMap
);

/**
 * POST /api/venues/seat-status/hold
 * Reservar silla en carrito — expira en 10 minutos
 * Acceso: todos los roles (CUSTOMER compra desde la app)
 */
router.post(
  '/hold',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(holdSeatSchema),
  holdSeat
);

/**
 * POST /api/venues/seat-status/release
 * Liberar silla del carrito manualmente
 * Acceso: todos los roles
 */
router.post(
  '/release',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(releaseSeatSchema),
  releaseSeat
);

/**
 * POST /api/venues/seat-status/block
 * Bloquear silla para un evento (cortesía, prensa, producción)
 * Acceso: PAYPAC y ORGANIZER
 */
router.post(
  '/block',
  authenticate,
  authorizeRoles(...PAYPAC_ORG),
  validateRequest(blockSeatSchema),
  blockSeat
);

/**
 * GET /api/venues/seat-status/:event_id/map
 * Mapa { seat_id: status } — usado por el mapa interactivo
 * Acceso: todos los roles (CUSTOMER necesita ver sillas disponibles)
 */
router.get(
  '/:event_id/map',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(eventIdParamSchema),
  getSeatMap
);

/**
 * GET /api/venues/seat-status/:event_id/counts
 * Conteo de sillas por estado para un evento
 * Acceso: PAYPAC y ORGANIZER
 */
router.get(
  '/:event_id/counts',
  authenticate,
  authorizeRoles(...PAYPAC_ORG),
  validateRequest(eventIdParamSchema),
  getSeatCountsByStatus
);

/**
 * POST /api/venues/seat-status/:event_id/release-expired
 * Liberar todos los HELD expirados de un evento
 * Acceso: solo PAYPAC (o job interno)
 */
router.post(
  '/:event_id/release-expired',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(eventIdParamSchema),
  releaseExpiredHolds
);

export default router;