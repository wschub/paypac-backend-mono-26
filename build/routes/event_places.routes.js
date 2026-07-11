"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_places_controller_1 = require("../controllers/event_places.controller");
const venue_validation_1 = require("../validators/venue.validation");
const router = (0, express_1.Router)();
const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];
const PAYPAC_ORG = ['PAYPAC', 'ORGANIZER'];
/**
 * GET /api/venues
 * Listar lugares con filtros opcionales (?search=&type_place=&place_type=)
 * Acceso: roles internos
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getPlacesQuerySchema), event_places_controller_1.getPlaces);
/**
 * GET /api/venues/:id
 * Detalle del lugar con zonas y conteos
 * Acceso: roles internos
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getPlaceByIdSchema), event_places_controller_1.getPlaceById);
/**
 * GET /api/venues/:id/layout
 * Layout completo: zones → rows → seats
 * Acceso: PAYPAC y ORGANIZER
 */
router.get('/:id/layout', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...PAYPAC_ORG), (0, validate_middleware_1.validateRequest)(venue_validation_1.getPlaceByIdSchema), event_places_controller_1.getPlaceWithFullLayout);
/**
 * POST /api/venues
 * Crear un lugar nuevo
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.createPlaceSchema), event_places_controller_1.createPlace);
/**
 * PUT /api/venues/:id
 * Actualizar lugar
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.updatePlaceSchema), event_places_controller_1.updatePlace);
/**
 * PATCH /api/venues/:id/map
 * Actualizar solo el JSON del mapa interactivo
 * Acceso: solo PAYPAC
 */
router.patch('/:id/map', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.updatePlaceMapSchema), event_places_controller_1.updatePlaceMap);
/**
 * DELETE /api/venues/:id
 * Eliminar lugar (solo si no tiene zonas ni eventos asociados)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.getPlaceByIdSchema), event_places_controller_1.deletePlace);
exports.default = router;
