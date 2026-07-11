"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventlocalities_controller_1 = require("../controllers/eventlocalities.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const eventlocalities_validation_1 = require("../validators/eventlocalities.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/events/:eventId/localities
 * Crear una nueva localidad para un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post('/events/:eventId/localities', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventlocalities_validation_1.createLocalitySchema), eventlocalities_controller_1.createLocality);
/**
 * GET /api/events/:eventId/localities
 * Obtener todas las localidades de un evento
 * Acceso: Todos los roles autenticados
 */
router.get('/events/:eventId/localities', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventlocalities_validation_1.getLocalitiesByEventIdSchema), eventlocalities_controller_1.getLocalitiesByEventId);
/**
 * GET /api/events/:eventId/localities/stats
 * Obtener estadísticas de localidades de un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.get('/events/:eventId/localities/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventlocalities_validation_1.getLocalitiesByEventIdSchema), eventlocalities_controller_1.getLocalitiesStats);
/**
 * GET /api/localities/:id
 * Obtener una localidad específica por ID
 * Acceso: Todos los roles autenticados
 */
router.get('/localities/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventlocalities_validation_1.getLocalityByIdSchema), eventlocalities_controller_1.getLocalityById);
/**
 * PUT /api/localities/:id
 * Actualizar una localidad
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put('/localities/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventlocalities_validation_1.updateLocalitySchema), eventlocalities_controller_1.updateLocality);
/**
 * DELETE /api/localities/:id
 * Eliminar una localidad
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete('/localities/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventlocalities_validation_1.getLocalityByIdSchema), eventlocalities_controller_1.deleteLocality);
exports.default = router;
