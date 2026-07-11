"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_place_zone_controller_1 = require("../controllers/event_place_zone.controller");
const venue_validation_1 = require("../validators/venue.validation");
const router = (0, express_1.Router)();
const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];
/**
 * GET /api/venues/zones/by-place/:place_id
 * Zonas de un lugar
 * Acceso: roles internos
 * ⚠️ Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get('/by-place/:place_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getZonesByPlaceSchema), event_place_zone_controller_1.getZonesByPlace);
/**
 * GET /api/venues/zones/:id
 * Zona por ID con filas y conteos
 * Acceso: roles internos
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getZoneByIdSchema), event_place_zone_controller_1.getZoneById);
/**
 * POST /api/venues/zones
 * Crear zona dentro de un lugar
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.createZoneSchema), event_place_zone_controller_1.createZone);
/**
 * PUT /api/venues/zones/:id
 * Actualizar zona
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.updateZoneSchema), event_place_zone_controller_1.updateZone);
/**
 * DELETE /api/venues/zones/:id
 * Eliminar zona (solo si no tiene filas)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.getZoneByIdSchema), event_place_zone_controller_1.deleteZone);
exports.default = router;
