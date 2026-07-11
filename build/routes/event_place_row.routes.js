"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_place_row_controller_1 = require("../controllers/event_place_row.controller");
const venue_validation_1 = require("../validators/venue.validation");
const router = (0, express_1.Router)();
const STAFF_UP = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'];
/**
 * GET /api/venues/rows/by-zone/:zone_id
 * Filas de una zona con conteo de sillas
 * Acceso: roles internos
 * ⚠️ Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get('/by-zone/:zone_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getRowsByZoneSchema), event_place_row_controller_1.getRowsByZone);
/**
 * GET /api/venues/rows/:id
 * Fila por ID con sillas incluidas
 * Acceso: roles internos
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...STAFF_UP), (0, validate_middleware_1.validateRequest)(venue_validation_1.getRowByIdSchema), event_place_row_controller_1.getRowById);
/**
 * POST /api/venues/rows
 * Crear fila dentro de una zona
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.createRowSchema), event_place_row_controller_1.createRow);
/**
 * PUT /api/venues/rows/:id
 * Actualizar fila
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.updateRowSchema), event_place_row_controller_1.updateRow);
/**
 * DELETE /api/venues/rows/:id
 * Eliminar fila (solo si no tiene sillas)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(venue_validation_1.getRowByIdSchema), event_place_row_controller_1.deleteRow);
exports.default = router;
