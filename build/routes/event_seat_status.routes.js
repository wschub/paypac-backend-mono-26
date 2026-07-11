"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_seat_status_controller_1 = require("../controllers/event_seat_status.controller");
const venue_validation_1 = require("../validators/venue.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
const PAYPAC_ORG = ['PAYPAC', 'ORGANIZER'];
/**
 * POST /api/venues/seat-status/initialize
 * Inicializar todos los estados de sillas al aprobar un evento numerado
 * Acceso: PAYPAC y ORGANIZER
 * ⚠️ Rutas estáticas ANTES de /:event_id/*
 */
router.post('/initialize', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...PAYPAC_ORG), (0, validate_middleware_1.validateRequest)(venue_validation_1.initializeSeatMapSchema), event_seat_status_controller_1.initializeSeatMap);
/**
 * POST /api/venues/seat-status/hold
 * Reservar silla en carrito — expira en 10 minutos
 * Acceso: todos los roles (CUSTOMER compra desde la app)
 */
router.post('/hold', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(venue_validation_1.holdSeatSchema), event_seat_status_controller_1.holdSeat);
/**
 * POST /api/venues/seat-status/release
 * Liberar silla del carrito manualmente
 * Acceso: todos los roles
 */
router.post('/release', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(venue_validation_1.releaseSeatSchema), event_seat_status_controller_1.releaseSeat);
/**
 * POST /api/venues/seat-status/block
 * Bloquear silla para un evento (cortesía, prensa, producción)
 * Acceso: PAYPAC y ORGANIZER
 */
router.post('/block', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...PAYPAC_ORG), (0, validate_middleware_1.validateRequest)(venue_validation_1.blockSeatSchema), event_seat_status_controller_1.blockSeat);
/**
 * GET /api/venues/seat-status/:event_id/map
 * Mapa { seat_id: status } — usado por el mapa interactivo
 * Acceso: todos los roles (CUSTOMER necesita ver sillas disponibles)
 */
router.get('/:event_id/map', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(venue_validation_1.eventIdParamSchema), event_seat_status_controller_1.getSeatMap);
/**
 * GET /api/venues/seat-status/:event_id/counts
 * Conteo de sillas por estado para un evento
 * Acceso: PAYPAC y ORGANIZER
 */
router.get('/:event_id/counts', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...PAYPAC_ORG), (0, validate_middleware_1.validateRequest)(venue_validation_1.eventIdParamSchema), event_seat_status_controller_1.getSeatCountsByStatus);
/**
 * POST /api/venues/seat-status/:event_id/release-expired
 * Liberar todos los HELD expirados de un evento
 * Acceso: solo PAYPAC (o job interno)
 */
router.post('/:event_id/release-expired', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.eventIdParamSchema), event_seat_status_controller_1.releaseExpiredHolds);
exports.default = router;
