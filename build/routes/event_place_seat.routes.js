"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_place_seat_controller_1 = require("../controllers/event_place_seat.controller");
const venue_validation_1 = require("../validators/venue.validation");
const router = (0, express_1.Router)();
const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];
const PAYPAC_ORG = ['PAYPAC', 'ORGANIZER'];
/**
 * GET /api/venues/seats/by-row/:row_id
 * Sillas de una fila
 * Acceso: roles internos
 * ⚠️ Debe ir ANTES de /:id y de /bulk para evitar conflictos
 */
router.get('/by-row/:row_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getSeatsByRowSchema), event_place_seat_controller_1.getSeatsByRow);
/**
 * GET /api/venues/seats/by-place/:place_id
 * Todas las sillas de un lugar (?status= opcional)
 * Acceso: PAYPAC y ORGANIZER
 */
router.get('/by-place/:place_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...PAYPAC_ORG), (0, validate_middleware_1.validateRequest)(venue_validation_1.getSeatsByPlaceSchema), event_place_seat_controller_1.getSeatsByPlace);
/**
 * GET /api/venues/seats/:id
 * Silla por ID con jerarquía completa
 * Acceso: roles internos
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getSeatByIdSchema), event_place_seat_controller_1.getSeatById);
/**
 * POST /api/venues/seats
 * Crear silla individual
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.createSeatSchema), event_place_seat_controller_1.createSeat);
/**
 * POST /api/venues/seats/bulk
 * Crear múltiples sillas de una fila de golpe
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.post('/bulk', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.createBulkSeatsSchema), event_place_seat_controller_1.createBulkSeats);
/**
 * PATCH /api/venues/seats/:id/status
 * Cambiar estado permanente: ACTIVE / BLOCKED_MAINTENANCE
 * Acceso: solo PAYPAC
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.updateSeatStatusSchema), event_place_seat_controller_1.updateSeatStatus);
/**
 * DELETE /api/venues/seats/:id
 * Eliminar silla
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.getSeatByIdSchema), event_place_seat_controller_1.deleteSeat);
exports.default = router;
