"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const countries_controller_1 = require("../controllers/countries.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const countries_validation_1 = require("../validators/countries.validation");
const router = (0, express_1.Router)();
// Roles con acceso de lectura
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/countries
 * Listar países con filtros opcionales
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(countries_validation_1.getCountriesQuerySchema), countries_controller_1.getCountries);
/**
 * GET /api/countries/with-relations
 * Listar países con jerarquía completa: estados → ciudades
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get('/with-relations', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), countries_controller_1.getCountriesWithRelations);
/**
 * GET /api/countries/stats
 * Estadísticas de países, estados y ciudades
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), countries_controller_1.getCountriesStats);
/**
 * GET /api/countries/:id
 * Obtener país por ID con estados y ciudades anidados
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(countries_validation_1.getCountryByIdSchema), countries_controller_1.getCountryById);
/**
 * POST /api/countries
 * Crear un nuevo país
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(countries_validation_1.createCountrySchema), countries_controller_1.createCountry);
/**
 * PUT /api/countries/:id
 * Actualizar país
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(countries_validation_1.updateCountrySchema), countries_controller_1.updateCountry);
/**
 * DELETE /api/countries/:id
 * Eliminar país (solo si no tiene estados, ciudades o categorías)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(countries_validation_1.getCountryByIdSchema), countries_controller_1.deleteCountry);
exports.default = router;
