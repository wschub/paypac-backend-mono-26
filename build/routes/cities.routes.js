"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cities_controller_1 = require("../controllers/cities.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const cities_validation_1 = require("../validators/cities.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/cities
 * Listar ciudades con filtros opcionales (?search=&country_id=&state_id=)
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(cities_validation_1.getCitiesQuerySchema), cities_controller_1.getCities);
/**
 * GET /api/cities/stats
 * Estadísticas (?country_id=&state_id= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(cities_validation_1.getCitiesStatsSchema), cities_controller_1.getCitiesStats);
/**
 * GET /api/cities/by-country/:country_id
 * Ciudades de un país directamente, sin pasar por estados
 * Retorna las ciudades agrupadas con su estado como referencia
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-country/:country_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(cities_validation_1.getCitiesByCountrySchema), cities_controller_1.getCitiesByCountry);
/**
 * GET /api/cities/by-state/:state_id
 * Ciudades de un estado específico
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-state/:state_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(cities_validation_1.getCitiesByStateSchema), cities_controller_1.getCitiesByState);
/**
 * GET /api/cities/:id
 * Obtener ciudad por ID
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(cities_validation_1.getCityByIdSchema), cities_controller_1.getCityById);
/**
 * POST /api/cities
 * Crear una nueva ciudad
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(cities_validation_1.createCitySchema), cities_controller_1.createCity);
/**
 * PUT /api/cities/:id
 * Actualizar ciudad
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(cities_validation_1.updateCitySchema), cities_controller_1.updateCity);
/**
 * DELETE /api/cities/:id
 * Eliminar ciudad
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(cities_validation_1.getCityByIdSchema), cities_controller_1.deleteCity);
exports.default = router;
