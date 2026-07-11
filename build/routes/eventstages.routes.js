"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventstages_controller_1 = require("../controllers/eventstages.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const eventstages_validation_1 = require("../validators/eventstages.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/localities/:localityId/stages
 * Crear una nueva etapa para una localidad
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post('/localities/:localityId/stages', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.createStageSchema), eventstages_controller_1.createStage);
/**
 * GET /api/localities/:localityId/stages
 * Obtener todas las etapas de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get('/localities/:localityId/stages', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStagesByLocalityIdSchema), eventstages_controller_1.getStagesByLocalityId);
/**
 * GET /api/localities/:localityId/stages/active
 * Obtener la etapa activa actual de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get('/localities/:localityId/stages/active', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStagesByLocalityIdSchema), eventstages_controller_1.getActiveStage);
/**
 * GET /api/localities/:localityId/stages/upcoming
 * Obtener próximas etapas de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get('/localities/:localityId/stages/upcoming', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStagesByLocalityIdSchema), eventstages_controller_1.getUpcomingStages);
/**
 * GET /api/localities/:localityId/stages/price-stats
 * Obtener estadísticas de precios de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get('/localities/:localityId/stages/price-stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStagesByLocalityIdSchema), eventstages_controller_1.getPriceStats);
/**
 * GET /api/stages/:id
 * Obtener una etapa específica por ID
 * Acceso: Todos los roles autenticados
 */
router.get('/stages/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStageByIdSchema), eventstages_controller_1.getStageById);
/**
 * GET /api/stages/:id/availability
 * Verificar disponibilidad de una etapa
 * Acceso: Todos los roles autenticados
 */
router.get('/stages/:id/availability', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStageByIdSchema), eventstages_controller_1.checkAvailability);
/**
 * PUT /api/stages/:id
 * Actualizar una etapa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put('/stages/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.updateStageSchema), eventstages_controller_1.updateStage);
/**
 * DELETE /api/stages/:id
 * Eliminar una etapa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete('/stages/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventstages_validation_1.getStageByIdSchema), eventstages_controller_1.deleteStage);
exports.default = router;
