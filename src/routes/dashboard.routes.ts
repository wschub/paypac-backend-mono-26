import { Router } from 'express';
import { getPaypacDashboard, getOrganizerDashboard, getOrganizerAppDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();


router.get(
  '/organizer/app',
  authenticate,
  authorizeRoles('ORGANIZER'),
  getOrganizerAppDashboard
);

/**
 * GET /api/dashboard/paypac
 * Dashboard PAYPAC — snapshot del mes actual
 */
router.get(
  '/paypac',
  authenticate,
  authorizeRoles('PAYPAC'),
  getPaypacDashboard
);

/**
 * GET /api/dashboard/organizer
 * Dashboard ORGANIZER — snapshot del mes actual, filtrado por su empresa
 */
router.get(
  '/organizer',
  authenticate,
  authorizeRoles('ORGANIZER'),
  getOrganizerDashboard
);

export default router;