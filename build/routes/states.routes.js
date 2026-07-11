"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const states_controller_1 = require("../controllers/states.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const states_validation_1 = require("../validators/states.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/states
 * Listar estados con filtros opcionales (?search=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(states_validation_1.getStatesQuerySchema), states_controller_1.getStates);
/**
 * GET /api/states/stats
 * Estadísticas de estados (?country_id= opcional)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(states_validation_1.getStatesStatsSchema), states_controller_1.getStatesStats);
/**
 * GET /api/states/by-country/:country_id
 * Estados de un país específico con sus ciudades anidadas
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-country/:country_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(states_validation_1.getStatesByCountrySchema), states_controller_1.getStatesByCountry);
/**
 * GET /api/states/:id
 * Obtener estado por ID con sus ciudades
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(states_validation_1.getStateByIdSchema), states_controller_1.getStateById);
/**
 * POST /api/states
 * Crear un nuevo estado
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(states_validation_1.createStateSchema), states_controller_1.createState);
/**
 * PUT /api/states/:id
 * Actualizar estado (nombre y/o país)
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(states_validation_1.updateStateSchema), states_controller_1.updateState);
/**
 * DELETE /api/states/:id
 * Eliminar estado (solo si no tiene ciudades)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(states_validation_1.getStateByIdSchema), states_controller_1.deleteState);
exports.default = router;
