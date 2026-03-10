import { Router } from 'express';
import {
  followCompany,
  unfollowCompany,
  getCompanyFollowers,
  getFollowing,
  checkIsFollowing,
} from '../controllers/company_followers.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { companyIdParamSchema } from '../validators/company_followers.validation';

const router = Router();

const FOLLOWERS_ROLES = ['CUSTOMER', 'PROMOTER', 'STAFF', 'STAFF_PROMOTER'] as const;

/**
 * GET /api/companies/following
 * Empresas que sigo — debe ir ANTES de /:companyId
 */
router.get(
  '/following',
  authenticate,
  authorizeRoles(...FOLLOWERS_ROLES),
  getFollowing
);

/**
 * POST /api/companies/:companyId/follow
 */
router.post(
  '/:companyId/follow',
  authenticate,
  authorizeRoles(...FOLLOWERS_ROLES),
  validateRequest(companyIdParamSchema),
  followCompany
);

/**
 * DELETE /api/companies/:companyId/unfollow
 */
router.delete(
  '/:companyId/unfollow',
  authenticate,
  authorizeRoles(...FOLLOWERS_ROLES),
  validateRequest(companyIdParamSchema),
  unfollowCompany
);

/**
 * GET /api/companies/:companyId/followers
 * Ver seguidores de una empresa — PAYPAC y ORGANIZER
 */
router.get(
  '/:companyId/followers',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(companyIdParamSchema),
  getCompanyFollowers
);

/**
 * GET /api/companies/:companyId/is-following
 * Verificar si el usuario autenticado sigue esta empresa
 */
router.get(
  '/:companyId/is-following',
  authenticate,
  authorizeRoles(...FOLLOWERS_ROLES),
  validateRequest(companyIdParamSchema),
  checkIsFollowing
);

export default router;