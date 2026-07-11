"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_followers_controller_1 = require("../controllers/company_followers.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const company_followers_validation_1 = require("../validators/company_followers.validation");
const router = (0, express_1.Router)();
const FOLLOWERS_ROLES = ['CUSTOMER', 'PROMOTER', 'STAFF', 'STAFF_PROMOTER'];
/**
 * GET /api/companies/following
 * Empresas que sigo — debe ir ANTES de /:companyId
 */
router.get('/following', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...FOLLOWERS_ROLES), company_followers_controller_1.getFollowing);
/**
 * POST /api/companies/:companyId/follow
 */
router.post('/:companyId/follow', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...FOLLOWERS_ROLES), (0, validate_middleware_1.validateRequest)(company_followers_validation_1.companyIdParamSchema), company_followers_controller_1.followCompany);
/**
 * DELETE /api/companies/:companyId/unfollow
 */
router.delete('/:companyId/unfollow', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...FOLLOWERS_ROLES), (0, validate_middleware_1.validateRequest)(company_followers_validation_1.companyIdParamSchema), company_followers_controller_1.unfollowCompany);
/**
 * GET /api/companies/:companyId/followers
 * Ver seguidores de una empresa — PAYPAC y ORGANIZER
 */
router.get('/:companyId/followers', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(company_followers_validation_1.companyIdParamSchema), company_followers_controller_1.getCompanyFollowers);
/**
 * GET /api/companies/:companyId/is-following
 * Verificar si el usuario autenticado sigue esta empresa
 */
router.get('/:companyId/is-following', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...FOLLOWERS_ROLES), (0, validate_middleware_1.validateRequest)(company_followers_validation_1.companyIdParamSchema), company_followers_controller_1.checkIsFollowing);
exports.default = router;
