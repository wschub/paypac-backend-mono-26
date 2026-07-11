"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const company_validation_1 = require("../validators/company.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/companies
 * Listar empresas (resultados filtrados según rol)
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(company_validation_1.getCompaniesQuerySchema), company_controller_1.getCompanies);
/**
 * GET /api/companies/stats
 * Estadísticas (?country_id=&status= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(company_validation_1.getCompaniesStatsSchema), company_controller_1.getCompaniesStats);
/**
 * GET /api/companies/my-companies
 * Empresas del ORGANIZER autenticado
 * Acceso: ORGANIZER
 * ⚠️ Antes de /:id
 */
router.get('/my-companies', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER'), company_controller_1.getMyCompanies);
/**
 * GET /api/companies/my-profile
 * Retorna la empresa del ORGANIZER autenticado
 * Acceso: solo ORGANIZER
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/my-profile', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), company_controller_1.getMyCompany);
/**
 * GET /api/companies/:id
 * Empresa por ID
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(company_validation_1.getCompanyByIdSchema), company_controller_1.getCompanyById);
/*
 PROVISIONAL
*/
router.get('/:id/followers', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(company_validation_1.getCompanyByIdSchema), // reutiliza el mismo schema, valida :id
company_controller_1.getCompanyFollowers);
/**
 * POST /api/companies
 * Crear empresa
 * Acceso: PAYPAC | ORGANIZER
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(company_validation_1.createCompanySchema), company_controller_1.createCompany);
/**
 * PUT /api/companies/:id
 * Actualizar empresa
 * Acceso: PAYPAC | ORGANIZER (solo las suyas, solo si no está aprobada)
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(company_validation_1.updateCompanySchema), company_controller_1.updateCompany);
/**
 * PATCH /api/companies/:id/approve
 * Aprobar empresa
 * Acceso: solo PAYPAC
 */
router.patch('/:id/approve', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(company_validation_1.getCompanyByIdSchema), company_controller_1.approveCompany);
/**
 * PATCH /api/companies/:id/status
 * Cambiar status manualmente (0: pendiente, 1: aprobado, 2: suspendido)
 * Acceso: solo PAYPAC
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(company_validation_1.updateCompanyStatusSchema), company_controller_1.updateCompanyStatus);
/**
 * DELETE /api/companies/:id
 * Eliminar empresa (solo si no tiene usuarios asociados)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(company_validation_1.getCompanyByIdSchema), company_controller_1.deleteCompany);
exports.default = router;
