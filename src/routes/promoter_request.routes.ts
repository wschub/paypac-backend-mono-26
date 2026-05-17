import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  applyToBePromoter,
  getMyRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from '../controllers/promoter_request.controller';

const router = Router();

// POST   /api/promoter-requests            → aplicar (CUSTOMER)
// GET    /api/promoter-requests/my-request → ver mi solicitud (cualquier rol)
// GET    /api/promoter-requests            → listar todas (PAYPAC)
// PATCH  /api/promoter-requests/:id/approve → aprobar (PAYPAC)
// PATCH  /api/promoter-requests/:id/reject  → rechazar (PAYPAC)

router.post(
  '/',
  authenticate,
  authorizeRoles('CUSTOMER', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'),
  applyToBePromoter
);

router.get(
  '/my-request',
  authenticate,
  authorizeRoles('CUSTOMER', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'),
  getMyRequest
);

router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  getAllRequests
);

router.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('PAYPAC'),
  approveRequest
);

router.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('PAYPAC'),
  rejectRequest
);

export default router;
