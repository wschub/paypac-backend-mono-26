import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  inviteGuest,
  getGuests,
  confirmGuest,
  rejectGuest,
  removeGuest,
  bulkInviteGuests,
} from '../controllers/event_private_guest.controller';

const router = Router({ mergeParams: true });

const staff = authorizeRoles('PAYPAC', 'ORGANIZER');

// POST   /api/events/:eventId/guest-list          → invitar
// GET    /api/events/:eventId/guest-list          → listar
// PATCH  /api/events/:eventId/guest-list/:guestId/confirm → confirmar
// PATCH  /api/events/:eventId/guest-list/:guestId/reject  → rechazar
// DELETE /api/events/:eventId/guest-list/:guestId         → eliminar

router.post  ('/',                       authenticate, staff, inviteGuest);
router.post  ('/bulk',                   authenticate, staff, bulkInviteGuests);
router.get   ('/',                       authenticate, staff, getGuests);
router.patch ('/:guestId/confirm',       authenticate, staff, confirmGuest);
router.patch ('/:guestId/reject',        authenticate, staff, rejectGuest);
router.delete('/:guestId',              authenticate, staff, removeGuest);

export default router;
