import { Router } from 'express';
import {
  createCompany,
  getCompanies,
  getCompaniesStats,
  getMyCompanies,
  getCompanyById,
  updateCompany,
  approveCompany,
  updateCompanyStatus,
  deleteCompany,
} from '../controllers/company.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCompanySchema,
  updateCompanySchema,
  getCompanyByIdSchema,
  updateCompanyStatusSchema,
  getCompaniesQuerySchema,
  getCompaniesStatsSchema,
} from '../validators/company.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/companies
 * Listar empresas (resultados filtrados según rol)
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCompaniesQuerySchema),
  getCompanies
);

/**
 * GET /api/companies/stats
 * Estadísticas (?country_id=&status= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCompaniesStatsSchema),
  getCompaniesStats
);

/**
 * GET /api/companies/my-companies
 * Empresas del ORGANIZER autenticado
 * Acceso: ORGANIZER
 * ⚠️ Antes de /:id
 */
router.get(
  '/my-companies',
  authenticate,
  authorizeRoles('ORGANIZER'),
  getMyCompanies
);

/**
 * GET /api/companies/:id
 * Empresa por ID
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCompanyByIdSchema),
  getCompanyById
);

/**
 * POST /api/companies
 * Crear empresa
 * Acceso: PAYPAC | ORGANIZER
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(createCompanySchema),
  createCompany
);

/**
 * PUT /api/companies/:id
 * Actualizar empresa
 * Acceso: PAYPAC | ORGANIZER (solo las suyas, solo si no está aprobada)
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(updateCompanySchema),
  updateCompany
);

/**
 * PATCH /api/companies/:id/approve
 * Aprobar empresa
 * Acceso: solo PAYPAC
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCompanyByIdSchema),
  approveCompany
);

/**
 * PATCH /api/companies/:id/status
 * Cambiar status manualmente (0: pendiente, 1: aprobado, 2: suspendido)
 * Acceso: solo PAYPAC
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateCompanyStatusSchema),
  updateCompanyStatus
);

/**
 * DELETE /api/companies/:id
 * Eliminar empresa (solo si no tiene usuarios asociados)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCompanyByIdSchema),
  deleteCompany
);

export default router;